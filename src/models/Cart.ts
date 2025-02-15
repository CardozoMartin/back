import { required } from 'joi';
import { Schema, model, Document } from 'mongoose';

export interface ICart extends Document {
  productos: Array<{ productoId: string; cantidad: number }>;
  direccion: string;
  email: string;
  telefono: string;
  codigoPostal: string;
  descripcion: string;
  modoPago: 'transferencia' | "mercado_pago"
  estado: 'aceptado' | 'rechazado' | 'pendiente';
  estadoPedido?: 'armando' | 'en camino' | 'entregado';
  idUser?: string;

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
  estadoPedido: { type: String, enum: ['armando', 'en camino', 'entregado'] },
  idUser: { type: String, },
  codigoPostal: { type: String },
  descripcion: { type: String },
  modoPago:{type: String, enum:['transferencia', 'mercado_pago'],required:true},
  estadoPago: {
    type: String,
    enum: ['pendiente', 'pagado', 'fallido'],
    default: 'pendiente'
  },
  paymentId: {
    type: String
  },
  paymentUrl: {
    type: String
  }
}, { timestamps: true });

export default model<ICart>('Cart', CartSchema);