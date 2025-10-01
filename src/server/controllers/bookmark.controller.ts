import { Request, Response } from 'express';
import { bookmarkService } from '../services/bookmark.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Create a new bookmark
 * POST /api/bookmarks
 */
export const createBookmark = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const bookmark = await bookmarkService.create(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    data: { bookmark },
  });
});

/**
 * Get all bookmarks
 * GET /api/bookmarks
 */
export const getBookmarks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const { page, limit, search, tags, collectionId, isPinned, isArchived } = req.query;

  const result = await bookmarkService.findAll(req.user.userId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string,
    tags: tags ? (tags as string).split(',') : undefined,
    collectionId: collectionId as string,
    isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
    isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * Get a single bookmark
 * GET /api/bookmarks/:id
 */
export const getBookmark = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const bookmark = await bookmarkService.findById(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    data: { bookmark },
  });
});

/**
 * Update a bookmark
 * PUT /api/bookmarks/:id
 */
export const updateBookmark = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const bookmark = await bookmarkService.update(req.params.id, req.user.userId, req.body);

  res.status(200).json({
    success: true,
    data: { bookmark },
  });
});

/**
 * Delete a bookmark
 * DELETE /api/bookmarks/:id
 */
export const deleteBookmark = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  await bookmarkService.delete(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    message: 'Bookmark deleted successfully',
  });
});

/**
 * Toggle pin status
 * POST /api/bookmarks/:id/pin
 */
export const togglePin = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const bookmark = await bookmarkService.togglePin(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    data: { bookmark },
    message: `Bookmark ${bookmark.isPinned ? 'pinned' : 'unpinned'}`,
  });
});

/**
 * Toggle archive status
 * POST /api/bookmarks/:id/archive
 */
export const toggleArchive = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
  }

  const bookmark = await bookmarkService.toggleArchive(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    data: { bookmark },
    message: `Bookmark ${bookmark.isArchived ? 'archived' : 'unarchived'}`,
  });
});
