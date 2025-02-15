import { required } from 'joi';
import { Schema, Document, model } from 'mongoose';

export interface IProduct extends Document {
  nombre: string;
  precio: number;
  descripcion: string;
  material: string;
  color: string;
  stock: number;
  categoria:String;
  imagen?: string;
}

const ProductSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String, required: true },
  material: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  categoria:{type:String, required:true},
  imagen: { type: String } // URL de la imagen en Cloudinary
});

export default model<IProduct>('Product', ProductSchema);