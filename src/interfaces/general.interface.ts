import mongoose, { Schema, Document } from 'mongoose';

export interface BlackListedTokenDocument extends Document {
  token: string
}

export interface INotification extends Document {
  owner: string;
  type: string;
  entityId?: string;
  entityModel?: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}