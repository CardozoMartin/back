import { Request, Response } from 'express';
import bannerService from '../services/bannerService';
import upload from '../config/multer';
import cloudinary from '../config/cloudinary';
class BannerController {
  // Crear un nuevo producto
  async createBanner(req: Request, res: Response) {
    try {
      const bannerData = req.body;

      if (req.file) {
        try {
          // Convert the image to base64
          const b64 = Buffer.from(req.file.buffer).toString('base64');
          const dataURI = `data:${req.file.mimetype};base64,${b64}`;

          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'banner',
          });

          // Assign the Cloudinary URL to productData
          bannerData.imagen = result.secure_url;
        } catch (cloudinaryError) {
          console.error('Error uploading to Cloudinary:', cloudinaryError);
          return res.status(500).json({ message: 'Error al subir la imagen' });
        }
      }

      const banner = await bannerService.createBanner(bannerData);
      res.status(201).json(banner);
    } catch (error) {
      console.error('Error al crear el producto:', error);
      res.status(500).json({ 
        message: 'Error al crear el producto',
        error: error.message 
      });
    }
  }

  // Obtener todos los banners
  async getBanners(req: Request, res: Response) {
    try {
      const products = await bannerService.getBanner();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los productos' });
    }
  }


  // Eliminar un producto
  async deleteBanner(req: Request, res: Response) {
    try {
      await bannerService.deleteBanner(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  }
}

export default new BannerController();