import express, { Application } from 'express';
import cors from 'cors';
import path from 'path'; // Import the path module

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
  }

  middlewares() {
    const allowedOrigins = [
      "http://localhost:5173", 
      "https://bahiaacc.netlify.app"
    ];
  
    this.app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("No autorizado por CORS"));
        }
      },
      methods: "GET,POST,PUT,DELETE",
      allowedHeaders: "Content-Type,Authorization"
    }));
  
    this.app.use(express.json()); // Parsea el body de las solicitudes a JSON
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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