import { Schema, Document, model } from 'mongoose';

export interface IBanner extends Document {
  titulo: string;
  subtitulo: string;
  imagen?: string;
}

const BannerSchema: Schema = new Schema({
  titulo: { type: String, required: true },
  subtitulo: { type: String, required: true },
  imagen: { type: String } 
});

export default model<IBanner>('Banner', BannerSchema);