import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { commonSchemas } from '../utils/validation';

const router = Router();

/**
 * Validation schemas
 */
const registerSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Password is required'),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: commonSchemas.password,
});

/**
 * Public routes
 */
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

/**
 * Protected routes (require authentication)
 */
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/password', authenticate, validate(updatePasswordSchema), authController.updatePassword);
router.post('/logout', authenticate, authController.logout);

export default router;
