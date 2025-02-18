import { Request, Response } from 'express';
import cartService from '../services/cartService';
import emailService from '../services/emailService'; // Importa el servicio de correo
import mercadoPagoService from '../services/mercadoPagoService';

class CartController {
  // Crear un nuevo carrito
  async createCart(req: Request, res: Response) {
    try {
      const cartData = req.body;
      let cart;
      
      // Crear el carrito primero para ambos modos de pago
      if (cartData.modoPago === 'transferencia') {
        const bankDetails = {
          bankName: "Banco XYZ",
          accountNumber: "1234567890",
          accountHolder: "Bahía ACC"
        };
        
        // Crear el carrito con estado pendiente
        cart = await cartService.createCart({
          ...cartData,
          estadoPago: 'pendiente',
          estado: 'pendiente'
        });
        
        // Enviar email con los datos de la transferencia
        await emailService.sendPendingPaymentEmail(cart, bankDetails);
        
        return res.status(200).json({
          message: 'Carrito creado exitosamente',
          cartId: cart._id
        });
        
      } else if (cartData.modoPago === 'mercado_pago') {
        // Crear primero el carrito para descontar el stock
        cart = await cartService.createCart({
          ...cartData,
          estadoPago: 'pendiente',
          estado: 'pendiente'
        });
        
        // Crear el pago en MercadoPago
        const paymentResult = await mercadoPagoService.createPayment({
          ...cartData,
          cartId: cart._id // Asegurarse de pasar el ID del carrito creado
        });
        
        await emailService.sendOrderCreatedEmail(cart);
        
        if (!paymentResult || !paymentResult.paymentUrl) {
          // Si falla la creación del pago, revertir la creación del carrito
          await cartService.deleteCart(cart._id);
          return res.status(400).json({
            error: 'No se pudo crear el link de pago'
          });
        }
    
        return res.status(200).json({
          paymentUrl: paymentResult.paymentUrl,
          cartId: cart._id
        });
      } else {
        return res.status(400).json({
          error: 'Modo de pago no válido'
        });
      }

    } catch (error: any) {
      console.error('Error al crear el carrito:', error);
      return res.status(500).json({
        error: 'Error al crear el carrito',
        details: error.message
      });
    }
  }

  async handlePaymentWebhook(req: Request, res: Response) {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      console.log(`[${requestId}] 📌 Webhook recibido:`, JSON.stringify(req.body, null, 2));

      // Validar que el body contenga la información necesaria
      if (!req.body.data?.id) {
        console.error(`[${requestId}] ❌ Webhook recibido sin payment ID`);
        return res.status(400).json({ message: 'Payment ID no proporcionado' });
      }

      // Verificar que sea una notificación de pago válida
      if (!['payment.created', 'payment.updated'].includes(req.body.action)) {
        console.log(`[${requestId}] ⚠️ Acción no procesable:`, req.body.action);
        return res.status(200).send();
      }

      const paymentId = req.body.data.id;
      console.log(`[${requestId}] 📌 Procesando payment ID:`, paymentId);

      // Obtener estado e información del pago
      const [status, paymentInfo] = await Promise.all([
        mercadoPagoService.getPaymentStatus(paymentId),
        mercadoPagoService.getPaymentInfo(paymentId)
      ]);

      console.log(`[${requestId}] 📌 Estado del pago:`, status);
      console.log(`[${requestId}] 📌 Información del pago:`, JSON.stringify(paymentInfo, null, 2));

      if (!paymentInfo.external_reference) {
        throw new Error('External reference (cartId) no encontrado en la información del pago');
      }

      const cartId = paymentInfo.external_reference;
      const cart = await cartService.getCartById(cartId);

      if (!cart) {
        throw new Error(`Carrito no encontrado para ID: ${cartId}`);
      }

      console.log(`[${requestId}] 📌 Carrito encontrado:`, JSON.stringify(cart, null, 2));

      if (status === 'approved') {
        try {
          console.log(`[${requestId}] 📌 Iniciando actualización de stock y estado...`);
          
          // Actualizar stock y estado
          const updatedCart = await cartService.changeCartStatus(cartId, 'aceptado');
          
          if (!updatedCart) {
            throw new Error('Fallo al actualizar stock y estado del carrito');
          }

          console.log(`[${requestId}] ✅ Stock y estado actualizados correctamente`);

          // Actualizar estado del pago
          await cartService.updateCart(cartId, {
            estadoPago: 'pagado',
            paymentId
          });

          console.log(`[${requestId}] ✅ Estado del pago actualizado`);

          // Enviar emails
          await Promise.all([
            emailService.sendPaymentReceivedEmail(cart),
            emailService.sendOrderAcceptedEmail(cart)
          ]);

          console.log(`[${requestId}] ✅ Emails enviados correctamente`);
        } catch (error) {
          console.error(`[${requestId}] ❌ Error durante el proceso de actualización:`, error);
          throw error;
        }
      } else if (status === 'rejected') {
        console.log(`[${requestId}] 📌 Actualizando estado de pago a fallido`);
        await cartService.updateCart(cartId, {
          estadoPago: 'fallido',
          paymentId
        });
      }

      console.log(`[${requestId}] ✅ Webhook procesado correctamente`);
      return res.status(200).send();
    } catch (error) {
      console.error(`[${requestId}] ❌ Error al procesar webhook:`, error);
      return res.status(500).json({ 
        message: 'Error al procesar notificación de pago',
        error: error.message 
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
        if(estadoPedido === "en camino"){
          await emailService.sendOrderInTransitEmail(cart)
        }
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