import { Decimal128, Document, Schema } from "mongoose";

export interface Ifeature extends Document {
    name: string
}
export interface Isubscription extends Document {
    name:string,
    feature: [{type:Schema.Types.ObjectId}],
    duration: string,
    planValidity: number,
    amount: Decimal128,
    description: string
}