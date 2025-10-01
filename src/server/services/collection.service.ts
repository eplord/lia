import { prisma } from '../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { Collection } from '@prisma/client';

interface CreateCollectionData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
}

interface UpdateCollectionData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
}

/**
 * Collection with children for tree structure
 */
interface CollectionTreeNode {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  isPublic: boolean;
  isShared: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    bookmarks: number;
    children: number;
  };
  children: CollectionTreeNode[];
}

export class CollectionService {
  /**
   * Create a new collection
   */
  async create(userId: string, data: CreateCollectionData): Promise<Collection> {
    const { name, description, icon, color, parentId } = data;

    // Check if collection with same name exists
    const existing = await prisma.collection.findFirst({
      where: {
        userId,
        name,
        parentId: parentId || null,
      },
    });

    if (existing) {
      throw new ConflictError('Collection with this name already exists in this location');
    }

    // If parentId is provided, verify it exists and belongs to user
    if (parentId) {
      const parent = await prisma.collection.findFirst({
        where: {
          id: parentId,
          userId,
        },
      });

      if (!parent) {
        throw new NotFoundError('Parent collection not found');
      }
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        icon,
        color,
        userId,
        parentId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookmarks: true,
            children: true,
          },
        },
      },
    });

    logger.info(`Collection created: ${collection.id} by user ${userId}`);

    return collection;
  }

  /**
   * Get all collections for a user (flat list)
   */
  async findAll(userId: string) {
    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            bookmarks: true,
            children: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { name: 'asc' },
      ],
    });

    return collections;
  }

  /**
   * Get collection tree (root collections with nested children)
   */
  async getTree(userId: string): Promise<CollectionTreeNode[]> {
    // Get all collections
    const collections = await this.findAll(userId);

    // Build tree structure
    const collectionMap = new Map<string, CollectionTreeNode>();
    const rootCollections: CollectionTreeNode[] = [];

    // First pass: create map of all collections
    collections.forEach((collection) => {
      collectionMap.set(collection.id, {
        ...collection,
        children: [],
      });
    });

    // Second pass: build tree
    collections.forEach((collection) => {
      const node = collectionMap.get(collection.id);
      if (node) {
        if (collection.parentId) {
          const parent = collectionMap.get(collection.parentId);
          if (parent) {
            parent.children.push(node);
          }
        } else {
          rootCollections.push(node);
        }
      }
    });

    return rootCollections;
  }

  /**
   * Get a single collection by ID
   */
  async findById(collectionId: string, userId: string): Promise<Collection> {
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId,
      },
      include: {
        parent: true,
        children: true,
        bookmarks: {
          select: {
            id: true,
            title: true,
            url: true,
            favicon: true,
            isPinned: true,
            createdAt: true,
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' },
          ],
        },
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    return collection;
  }

  /**
   * Update a collection
   */
  async update(
    collectionId: string,
    userId: string,
    data: UpdateCollectionData
  ): Promise<Collection> {
    // Check if collection exists and belongs to user
    await this.findById(collectionId, userId);

    // If changing parent, validate new parent
    if (data.parentId !== undefined) {
      if (data.parentId) {
        // Check if new parent exists and belongs to user
        const parent = await prisma.collection.findFirst({
          where: {
            id: data.parentId,
            userId,
          },
        });

        if (!parent) {
          throw new NotFoundError('Parent collection not found');
        }

        // Prevent circular references
        if (data.parentId === collectionId) {
          throw new BadRequestError('Collection cannot be its own parent');
        }

        // Check if new parent is a descendant of this collection
        const isDescendant = await this.isDescendant(collectionId, data.parentId);
        if (isDescendant) {
          throw new BadRequestError('Cannot move collection to its own descendant');
        }
      }
    }

    const collection = await prisma.collection.update({
      where: { id: collectionId },
      data,
      include: {
        parent: true,
        _count: {
          select: {
            bookmarks: true,
            children: true,
          },
        },
      },
    });

    logger.info(`Collection updated: ${collectionId}`);

    return collection;
  }

  /**
   * Delete a collection
   */
  async delete(collectionId: string, userId: string): Promise<void> {
    // Check if collection exists and belongs to user
    const collection = await this.findById(collectionId, userId);

    // Check if collection has children
    if (collection.children && collection.children.length > 0) {
      throw new BadRequestError('Cannot delete collection with sub-collections. Delete or move them first.');
    }

    // Bookmarks will be set to null (orphaned) due to onDelete: SetNull in schema
    await prisma.collection.delete({
      where: { id: collectionId },
    });

    logger.info(`Collection deleted: ${collectionId}`);
  }

  /**
   * Toggle pin status
   */
  async togglePin(collectionId: string, userId: string): Promise<Collection> {
    const collection = await this.findById(collectionId, userId);

    return await prisma.collection.update({
      where: { id: collectionId },
      data: { isPinned: !collection.isPinned },
      include: {
        _count: {
          select: {
            bookmarks: true,
            children: true,
          },
        },
      },
    });
  }

  /**
   * Get collection statistics
   */
  async getStats(collectionId: string, userId: string) {
    await this.findById(collectionId, userId);

    const [bookmarkCount, childCount, recentBookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: { collectionId },
      }),
      prisma.collection.count({
        where: { parentId: collectionId },
      }),
      prisma.bookmark.findMany({
        where: { collectionId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          url: true,
          favicon: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      bookmarkCount,
      childCount,
      recentBookmarks,
    };
  }

  /**
   * Check if targetId is a descendant of collectionId
   */
  private async isDescendant(collectionId: string, targetId: string): Promise<boolean> {
    const descendants = await this.getAllDescendants(collectionId);
    return descendants.includes(targetId);
  }

  /**
   * Get all descendant IDs of a collection
   */
  private async getAllDescendants(collectionId: string): Promise<string[]> {
    const descendants: string[] = [];
    const queue = [collectionId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await prisma.collection.findMany({
        where: { parentId: currentId },
        select: { id: true },
      });

      for (const child of children) {
        descendants.push(child.id);
        queue.push(child.id);
      }
    }

    return descendants;
  }
}

export const collectionService = new CollectionService();
