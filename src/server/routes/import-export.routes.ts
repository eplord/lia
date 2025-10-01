import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { z } from 'zod';
import * as importExportController from '../controllers/import-export.controller';

const router = Router();

// Validation schemas
const importSchema = z.object({
  format: z.enum(['html', 'json', 'csv']),
  data: z.string(),
});

// Routes
router.post('/import', authenticate, validate(importSchema), importExportController.importBookmarks);
router.get('/export', authenticate, importExportController.exportBookmarks);
router.get('/import/history', authenticate, importExportController.getImportHistory);
router.get('/export/history', authenticate, importExportController.getExportHistory);

export default router;
