import { Router } from 'express';
import productController from '../controllers/productController';
import upload from '../config/multer';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Protege las rutas de productos con el middleware de autenticación
router.post('/products', upload.single('imagen'), productController.createProduct);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id',  productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

export default router;