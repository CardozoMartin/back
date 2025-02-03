import Product, { IProduct } from '../models/Product';

class ProductService {
  // Crear un nuevo producto
  async createProduct(productData: IProduct): Promise<IProduct> {
    const product = new Product(productData);
    return await product.save();
  }

  // Obtener todos los productos
  async getProducts(): Promise<IProduct[]> {
    return await Product.find();
  }

  // Obtener un producto por ID
  async getProductById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  // Actualizar un producto
  async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(id, productData, { new: true });
  }

  // Eliminar un producto
  async deleteProduct(id: string): Promise<void> {
    await Product.findByIdAndDelete(id);
  }
}

export default new ProductService();