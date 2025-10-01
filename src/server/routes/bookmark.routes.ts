import { Router } from 'express';
import { z } from 'zod';
import * as bookmarkController from '../controllers/bookmark.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { commonSchemas } from '../utils/validation';

const router = Router();

/**
 * Validation schemas
 */
const createBookmarkSchema = z.object({
  url: commonSchemas.url,
  title: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  collectionId: commonSchemas.cuid.optional(),
});

const updateBookmarkSchema = z.object({
  url: commonSchemas.url.optional(),
  title: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  favicon: commonSchemas.url.optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  collectionId: commonSchemas.cuid.nullable().optional(),
});

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * Bookmark routes
 */
router.post('/', validate(createBookmarkSchema), bookmarkController.createBookmark);
router.get('/', bookmarkController.getBookmarks);
router.get('/:id', bookmarkController.getBookmark);
router.put('/:id', validate(updateBookmarkSchema), bookmarkController.updateBookmark);
router.delete('/:id', bookmarkController.deleteBookmark);

/**
 * Bookmark actions
 */
router.post('/:id/pin', bookmarkController.togglePin);
router.post('/:id/archive', bookmarkController.toggleArchive);

export default router;
