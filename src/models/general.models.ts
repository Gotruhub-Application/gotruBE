import {Schema, Model, model } from 'mongoose';
import { BlackListedTokenDocument } from "../interfaces/general.interface";


const BlackListTokenSchema :Schema<BlackListedTokenDocument> = new Schema<BlackListedTokenDocument>({
    token:{
        type:String,
        required:true
    },

},{timestamps:true})

export const BlackListedToken: Model<BlackListedTokenDocument> = model<BlackListedTokenDocument>('BlackListedToken', BlackListTokenSchema);