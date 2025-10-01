import { Request, Response } from 'express';
import { screenshotService } from '../services/screenshot.service';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Capture screenshot for a bookmark
 */
export const captureScreenshot = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { bookmarkId } = req.params;
  const { fullPage, width, height } = req.body;

  // Verify bookmark exists and belongs to user
  const bookmark = await prisma.bookmark.findFirst({
    where: {
      id: bookmarkId,
      userId,
    },
  });

  if (!bookmark) {
    return res.status(404).json({
      success: false,
      error: { message: 'Bookmark not found' },
    });
  }

  const screenshot = await screenshotService.captureScreenshot(bookmark.url, bookmarkId, userId, {
    fullPage,
    width,
    height,
  });

  res.status(201).json({
    success: true,
    data: { screenshot },
  });
});

/**
 * Get screenshots for a bookmark
 */
export const getScreenshots = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { bookmarkId } = req.params;

  // Verify bookmark exists and belongs to user
  const bookmark = await prisma.bookmark.findFirst({
    where: {
      id: bookmarkId,
      userId,
    },
  });

  if (!bookmark) {
    return res.status(404).json({
      success: false,
      error: { message: 'Bookmark not found' },
    });
  }

  const screenshots = await screenshotService.getScreenshots(bookmarkId, userId);

  res.status(200).json({
    success: true,
    data: { screenshots },
  });
});

/**
 * Delete screenshot
 */
export const deleteScreenshot = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { screenshotId } = req.params;

  await screenshotService.deleteScreenshot(screenshotId, userId);

  res.status(200).json({
    success: true,
    message: 'Screenshot deleted successfully',
  });
});
