import { Schema, model, Document } from 'mongoose';

export interface ICart extends Document {
  productos: Array<{ productoId: string; cantidad: number }>;
  direccion: string;
  email: string;
  telefono: string;
  estado: 'aceptado' | 'rechazado' | 'pendiente';
  estadoPedido?: 'armando' | 'en camino' | 'entregado';
}

const CartSchema = new Schema({
  productos: [{
    productoId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true }
  }],
  direccion: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  estado: { type: String, enum: ['aceptado', 'rechazado', 'pendiente'], default: 'pendiente' },
  estadoPedido: { type: String, enum: ['armando', 'en camino', 'entregado'] }
}, { timestamps: true });

export default model<ICart>('Cart', CartSchema);