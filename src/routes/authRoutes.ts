import { Router } from 'express';
import authController from '../controllers/authController';
import { validate } from '../middlewares/validationMiddleware';
import { registerSchema, loginSchema } from '../validations/userValidation';

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/auth/register', validate(registerSchema), authController.registerUser);

// Ruta para verificar el correo electrónico
router.get('/auth/verify/:codigoVerificacion', authController.verifyEmail);

// Ruta para el login
router.post('/auth/login', validate(loginSchema), authController.loginUser);

export default router;