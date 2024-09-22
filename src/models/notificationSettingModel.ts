import mongoose, { Document, Schema } from 'mongoose';

// Interface
export interface INotificationSetting extends Document {
    ownerId:string;
    gotrupassAlerts: {
        signIn: boolean;
        signOut: boolean;
    };
    gotrumonitorAlerts: {
        signIn: boolean;
        signOut: boolean;
    };
    gotruAlerts: {
        credit: boolean;
        debit: boolean;
    };
}

// Schema
const NotificationSettingSchema: Schema = new Schema({
    ownerId: { type: String, required: true },
    gotrupassAlerts: {
        signIn: { type: Boolean, default: true },
        signOut: { type: Boolean, default: true }
    },
    gotrumonitorAlerts: {
        signIn: { type: Boolean, default: true },
        signOut: { type: Boolean, default: true }
    },
    gotruAlerts: {
        credit: { type: Boolean, default: true },
        debit: { type: Boolean, default: true }
    }
});

// Model
const NotificationSetting = mongoose.model<INotificationSetting>('NotificationSetting', NotificationSettingSchema);

export default NotificationSetting;