import mongoose, { Schema, Document } from 'mongoose';

export interface BlackListedTokenDocument extends Document {
  token: string
}
