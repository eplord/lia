import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const result = await authService.register({ email, password, name });

  res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authenticated' },
    });
  }

  const user = await authService.getUserById(req.user.userId);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * Update password
 * PUT /api/auth/password
 */
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authenticated' },
    });
  }

  const { currentPassword, newPassword } = req.body;

  await authService.updatePassword(req.user.userId, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // In a JWT-based system, logout is typically handled client-side by removing the token
  // This endpoint is here for consistency and can be extended with token blacklisting if needed

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
