import mongoose, { Document, Schema } from 'mongoose';

export interface IMap extends Document {
  sessionId: string;
  name: string;
  gridData: number[][];
  width: number;
  height: number;
  resolution: number;
  origin: {
    x: number;
    y: number;
  };
  metadata: {
    duration: number;
    updateCount: number;
    coverage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MapSchema = new Schema<IMap>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    gridData: {
      type: [[Number]],
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    resolution: {
      type: Number,
      required: true
    },
    origin: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    metadata: {
      duration: { type: Number, default: 0 },
      updateCount: { type: Number, default: 0 },
      coverage: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

MapSchema.index({ createdAt: -1 });
MapSchema.index({ name: 'text' });

export const MapModel = mongoose.model<IMap>('Map', MapSchema);
