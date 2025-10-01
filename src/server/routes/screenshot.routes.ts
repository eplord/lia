import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { z } from 'zod';
import * as screenshotController from '../controllers/screenshot.controller';

const router = Router();

// Validation schemas
const captureScreenshotSchema = z.object({
  fullPage: z.boolean().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Routes
router.post('/:bookmarkId', authenticate, validate(captureScreenshotSchema), screenshotController.captureScreenshot);
router.get('/:bookmarkId', authenticate, screenshotController.getScreenshots);
router.delete('/:screenshotId', authenticate, screenshotController.deleteScreenshot);

export default router;
