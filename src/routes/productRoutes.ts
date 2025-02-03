import { Router } from 'express';
import productController from '../controllers/productController';
import upload from '../config/multer';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Protege las rutas de productos con el middleware de autenticación
router.post('/products', upload.single('imagen'), productController.createProduct);
router.get('/products', productController.getProducts);
router.get('/products/:id', authMiddleware, productController.getProductById);
router.put('/products/:id', authMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

export default router;