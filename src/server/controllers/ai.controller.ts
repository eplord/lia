import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

/**
 * Generate tags for content
 */
export const generateTags = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, url, content, provider } = req.body;
  const userId = req.user?.id;

  if (!title && !description && !url && !content) {
    return res.status(400).json({
      success: false,
      error: { message: 'At least one of title, description, url, or content is required' },
    });
  }

  const tags = await aiService.generateTags(
    title || '',
    description || '',
    url || '',
    content,
    provider
  );

  res.status(200).json({
    success: true,
    data: {
      tags,
      count: tags.length,
    },
  });
});

/**
 * Suggest organization for bookmarks
 */
export const suggestOrganization = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { provider } = req.body;

  // Get user's bookmarks
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, isArchived: false },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
    take: 50, // Limit to avoid token limits
  });

  const bookmarkData = bookmarks.map((b) => ({
    title: b.title,
    description: b.description || undefined,
    tags: b.tags.map((t) => t.tag.name),
  }));

  const suggestions = await aiService.suggestOrganization(bookmarkData, provider);

  res.status(200).json({
    success: true,
    data: suggestions,
  });
});

/**
 * Generate summary for content
 */
export const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  const { content, provider } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      error: { message: 'Content is required' },
    });
  }

  const summary = await aiService.generateSummary(content, provider);

  res.status(200).json({
    success: true,
    data: {
      summary,
    },
  });
});

/**
 * Get AI service status
 */
export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const isEnabled = aiService.isEnabled();

  res.status(200).json({
    success: true,
    data: {
      enabled: isEnabled,
      provider: process.env.DEFAULT_AI_PROVIDER || 'openai',
      features: {
        tagging: process.env.ENABLE_AI_TAGGING === 'true',
        organization: process.env.ENABLE_AI_ORGANIZATION === 'true',
      },
    },
  });
});
