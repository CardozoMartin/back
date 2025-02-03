import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  activo: boolean;
  codigoVerificacion: string;
}

const UserSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  password: { type: String, required: true },
  activo: { type: Boolean, default: false }, 
  codigoVerificacion: { type: String }, 
});

export default mongoose.model<IUser>('User', UserSchema);