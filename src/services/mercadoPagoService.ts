import mercadopago from 'mercadopago';
import Product from '../models/Product';
import Cart, { ICart } from '../models/Cart';

class MercadoPagoService {
  constructor() {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.warn('Warning: MERCADO_PAGO_ACCESS_TOKEN no encontrado en variables de entorno');
    }

    mercadopago.configure({
      access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1862830506680323-021518-3205302ed15403a2bacbe0c756ac2e31-2270163820',
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

      // Limpiar el número de teléfono de caracteres no numéricos
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
          // Solo incluir el teléfono si es un número válido
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
      console.log('Respuesta MP:', result);

      if (!result?.body?.init_point) {
        // Si falla, eliminar el carrito creado
        await Cart.findByIdAndDelete(savedCart._id);
        throw new Error('La respuesta de MercadoPago no contiene init_point');
      }

      // Actualizar el carrito con la URL de pago
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
      console.error('Error al obtener estado del pago:', error);
      throw error;
    }
  }
  async getPaymentInfo(paymentId: string) {
    try {
      const payment = await mercadopago.payment.get(paymentId);
      return payment.response;
    } catch (error) {
      console.error('Error al obtener información del pago:', error);
      throw error;
    }
  }
}

export default new MercadoPagoService();