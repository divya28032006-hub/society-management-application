import express from 'express';
import { AuthController } from './auth.controller';
import { protect } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { registerValidation, loginValidation } from './auth.validators';

const router = express.Router();

router.post('/register', validate(registerValidation), AuthController.register);
router.post('/login', validate(loginValidation), AuthController.login);
router.get('/me', protect, AuthController.getCurrentUser);
router.post('/logout', protect, AuthController.logout);

export default router;