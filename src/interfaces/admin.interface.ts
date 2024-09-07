import { Decimal128, Document, Schema } from "mongoose";

export interface Ifeature extends Document {
    name: string;
    basePrice: number,
}
export interface Isubscription extends Document {
    name: string,
    feature: [{ type: Schema.Types.ObjectId }],
    duration: string,
    planValidity: number,
    amount: Decimal128,
    description: string
}

export interface IAdminUser extends Document {
    email: string;
    fullname: string;
    password: string;
    isAdmin?: boolean;
}

export interface IAnnouncement extends Document {
    title: string;
    content: string;
}
