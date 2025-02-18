import express, { Application } from 'express';
import cors from 'cors';
import path from 'path'; // Import the path module
import cron from 'node-cron';
import cartService from '../services/cartService';
import productRoutes from "../routes/productRoutes";
import authRoutes from '../routes/authRoutes';
import cartRoutes from "../routes/cartRoutes"
import productOffert from '../routes/productOffertRoutes'
import bannerRoutes from "../routes/bannerRoutes"

class Server {
  private app: Application;
  private port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '3000';

    this.middlewares();
    this.configureRoutes();
    this.setupCleanupJob();
  }

  middlewares() {
    this.app.use(cors()); // Habilita CORS
    this.app.use(express.json()); // Parsea el body de las solicitudes a JSON
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }
  private setupCleanupJob(): void {
    // Ejecutar cada 5 minutos
    cron.schedule('*/5 * * * *', async () => {
      console.log('Iniciando limpieza de carritos expirados...');
      try {
        await cartService.cleanExpiredCarts();
        console.log('Limpieza de carritos completada');
      } catch (error) {
        console.error('Error en la limpieza de carritos:', error);
      }
    });
  }
  private configureRoutes(): void {
    this.app.use('/api', productRoutes); // Usa las rutas de productos
    this.app.use('/api', authRoutes);
    this.app.use('/api', cartRoutes);
    this.app.use('/api', productOffert)
    this.app.use('/api', bannerRoutes)
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en http://localhost:${this.port}`);
    });
  }
}

export default Server;