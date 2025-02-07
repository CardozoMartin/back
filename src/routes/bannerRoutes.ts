import { Router } from 'express';
import bannerController from '../controllers/bannerController';
import upload from '../config/multer';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Protege las rutas de productos con el middleware de autenticación
router.post('/banners', upload.single('imagen'), bannerController.createBanner);
router.get('/banners', bannerController.getBanners);
router.delete('/banners/:id', authMiddleware, bannerController.deleteBanner);

export default router;