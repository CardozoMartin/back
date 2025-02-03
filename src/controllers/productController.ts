import { Request, Response } from 'express';
import productService from '../services/productService';
import upload from '../config/multer';
import cloudinary from '../config/cloudinary';
class ProductController {
  // Crear un nuevo producto
  async createProduct(req: Request, res: Response) {
    try {
      const productData = req.body;

      if (req.file) {
        try {
          // Convert the image to base64
          const b64 = Buffer.from(req.file.buffer).toString('base64');
          const dataURI = `data:${req.file.mimetype};base64,${b64}`;

          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'products',
          });

          // Assign the Cloudinary URL to productData
          productData.imagen = result.secure_url;
        } catch (cloudinaryError) {
          console.error('Error uploading to Cloudinary:', cloudinaryError);
          return res.status(500).json({ message: 'Error al subir la imagen' });
        }
      }

      const product = await productService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error al crear el producto:', error);
      res.status(500).json({ 
        message: 'Error al crear el producto',
        error: error.message 
      });
    }
  }

  // Obtener todos los productos
  async getProducts(req: Request, res: Response) {
    try {
      const products = await productService.getProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los productos' });
    }
  }

  // Obtener un producto por ID
  async getProductById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el producto' });
    }
  }

  // Actualizar un producto
  async updateProduct(req: Request, res: Response) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el producto' });
    }
  }

  // Eliminar un producto
  async deleteProduct(req: Request, res: Response) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  }
}

export default new ProductController();