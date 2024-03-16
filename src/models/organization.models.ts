import {Schema, Model, model } from 'mongoose';
import { IOrganization,Itoken } from '../interfaces/organization';


const OrganizationSchema: Schema<IOrganization> = new Schema<IOrganization>({
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
  },
  domain: {
    type: String,
    default: "smart",
  },
  personalAddress: {
    type: String,
    default: "",
  },
  businessAddress: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  lga: {
    type: String,
    default: "",
  },
  govtlevel: {
    type: String,
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  yearOfEstablishment: {
    type: String,
    default: "",
  },
  level: {
    type: String,
    default: "smallbiz",
  },
  nameOfEstablishment: {
    type: String,
  },
  bizType: {
    type: String,
    default: "",
  },
  bankCode: {
    type: String,
  },
  referalCode: {
    type: String,
    default: "",
  },
  bankName: {
    type: String,
  },
  accName: {
    type: String,
  },
  bankAcc: {
    type: String,
  },
  bizStatus: {
    type: String,
    default: "pending",
  },
  qrcode: {
    type: String,
    default: "",
  },
  regType: {
    type: String,
    default: "",
  },
  agency: {
    type: String,
    default: "",
  },
  cacImage: {
    type: Schema.Types.ObjectId,
    ref:"Media",
    required:false
  },
  opLicenceImage: {
    type: Schema.Types.ObjectId,
    ref:"Media",
    required:false
  },
  isVerified:{
    type:Boolean,
    required:false,
    default:false
  },
}, {
  timestamps: true,
});

const TokenSchema:Schema<Itoken> = new Schema<Itoken>({
  email: {
    type: String,
    required:true
  },
  token: {
    type: String,
    required:true
  },
  created_at: {
    type: Date,
    default:Date.now,
    required:false
  },
  expires_at: {
    type: Date,
    required:true
  },
})

export const Organization: Model<IOrganization> = model<IOrganization>('Organization', OrganizationSchema);
export const Token: Model<Itoken> = model<Itoken>('Token', TokenSchema);


