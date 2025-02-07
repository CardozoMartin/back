import Banner, { IBanner } from '../models/Banners';

class BannerService {
  // Crear un nuevo producto
  async createBanner(bannerData: IBanner): Promise<IBanner> {
    const banner = new Banner(bannerData);
    return await banner.save();
  }

  // Obtener todos los productos
  async getBanner(): Promise<IBanner[]> {
    return await Banner.find();
  }

  // Eliminar un producto
  async deleteBanner(id: string): Promise<void> {
    await Banner.findByIdAndDelete(id);
  }
}

export default new BannerService();