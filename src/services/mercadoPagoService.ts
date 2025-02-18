import mercadopago from 'mercadopago';
import Product from '../models/Product';
import Cart, { ICart } from '../models/Cart';
import CartService from './CartService';
import emailService from './emailService';

class MercadoPagoService {
  constructor() {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.warn('Warning: MERCADO_PAGO_ACCESS_TOKEN no encontrado en variables de entorno');
    }

    mercadopago.configure({
      access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
  }

  async createPayment(cartData: any) {
    try {
      if (!cartData || !cartData.productos || !Array.isArray(cartData.productos)) {
        throw new Error('Estructura del carrito inválida');
      }

      // Crear y guardar el carrito primero
      const cart = new Cart({
        ...cartData,
        estado: 'pendiente',
        estadoPago: 'pendiente'
      });
      const savedCart = await cart.save();

      // Buscar productos en la base de datos
      const productosConDatos = await Promise.all(
        savedCart.productos.map(async (item: any) => {
          if (!item.productoId) {
            throw new Error('ID de producto requerido');
          }

          const producto = await Product.findById(item.productoId);
          if (!producto) {
            throw new Error(`Producto con ID ${item.productoId} no encontrado`);
          }

          return {
            title: producto.nombre,
            unit_price: Number(producto.precio),
            quantity: Number(item.cantidad),
            currency_id: "ARS",
          };
        })
      );

      if (!process.env.FRONTEND_URL || !process.env.BACKEND_URL) {
        throw new Error('FRONTEND_URL o BACKEND_URL no configurados');
      }

      const phoneNumber = savedCart.telefono.replace(/\D/g, '');

      const preference = {
        items: productosConDatos,
        external_reference: savedCart._id.toString(),
        back_urls: {
          success: `${process.env.FRONTEND_URL}/carrito/success`,
          failure: `${process.env.FRONTEND_URL}/carrito/failure`,
          pending: `${process.env.FRONTEND_URL}/carrito/pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL}/api/webhook`,
        payer: {
          email: savedCart.email,
          ...(phoneNumber && {
            phone: {
              area_code: phoneNumber.substring(0, 3),
              number: parseInt(phoneNumber.substring(3))
            }
          }),
          address: {
            street_name: savedCart.direccion
          }
        }
      };

      const result = await mercadopago.preferences.create(preference);
    

      if (!result?.body?.init_point) {
        await Cart.findByIdAndDelete(savedCart._id);
        throw new Error('La respuesta de MercadoPago no contiene init_point');
      }

      await Cart.findByIdAndUpdate(savedCart._id, {
        paymentUrl: result.body.init_point
      });

      return {
        paymentUrl: result.body.init_point,
        cartId: savedCart._id,
        statusCode: 200,
      };
    } catch (error: any) {
      console.error('Error al crear preferencia de pago:', {
        mensaje: error.message,
        carrito: cartData,
      });
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      const payment = await mercadopago.payment.get(paymentId);
      return payment.response.status;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentInfo(paymentId: string) {
    try {
      const payment = await mercadopago.payment.get(paymentId);
      return payment.response;
    } catch (error) {
      throw error;
    }
  }

  async handlePaymentUpdate(paymentId: string) {
    try {
      // Obtener información del pago
      const paymentInfo = await this.getPaymentInfo(paymentId);
      const cartId = paymentInfo.external_reference;
      const status = paymentInfo.status;

      console.log('📌 ID del carrito:', cartId);
      console.log('📌 Estado del pago:', status);

      // Buscar el carrito
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito no encontrado: ${cartId}`);
      }

      console.log('📌 Carrito encontrado:', cart);

      // Determinar el estado del pago
      let estadoPago = 'pendiente';
      if (status === 'approved') estadoPago = 'pagado';
      if (status === 'rejected') estadoPago = 'fallido';

      // Si el pago fue aprobado:
      if (status === 'approved') {
        try {
          console.log('📌 Iniciando proceso de actualización de stock');
          
          // Primero actualizamos el stock usando el servicio existente
          const updatedCart = await CartService.changeCartStatus(cartId, 'aceptado');
          if (!updatedCart) {
            throw new Error('Error al actualizar el stock');
          }
          console.log('📌 Stock actualizado correctamente');

          // Luego actualizamos el estado del pago
          await CartService.updateCart(cartId, {
            estadoPago,
            paymentId,
            estado: 'aceptado'
          });
          console.log('📌 Estado del pago actualizado');

          // Enviar email de confirmación
          await emailService.sendOrderAcceptedEmail(cart);
          console.log('📌 Email de confirmación enviado');

        } catch (error) {
          console.error('❌ Error en el proceso de actualización:', error);
          // Si hay un error en la actualización del stock, aún así actualizamos el estado del pago
          await CartService.updateCart(cartId, {
            estadoPago,
            paymentId,
            estado: 'aceptado'
          });
          throw error;
        }
      } else {
        // Si el pago no fue aprobado, solo actualizamos el estado del pago
        await CartService.updateCart(cartId, {
          estadoPago,
          paymentId
        });
      }

      console.log('📌 Proceso completado. Estado de pago:', estadoPago);

      return { 
        success: true, 
        status, 
        cartId,
        cartStatus: status === 'approved' ? 'aceptado' : cart.estado 
      };
    } catch (error) {
      console.error('❌ Error al procesar actualización de pago:', error);
      throw error;
    }
  }
}

export default new MercadoPagoService();