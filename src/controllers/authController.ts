import { Request, Response } from 'express';
import authService from '../services/authService';

class AuthController {
  // Registrar un nuevo usuario
  async registerUser(req: Request, res: Response) {
    try {
      const user = await authService.registerUser(req.body);
      res.status(201).json({ message: 'Usuario registrado. Por favor, verifica tu correo electrónico.', user });
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
  }

  // Verificar el correo electrónico
  async verifyEmail(req: Request, res: Response) {
    try {
      const { codigoVerificacion } = req.params;
      await authService.verifyEmail(codigoVerificacion);
      res.status(200).json({ message: 'Correo electrónico verificado correctamente.' });
    } catch (error) {
      res.status(400).json({ message: 'Error al verificar el correo electrónico', error: error.message });
    }
  }

  // Login de usuario
  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const token = await authService.loginUser(email, password);
      res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  }
}

export default new AuthController();