import ProductOffert, { IProductOffert } from '../models/Promotio';

class ProductOfferService {
  // Crear un nuevo producto
  async createProduct(productData: IProductOffert): Promise<IProductOffert> {
    const product = new ProductOffert(productData);
    return await product.save();
  }

  // Obtener todos los productos
  async getProducts(): Promise<IProductOffert[]> {
    return await ProductOffert.find();
  }

  // Obtener un producto por ID
  async getProductById(id: string): Promise<IProductOffert | null> {
    return await ProductOffert.findById(id);
  }

  // Actualizar un producto
  async updateProduct(id: string, productData: Partial<IProductOffert>): Promise<IProductOffert | null> {
    return await ProductOffert.findByIdAndUpdate(id, productData, { new: true });
  }

  // Eliminar un producto
  async deleteProduct(id: string): Promise<void> {
    await ProductOffert.findByIdAndDelete(id);
  }
}

export default new ProductOfferService();