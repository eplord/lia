import { Request, Response } from 'express';
import { importExportService } from '../services/import-export.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Import bookmarks
 */
export const importBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { format, data } = req.body;

  if (!format || !data) {
    return res.status(400).json({
      success: false,
      error: { message: 'Format and data are required' },
    });
  }

  if (!['html', 'json', 'csv'].includes(format)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid format. Must be html, json, or csv' },
    });
  }

  const results = await importExportService.importBookmarks(userId, format, data);

  // Create import record
  await importExportService.createImportRecord(userId, 'manual', format, results.imported);

  res.status(200).json({
    success: true,
    data: {
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors,
    },
  });
});

/**
 * Export bookmarks
 */
export const exportBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { format, collectionId, includeArchived } = req.query;

  if (!format || !['html', 'json', 'csv'].includes(format as string)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid format. Must be html, json, or csv' },
    });
  }

  const exportData = await importExportService.exportBookmarks(userId, format as string, {
    collectionId: collectionId as string,
    includeArchived: includeArchived === 'true',
  });

  // Count bookmarks (approximate from data)
  const itemCount = format === 'json' ? JSON.parse(exportData).length : 0;

  // Create export record
  await importExportService.createExportRecord(userId, format as string, itemCount);

  // Set appropriate content type and filename
  let contentType = 'text/plain';
  let fileExtension = 'txt';

  switch (format) {
    case 'html':
      contentType = 'text/html';
      fileExtension = 'html';
      break;
    case 'json':
      contentType = 'application/json';
      fileExtension = 'json';
      break;
    case 'csv':
      contentType = 'text/csv';
      fileExtension = 'csv';
      break;
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="bookmarks_${Date.now()}.${fileExtension}"`);
  res.send(exportData);
});

/**
 * Get import history
 */
export const getImportHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;

  const imports = await importExportService.getImportHistory?.(userId) || [];

  res.status(200).json({
    success: true,
    data: imports,
  });
});

/**
 * Get export history
 */
export const getExportHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;

  const exports = await importExportService.getExportHistory?.(userId) || [];

  res.status(200).json({
    success: true,
    data: exports,
  });
});
