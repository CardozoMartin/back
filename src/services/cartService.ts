import Cart, { ICart } from '../models/Cart';
import Product from '../models/Product';
import mongoose from 'mongoose';

class CartService {
  // Crear un nuevo carrito con descuento de stock inmediato
  async createCart(cartData: ICart): Promise<ICart> {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Validar y descontar stock antes de crear el carrito
      for (const item of cartData.productos) {
        const producto = await Product.findById(item.productoId).session(session);
  
        if (!producto) {
          throw new Error(`Producto con ID ${item.productoId} no encontrado`);
        }
  
        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
        }
  
        // Descontar stock
        producto.stock -= item.cantidad;
        await producto.save({ session });
      }
  
      // Crear el carrito con un tiempo de expiración
      const cart = new Cart({
        ...cartData,
        createdAt: new Date()
      });
  
      await cart.save({ session });
      await session.commitTransaction();
  
      return cart;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error al crear el carrito:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Resto de métodos del servicio...
  async getCarts(): Promise<ICart[]> {
    return await Cart.find().populate('productos.productoId');
  }

  async getCartById(id: string): Promise<ICart | null> {
    return await Cart.findById(id).populate('productos.productoId');
  }

  async updateCart(id: string, cartData: Partial<ICart>): Promise<ICart | null> {
    return await Cart.findByIdAndUpdate(id, cartData, { new: true })
      .populate('productos.productoId');
  }

  async deleteCart(id: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cart = await Cart.findById(id).populate('productos.productoId');

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Si el carrito se elimina, devolver el stock
      for (const item of cart.productos) {
        const producto = await Product.findById(item.productoId).session(session);
        if (producto) {
          producto.stock += item.cantidad;
          await producto.save({ session });
        }
      }

      await Cart.findByIdAndDelete(id).session(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Ahora changeCartStatus solo actualiza estados, no modifica stock
  async changeCartStatus(id: string, estado: 'aceptado' | 'rechazado' | 'pendiente'): Promise<ICart | null> {
    const cart = await Cart.findById(id);

    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    if (estado === 'rechazado') {
      // Si se rechaza el carrito, devolver el stock
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        for (const item of cart.productos) {
          const producto = await Product.findById(item.productoId).session(session);
          if (producto) {
            producto.stock += item.cantidad;
            await producto.save({ session });
          }
        }

        cart.estado = estado;
        await cart.save({ session });
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      cart.estado = estado;
      await cart.save();
    }

    return cart;
  }

  async changeOrderStatus(id: string, estadoPedido: 'armando' | 'en camino' | 'entregado'): Promise<ICart | null> {
    return await Cart.findByIdAndUpdate(
      id,
      { estadoPedido },
      { new: true }
    ).populate('productos.productoId');
  }

  async getCartByPaymentId(paymentId: string): Promise<ICart | null> {
    return await Cart.findOne({ paymentId }).populate('productos.productoId');
  }

  // Nuevo método para limpiar carritos expirados
  async cleanExpiredCarts(): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const expiredCarts = await Cart.find({
        estado: 'pendiente',
        expiresAt: { $lt: new Date() }
      }).session(session);

      console.log(`Encontrados ${expiredCarts.length} carritos expirados`);

      for (const cart of expiredCarts) {
        // Devolver el stock de los productos
        for (const item of cart.productos) {
          const producto = await Product.findById(item.productoId).session(session);
          if (producto) {
            producto.stock += item.cantidad;
            await producto.save({ session });
            console.log(`Stock restaurado para producto ${producto._id}: +${item.cantidad}`);
          }
        }
        await Cart.findByIdAndDelete(cart._id).session(session);
        console.log(`Carrito eliminado: ${cart._id}`);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Error al limpiar carritos expirados:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new CartService();