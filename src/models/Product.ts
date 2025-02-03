import { Schema, Document, model } from 'mongoose';

export interface IProduct extends Document {
  nombre: string;
  precio: number;
  descripcion: string;
  material: string;
  color: string;
  stock: number;
  imagen?: string;
}

const ProductSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String, required: true },
  material: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  imagen: { type: String } // URL de la imagen en Cloudinary
});

export default model<IProduct>('Product', ProductSchema);