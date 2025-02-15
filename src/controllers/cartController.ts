import { Request, Response } from 'express';
import cartService from '../services/cartService';
import emailService from '../services/emailService'; // Importa el servicio de correo
import mercadoPagoService from '../services/mercadoPagoService';

class CartController {
  // Crear un nuevo carrito
  async createCart(req: Request, res: Response) {
    try {
      const cartData = req.body;
      console.log(cartData)
      
      // Crear el carrito y el pago en MercadoPago
      const paymentResult = await mercadoPagoService.createPayment(cartData);
      
      if (!paymentResult || !paymentResult.paymentUrl) {
        return res.status(400).json({
          error: 'No se pudo crear el link de pago'
        });
      }
  
      return res.status(200).json({
        paymentUrl: paymentResult.paymentUrl,
        cartId: paymentResult.cartId
      });
    } catch (error: any) {
      console.error('Error al crear el carrito:', error);
      return res.status(500).json({
        error: 'Error al crear el carrito',
        details: error.message
      });
    }
  }

  async handlePaymentWebhook(req: Request, res: Response) {
    try {
      console.log('📌 Webhook recibido:', JSON.stringify(req.body, null, 2));
  
      // Verificar que sea una notificación de pago
      if (req.body.action === "payment.created" || req.body.action === "payment.updated") {
        const paymentId = req.body.data.id;
        console.log('📌 Payment ID recibido:', paymentId);
  
        // Obtener información completa del pago
        const paymentInfo = await mercadoPagoService.getPaymentInfo(paymentId);
        console.log('📌 Payment Info:', JSON.stringify(paymentInfo, null, 2));
  
        const cartId = paymentInfo.external_reference;
        console.log('📌 Cart ID from external_reference:', cartId);
  
        // Intentar obtener el carrito
        const cart = await cartService.getCartByExternalReference(cartId);
        
        if (!cart) {
          console.error('❌ Carrito no encontrado para external_reference:', cartId);
          return res.status(404).json({ 
            error: 'Cart not found',
            cartId,
            paymentId 
          });
        }
  
        console.log('📌 Carrito encontrado:', JSON.stringify(cart, null, 2));
  
        // Actualizar estado del pago
        const status = paymentInfo.status;
        let estadoPago = 'pendiente';
        if (status === 'approved') estadoPago = 'pagado';
        if (status === 'rejected') estadoPago = 'fallido';
  
        // Actualizar el carrito
        const updatedCart = await cartService.updateCart(cart._id, { 
          estadoPago, 
          paymentId 
        });
  
        if (!updatedCart) {
          throw new Error(`Failed to update cart ${cart._id} with payment status`);
        }
  
        // Si el pago fue aprobado, actualizar el estado del carrito
        if (status === 'approved') {
          await cartService.changeCartStatus(cart._id, 'aceptado');
          await emailService.sendOrderAcceptedEmail(cart);
        }
  
        return res.status(200).json({ 
          message: 'Webhook processed successfully',
          cartId: cart._id,
          status 
        });
      }
  
      return res.status(200).json({ message: 'Non-payment webhook received' });
    } catch (error) {
      console.error('❌ Error al procesar webhook:', error);
      return res.status(500).json({ 
        error: 'Error processing webhook',
        message: error.message 
      });
    }
  }

  // Obtener todos los carritos
  async getCarts(req: Request, res: Response) {
    try {
      const carts = await cartService.getCarts();
      res.status(200).json(carts);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los carritos' });
    }
  }

  // Obtener un carrito por ID
  async getCartById(req: Request, res: Response) {
    try {
      const cart = await cartService.getCartById(req.params.id);
      if (cart) {
        res.status(200).json(cart);
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el carrito' });
    }
  }

  // Actualizar un carrito
  async updateCart(req: Request, res: Response) {
    try {
      const cart = await cartService.updateCart(req.params.id, req.body);
      if (cart) {
        res.status(200).json(cart);
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el carrito' });
    }
  }

  // Eliminar un carrito
  async deleteCart(req: Request, res: Response) {
    try {
      await cartService.deleteCart(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el carrito' });
    }
  }

  // Cambiar el estado del carrito
  async changeCartStatus(req: Request, res: Response) {
    try {
      const { estado } = req.body;
      const cart = await cartService.changeCartStatus(req.params.id, estado);

      if (cart) {
        // Enviar correo según el estado del carrito
        if (estado === 'aceptado') {
          await emailService.sendOrderAcceptedEmail(cart);
        } else if (estado === 'rechazado') {
          await emailService.sendOrderCancelledEmail(cart);
        }

        res.status(200).json(cart);
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message || 'Error al cambiar el estado del carrito' });
    }
  }

  // Cambiar el estado del pedido
  async changeOrderStatus(req: Request, res: Response) {
    try {
      const { estadoPedido } = req.body;
      const cart = await cartService.changeOrderStatus(req.params.id, estadoPedido);

      if (cart) {
        // Enviar correo si el estado del pedido es "entregado"
        if (estadoPedido === 'entregado') {
          await emailService.sendOrderDeliveredEmail(cart);
        }

        res.status(200).json(cart);
      } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al cambiar el estado del pedido' });
    }
  }
}

export default new CartController();