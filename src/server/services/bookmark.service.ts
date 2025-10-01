import { prisma } from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { Bookmark, Tag } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { aiService } from './ai.service';
import { screenshotService } from './screenshot.service';

interface CreateBookmarkData {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  collectionId?: string;
  enableAI?: boolean;
  captureScreenshot?: boolean;
}

interface UpdateBookmarkData {
  title?: string;
  description?: string;
  url?: string;
  favicon?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  tags?: string[];
  collectionId?: string | null;
}

interface BookmarkMetadata {
  title: string;
  description: string;
  favicon: string;
  image?: string;
}

export class BookmarkService {
  /**
   * Create a new bookmark
   */
  async create(userId: string, data: CreateBookmarkData): Promise<Bookmark> {
    const { url, title, description, tags = [], collectionId, enableAI = true, captureScreenshot = false } = data;

    // Fetch metadata if title not provided
    let metadata: Partial<BookmarkMetadata> = {};
    if (!title) {
      try {
        metadata = await this.fetchMetadata(url);
      } catch (error) {
        logger.warn(`Failed to fetch metadata for ${url}: ${error}`);
      }
    }

    const finalTitle = title || metadata.title || url;
    const finalDescription = description || metadata.description;

    // Generate AI tags if enabled
    let aiTags: string[] = [];
    if (enableAI && aiService.isEnabled() && tags.length === 0) {
      try {
        aiTags = await aiService.generateTags(finalTitle, finalDescription || '', url);
        logger.info(`AI generated ${aiTags.length} tags for bookmark`);
      } catch (error) {
        logger.warn('Failed to generate AI tags:', error);
      }
    }

    // Merge manual and AI tags
    const finalTags = [...new Set([...tags, ...aiTags])];

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title: finalTitle,
        description: finalDescription,
        favicon: metadata.favicon,
        image: metadata.image,
        userId,
        collectionId,
      },
      include: {
        tags: true,
        collection: true,
      },
    });

    // Add tags
    if (finalTags.length > 0) {
      await this.addTags(bookmark.id, userId, finalTags);
    }

    // Capture screenshot in background if requested
    if (captureScreenshot) {
      screenshotService.captureScreenshot(url, bookmark.id, userId).catch((error) => {
        logger.error('Failed to capture screenshot:', error);
      });
    }

    logger.info(`Bookmark created: ${bookmark.id} by user ${userId}`);

    return bookmark;
  }

  /**
   * Get all bookmarks for a user with filters
   */
  async findAll(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      tags?: string[];
      collectionId?: string;
      isPinned?: boolean;
      isArchived?: boolean;
    } = {}
  ) {
    const {
      page = 1,
      limit = 20,
      search,
      tags,
      collectionId,
      isPinned,
      isArchived = false,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId,
      isArchived,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          name: { in: tags },
        },
      };
    }

    if (collectionId !== undefined) {
      where.collectionId = collectionId;
    }

    if (isPinned !== undefined) {
      where.isPinned = isPinned;
    }

    // Get bookmarks and total count
    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.bookmark.count({ where }),
    ]);

    return {
      data: bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single bookmark by ID
   */
  async findById(bookmarkId: string, userId: string): Promise<Bookmark> {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
      include: {
        tags: true,
        collection: true,
        highlights: true,
      },
    });

    if (!bookmark) {
      throw new NotFoundError('Bookmark not found');
    }

    return bookmark;
  }

  /**
   * Update a bookmark
   */
  async update(
    bookmarkId: string,
    userId: string,
    data: UpdateBookmarkData
  ): Promise<Bookmark> {
    // Check if bookmark exists and belongs to user
    await this.findById(bookmarkId, userId);

    const { tags, ...updateData } = data;

    // Update bookmark
    const bookmark = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: updateData,
      include: {
        tags: true,
        collection: true,
      },
    });

    // Update tags if provided
    if (tags) {
      // Remove existing bookmark-tag relationships
      await prisma.bookmarkTag.deleteMany({
        where: { bookmarkId },
      });

      // Add new tags
      await this.addTags(bookmarkId, userId, tags);
    }

    logger.info(`Bookmark updated: ${bookmarkId}`);

    return bookmark;
  }

  /**
   * Delete a bookmark
   */
  async delete(bookmarkId: string, userId: string): Promise<void> {
    // Check if bookmark exists and belongs to user
    await this.findById(bookmarkId, userId);

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });

    logger.info(`Bookmark deleted: ${bookmarkId}`);
  }

  /**
   * Toggle pin status
   */
  async togglePin(bookmarkId: string, userId: string): Promise<Bookmark> {
    const bookmark = await this.findById(bookmarkId, userId);

    return await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { isPinned: !bookmark.isPinned },
      include: {
        tags: true,
        collection: true,
      },
    });
  }

  /**
   * Toggle archive status
   */
  async toggleArchive(bookmarkId: string, userId: string): Promise<Bookmark> {
    const bookmark = await this.findById(bookmarkId, userId);

    return await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { isArchived: !bookmark.isArchived },
      include: {
        tags: true,
        collection: true,
      },
    });
  }

  /**
   * Add tags to a bookmark
   */
  private async addTags(bookmarkId: string, userId: string, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      // Find or create tag
      let tag = await prisma.tag.findFirst({
        where: {
          name: tagName.toLowerCase(),
          userId,
        },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName.toLowerCase(),
            userId,
          },
        });
      }

      // Create bookmark-tag relationship (skip if already exists)
      try {
        await prisma.bookmarkTag.create({
          data: {
            bookmarkId,
            tagId: tag.id,
          },
        });
      } catch (error) {
        // Ignore duplicate key errors
        logger.debug(`Tag ${tagName} already linked to bookmark ${bookmarkId}`);
      }
    }
  }

  /**
   * Fetch metadata from URL
   */
  private async fetchMetadata(url: string): Promise<BookmarkMetadata> {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LiaBot/1.0; +https://github.com/eplord/lia)',
        },
      });

      const $ = cheerio.load(response.data);

      // Extract metadata
      const title =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        '';

      const description =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '';

      const image =
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        '';

      // Try to get favicon
      let favicon =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        '';

      // Make favicon URL absolute
      if (favicon && !favicon.startsWith('http')) {
        const urlObj = new URL(url);
        favicon = `${urlObj.protocol}//${urlObj.host}${favicon.startsWith('/') ? '' : '/'}${favicon}`;
      } else if (!favicon) {
        // Default to root favicon
        const urlObj = new URL(url);
        favicon = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
      }

      return {
        title: title.trim(),
        description: description.trim(),
        favicon,
        image,
      };
    } catch (error) {
      logger.error(`Failed to fetch metadata for ${url}:`, error);
      throw new BadRequestError('Failed to fetch page metadata');
    }
  }
}

export const bookmarkService = new BookmarkService();
