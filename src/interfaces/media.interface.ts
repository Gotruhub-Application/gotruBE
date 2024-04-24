import { Document } from "mongoose";

export interface Imedia extends Document{
    file:string,
    key:string,
}