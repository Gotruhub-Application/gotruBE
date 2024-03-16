import { Imedia } from "../interfaces/media.interface";
import { Schema, Model, model } from "mongoose";

const MediaSchema :Schema<Imedia> = new Schema<Imedia>({
    file:{
        type:String,
        required:true
    },
    key:{
        type:String,
        required:true
    }
},{timestamps:true})

export const Media: Model<Imedia> = model<Imedia>('Media', MediaSchema);