import { Schema, Document, model } from 'mongoose';

export interface IBanner extends Document {
  imagen?: string;
}

const BannerSchema: Schema = new Schema({

  imagen: { type: String } 
});

export default model<IBanner>('Banner', BannerSchema);