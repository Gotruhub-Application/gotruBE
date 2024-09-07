import { Schema, model, Document, Model } from 'mongoose';
import { IAdminUser, IAnnouncement, Ifeature, Isubscription } from '../interfaces/admin.interface';
import bcrypt from "bcrypt"

// Create Mongoose schemas for Feature and Subscription
const FeatureSchema: Schema<Ifeature> = new Schema<Ifeature>({
    name: { type: String, required: true,  unique: true},
    basePrice: { type:Number },
}, { timestamps: true });

const SubscriptionSchema: Schema<Isubscription> = new Schema<Isubscription>({
    name: { type: String, required: true },
    amount: { type:Schema.Types.Decimal128, required: true },
    duration: { type: String,},
    description: { type: String, required: true },
    planValidity: { type: Number },
    feature: [{ type: Schema.Types.ObjectId, ref: "Feature", required: true }],
}, { timestamps: true });

SubscriptionSchema.pre('find', function (next) {
    this.populate("feature");
    next();
  });

SubscriptionSchema.pre('findOne', function (next) {
    this.populate("feature");
    next();
  });


  const AdminUserSchema:  Schema<IAdminUser> = new Schema<IAdminUser>({
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  }, {
    timestamps: true
  });

  AdminUserSchema.pre('save', async function (next) {
    if (this.isNew){
      const newPassword = this.password
      this.password = await bcrypt.hash(newPassword, 10);
    }
    next();
  });



// Define the schema for Announcement
const announcementSchema: Schema<IAnnouncement> = new Schema<IAnnouncement>({
  title: { type: String, required: true }, // Changed 'name' to 'title' to match the interface
  content: { type: String, required: true }, // Added 'content' field to match the interface
})
  
  // Export the Admin User model
export const AdminUser:Model<IAdminUser> = model<IAdminUser>('AdminUser', AdminUserSchema);
export const Announcement:Model<IAnnouncement> = model<IAnnouncement>('Announcement', announcementSchema);
// Create models for Feature and Subscription
const Subscription: Model<Isubscription> = model<Isubscription>('Subscription', SubscriptionSchema);
const Feature: Model<Ifeature> = model<Ifeature>('Feature', FeatureSchema);

export { Subscription, Feature };
