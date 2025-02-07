import { Router } from 'express';
import upload from '../config/multer';
import productOffertController from '../controllers/productOffertController';
import { authMiddleware } from '../middlewares/authMiddleware';  // Añadir esta importación

const router = Router();

// Rutas públicas
router.get('/products-offert', productOffertController.getProducts);

// Rutas protegidas con middleware de autenticación
router.post('/products/offert', upload.single('imagen'), productOffertController.createProduct);
router.get('/products-offert/:id', productOffertController.getProductById);
router.put('/products/offert/:id', authMiddleware, productOffertController.updateProduct);
router.delete('/products/offert/:id', authMiddleware, productOffertController.deleteProduct);

export default router;