import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  clientId: string;
  socketId: string;
  status: 'active' | 'idle' | 'mapping' | 'disconnected';
  connectedAt: Date;
  lastActivity: Date;
  metadata: {
    userAgent?: string;
    ip?: string;
  };
}

const SessionSchema = new Schema<ISession>(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    socketId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'idle', 'mapping', 'disconnected'],
      default: 'active'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    metadata: {
      userAgent: String,
      ip: String
    }
  },
  {
    timestamps: true
  }
);

SessionSchema.index({ status: 1 });
SessionSchema.index({ lastActivity: 1 });

export const SessionModel = mongoose.model<ISession>('Session', SessionSchema);
