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
    required: false,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
    required: false
  },
  domain: {
    type: String,
    default: "smart",
    required: false
  },
  personalAddress: {
    type: String,
    default: "",
    required: false
  },
  businessAddress: {
    type: String,
    default: "",
    required: false
  },
  state: {
    type: String,
    default: "",
    required: false
  },
  lga: {
    type: String,
    default: "",
    required: false
  },
  govtlevel: {
    type: String,
    default: "",
    required: false
  },
  website: {
    type: String,
    default: "",
    required: false
  },
  yearOfEstablishment: {
    type: String,
    default: "",
    required: false
  },
  level: {
    type: String,
    default: "smallbiz",
    required: false
  },
  nameOfEstablishment: {
    type: String,
    required: false
  },
  bizType: {
    type: String,
    default: "",
    required: false
  },
  bankCode: {
    type: String,
    required: false
  },
  referalCode: {
    type: String,
    default: "",
    required: false
  },
  bankName: {
    type: String,
    required: false
  },
  accName: {
    type: String,
    required: false
  },
  bankAcc: {
    type: String,
    required: false
  },
  bizStatus: {
    type: String,
    default: "pending",
    required: false
  },
  qrcode: {
    type: String,
    default: "",
    required: false
  },
  regType: {
    type: String,
    default: "",
    required: false
  },
  agency: {
    type: String,
    default: "",
    required: false
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
