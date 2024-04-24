import { Schema, model, Document, Model } from 'mongoose';
import { Ifeature, Isubscription } from '../interfaces/admin.interface';

// Create Mongoose schemas for Feature and Subscription
const FeatureSchema: Schema<Ifeature> = new Schema<Ifeature>({
    name: { type: String, required: true,  unique: true},
}, { timestamps: true });

const SubscriptionSchema: Schema<Isubscription> = new Schema<Isubscription>({
    name: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
    planValidity: { type: Number, required: true },
    feature: [{ type: Schema.Types.ObjectId, ref: "Feature", required: true }],
}, { timestamps: true });

// Create models for Feature and Subscription
const Subscription: Model<Isubscription> = model<Isubscription>('Subscription', SubscriptionSchema);
const Feature: Model<Ifeature> = model<Ifeature>('Feature', FeatureSchema);

export { Subscription, Feature };
