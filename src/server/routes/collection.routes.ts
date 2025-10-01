import { Router } from 'express';
import { z } from 'zod';
import * as collectionController from '../controllers/collection.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { commonSchemas } from '../utils/validation';

const router = Router();

/**
 * Validation schemas
 */
const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  parentId: commonSchemas.cuid.optional(),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  parentId: commonSchemas.cuid.nullable().optional(),
});

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * Collection routes
 */
router.post('/', validate(createCollectionSchema), collectionController.createCollection);
router.get('/', collectionController.getCollections);
router.get('/tree', collectionController.getCollectionTree);
router.get('/:id', collectionController.getCollection);
router.put('/:id', validate(updateCollectionSchema), collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);

/**
 * Collection actions
 */
router.post('/:id/pin', collectionController.togglePin);
router.get('/:id/stats', collectionController.getStats);

export default router;
