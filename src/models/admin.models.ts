import { Schema, model, Document, Model } from 'mongoose';
import { Ifeature, Isubscription } from '../interfaces/admin.interface';

// Create Mongoose schemas for Feature and Subscription
const FeatureSchema: Schema<Ifeature> = new Schema<Ifeature>({
    name: { type: String, required: true,  unique: true},
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
// Create models for Feature and Subscription
const Subscription: Model<Isubscription> = model<Isubscription>('Subscription', SubscriptionSchema);
const Feature: Model<Ifeature> = model<Ifeature>('Feature', FeatureSchema);

export { Subscription, Feature };
