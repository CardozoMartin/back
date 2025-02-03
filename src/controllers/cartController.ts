import { Request, Response } from 'express';
import cartService from '../services/cartService';
import emailService from '../services/emailService'; // Importa el servicio de correo

class CartController {
  // Crear un nuevo carrito
  async createCart(req: Request, res: Response) {
    try {
      const cartData = req.body;
      const cart = await cartService.createCart(cartData);

      // Enviar correo de creación de pedido
      await emailService.sendOrderCreatedEmail(cart);

      res.status(201).json(cart);
    } catch (error) {
      console.error('Error al crear el carrito:', error);
      res.status(500).json({ message: 'Error al crear el carrito' });
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