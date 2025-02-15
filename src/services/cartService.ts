import Cart, { ICart } from '../models/Cart';
import Product from '../models/Product';
import mongoose from 'mongoose';

class CartService {
  // Crear un nuevo carrito
  async createCart(cartData: ICart): Promise<ICart> {
    const cart = new Cart(cartData);
    return await cart.save();
  }

  // Obtener todos los carritos
  async getCarts(): Promise<ICart[]> {
    return await Cart.find().populate('productos.productoId');
  }

  // Obtener un carrito por ID
  async getCartById(id: string): Promise<ICart | null> {
    return await Cart.findById(id).populate('productos.productoId');
  }

  // Actualizar un carrito
  async updateCart(id: string, cartData: Partial<ICart>): Promise<ICart | null> {
    return await Cart.findByIdAndUpdate(id, cartData, { new: true }).populate('productos.productoId');
  }

  // Eliminar un carrito
  async deleteCart(id: string): Promise<void> {
    await Cart.findByIdAndDelete(id);
  }

  // Validar stock de los productos en el carrito
  async validateStock(cart: ICart): Promise<boolean> {
    for (const item of cart.productos) {
      const producto = await Product.findById(item.productoId);

      if (!producto) {
        throw new Error(`Producto con ID ${item.productoId} no encontrado`);
      }

      if (producto.stock < item.cantidad) {
        return false; // No hay suficiente stock
      }
    }
    return true; // Hay suficiente stock para todos los productos
  }

  // Cambiar el estado del carrito
  async changeCartStatus(id: string, estado: 'aceptado' | 'rechazado' | 'pendiente'): Promise<ICart | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cart = await Cart.findById(id).populate('productos.productoId').session(session);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      if (estado === 'aceptado') {
        const hasEnoughStock = await this.validateStock(cart);
        if (!hasEnoughStock) {
          throw new Error('No hay suficiente stock para uno o más productos');
        }

        for (const item of cart.productos) {
          const producto = await Product.findById(item.productoId).session(session);

          if (!producto) {
            throw new Error(`Producto con ID ${item.productoId} no encontrado`);
          }

          producto.stock -= item.cantidad;
          await producto.save();
        }
      }

      cart.estado = estado;
      await cart.save();

      await session.commitTransaction();
      session.endSession();

      return cart;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Cambiar el estado del pedido
  async changeOrderStatus(id: string, estadoPedido: 'armando' | 'en camino' | 'entregado'): Promise<ICart | null> {
    return await Cart.findByIdAndUpdate(id, { estadoPedido }, { new: true }).populate('productos.productoId');
  }
  async getCartByPaymentId(paymentId: string): Promise<ICart | null> {
    return await Cart.findOne({ paymentId }).populate('productos.productoId');
  }

}

export default new CartService();