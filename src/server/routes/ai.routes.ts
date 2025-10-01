import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { z } from 'zod';
import * as aiController from '../controllers/ai.controller';

const router = Router();

// Validation schemas
const generateTagsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  content: z.string().optional(),
  provider: z.enum(['openai', 'anthropic', 'google', 'ollama']).optional(),
});

const suggestOrganizationSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google']).optional(),
});

const generateSummarySchema = z.object({
  content: z.string(),
  provider: z.enum(['openai', 'anthropic', 'google', 'ollama']).optional(),
});

// Routes
router.post('/tags', authenticate, validate(generateTagsSchema), aiController.generateTags);
router.post('/organize', authenticate, validate(suggestOrganizationSchema), aiController.suggestOrganization);
router.post('/summary', authenticate, validate(generateSummarySchema), aiController.generateSummary);
router.get('/status', authenticate, aiController.getStatus);

export default router;
