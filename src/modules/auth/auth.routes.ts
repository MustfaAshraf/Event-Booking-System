import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.validations.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { status: 'fail', message: 'Too many login attempts, please try again after 15 minutes' }
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', protect, authController.logout);
router.get('/refresh', authController.refresh);

router.get('/me', protect, authController.getMe);

export default router;