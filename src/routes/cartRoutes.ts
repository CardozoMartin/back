import express from 'express';
import cartController from '../controllers/cartController';

const router = express.Router();

router.post('/carts', cartController.createCart);
router.get('/carts', cartController.getCarts);
router.get('/carts/:id', cartController.getCartById);
router.put('/carts/:id', cartController.updateCart);
router.delete('/carts/:id', cartController.deleteCart);
router.patch('/carts/:id/status', cartController.changeCartStatus);
router.patch('/carts/:id/order-status', cartController.changeOrderStatus);

export default router;