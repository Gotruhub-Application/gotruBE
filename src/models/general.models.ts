import {Schema, Model, model } from 'mongoose';
import { BlackListedTokenDocument, INotification, IPassNotificationData } from "../interfaces/general.interface";


const BlackListTokenSchema :Schema<BlackListedTokenDocument> = new Schema<BlackListedTokenDocument>({
    token:{
        type:String,
        required:true
    },

},{timestamps:true})

const passNotificationDataSchema: Schema<IPassNotificationData> = new Schema<IPassNotificationData>({
  data: {
    type: Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });



const notificationSchema: Schema<INotification> = new Schema<INotification>({
  owner: String,
  organization: String,
  title: String,
  type: { type: String, required: true }, // e.g., 'product', 'wallet', etc.
  // entityId: String, // ID of the related entity
  // entityModel: { type: String, required: true }, // Name of the related model, e.g., 'Product', 'Wallet'
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });



export const Notification: Model<INotification> = model<INotification>('Notification', notificationSchema);
export const BlackListedToken: Model<BlackListedTokenDocument> = model<BlackListedTokenDocument>('BlackListedToken', BlackListTokenSchema);
export const PassNotificationData: Model<IPassNotificationData> = model<IPassNotificationData>('PassNotificationData', passNotificationDataSchema);

