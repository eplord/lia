import { Request, Response } from 'express';
import { collectionService } from '../services/collection.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Create a new collection
 * POST /api/collections
 */
export const createCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const collection = await collectionService.create(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    data: { collection },
  });
});

/**
 * Get all collections
 * GET /api/collections
 */
export const getCollections = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const collections = await collectionService.findAll(req.user.userId);

  res.status(200).json({
    success: true,
    data: { collections },
  });
});

/**
 * Get collection tree
 * GET /api/collections/tree
 */
export const getCollectionTree = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const tree = await collectionService.getTree(req.user.userId);

  res.status(200).json({
    success: true,
    data: { tree },
  });
});

/**
 * Get a single collection
 * GET /api/collections/:id
 */
export const getCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const collection = await collectionService.findById(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    data: { collection },
  });
});

/**
 * Update a collection
 * PUT /api/collections/:id
 */
export const updateCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const collection = await collectionService.update(req.params.id, req.user.userId, req.body);

  res.status(200).json({
    success: true,
    data: { collection },
  });
});

/**
 * Delete a collection
 * DELETE /api/collections/:id
 */
export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  await collectionService.delete(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    message: 'Collection deleted successfully',
  });
});

/**
 * Toggle pin status
 * POST /api/collections/:id/pin
 */
export const togglePin = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const collection = await collectionService.togglePin(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    data: { collection },
    message: `Collection ${collection.isPinned ? 'pinned' : 'unpinned'}`,
  });
});

/**
 * Get collection statistics
 * GET /api/collections/:id/stats
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const stats = await collectionService.getStats(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});
