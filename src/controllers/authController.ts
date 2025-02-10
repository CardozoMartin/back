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
      
      // En lugar de enviar JSON, enviamos HTML
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verificación Exitosa - Bahía ACC</title>
            <style>
              body {
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: #f3f4f6;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              .container {
                background-color: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 90%;
              }
              h2 {
                color: #004aad;
                margin-bottom: 1rem;
              }
              .success-icon {
                color: #004aad;
                font-size: 48px;
                margin-bottom: 1rem;
              }
              .loading {
                margin-top: 1rem;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✓</div>
              <h2>¡Verificación Exitosa!</h2>
              <p>Tu correo electrónico ha sido verificado correctamente.</p>
              <p>Bienvenido a Bahía ACC</p>
              <p class="loading">Redirigiendo al inicio de sesión...</p>
              <script>
                setTimeout(() => {
                  window.location.href = '/login'; // Ajusta esta URL según tu frontend
                }, 3000);
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      // También enviamos HTML en caso de error
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error de Verificación - Bahía ACC</title>
            <style>
              body {
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: #f3f4f6;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              .container {
                background-color: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 90%;
              }
              h2 {
                color: #dc2626;
                margin-bottom: 1rem;
              }
              .error-icon {
                color: #dc2626;
                font-size: 48px;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">✕</div>
              <h2>Error de Verificación</h2>
              <p>No se pudo verificar tu correo electrónico.</p>
              <p>${error.message}</p>
              <p>Por favor, intenta nuevamente o contacta con soporte.</p>
              <script>
                setTimeout(() => {
                  window.location.href = '/login'; // Ajusta esta URL según tu frontend
                }, 3000);
              </script>
            </div>
          </body>
        </html>
      `);
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