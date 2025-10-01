import { prisma } from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { Bookmark, Tag } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface CreateBookmarkData {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  collectionId?: string;
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
    const { url, title, description, tags = [], collectionId } = data;

    // Fetch metadata if title not provided
    let metadata: Partial<BookmarkMetadata> = {};
    if (!title) {
      try {
        metadata = await this.fetchMetadata(url);
      } catch (error) {
        logger.warn(`Failed to fetch metadata for ${url}: ${error}`);
      }
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title: title || metadata.title || url,
        description: description || metadata.description,
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
    if (tags.length > 0) {
      await this.addTags(bookmark.id, userId, tags);
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
            select: {
              id: true,
              name: true,
              color: true,
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
      // Remove existing tags
      await prisma.bookmark.update({
        where: { id: bookmarkId },
        data: {
          tags: {
            set: [],
          },
        },
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

      // Connect tag to bookmark
      await prisma.bookmark.update({
        where: { id: bookmarkId },
        data: {
          tags: {
            connect: { id: tag.id },
          },
        },
      });
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
