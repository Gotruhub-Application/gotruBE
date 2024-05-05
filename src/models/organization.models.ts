import {Schema, Model, model } from 'mongoose';
import { IOrganization,Itoken,IUnit,ISubUnit, Iuser, IPlan, IappToken, ISignInOutRecord} from '../interfaces/organization';

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

const UnitSchema:Schema<IUnit> = new Schema<IUnit>({
  name: {
    type: String,
    required:true,
    unique:true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref:"Organization",
    required:true
  },
}, {
  timestamps: true,
})

const SubUnitSchema:Schema<ISubUnit> = new Schema<ISubUnit>({
  name: {
    type: String,
    required:true,
    unique:true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref:"Organization",
    required:true
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref:"Unit",
    required:true
  },
}, {
  timestamps: true,
})

const UserSchema: Schema<Iuser> = new Schema<Iuser>({
  fullName: { type: String, required: true },
  regNum: { type: String, required: false, unique: false },
  phone: { type: String, required: false },
  password: {
    type: String,
    required: false,
    // select: false,
  },
  passQrcode: {
    type: String,
    required: false,
    default:""
  },
  email: {
    type: String,
    required: false,
    unique: true,
    default:""
  },
  defaultEmail: {
    type: String,
    required: false,
    unique: false,
    default:""
  },
  guardians: { type: Schema.Types.ObjectId, ref: "User", required:false },
  piviotUnit:{ type: Schema.Types.ObjectId, ref: "Unit", required:false },
  subUnit:{ type: Schema.Types.ObjectId, ref: "SubUnit", required:false },
  profileImage:{ type: Schema.Types.ObjectId, ref: "Media", required:false },
  relationImage:{ type: Schema.Types.ObjectId, ref: "Media", required:false },
  signature:{ type: Schema.Types.ObjectId, ref: "Media", required:false},
  organization:{ type: Schema.Types.ObjectId, ref: "Organization", required:true },
  role: { type: String, required: true },
  children: [{ type: Schema.Types.ObjectId, ref: "User", required:false }],
  onboardingCompleted:{
    type:Boolean,
    required:false,
    default:false
  },
  passToken: { type: Schema.Types.ObjectId, ref: "AppToken", required:false },
  tradeToken: { type: Schema.Types.ObjectId, ref: "AppToken", required:false },
  monitorToken: { type: Schema.Types.ObjectId, ref: "AppToken", required:false },

}, { timestamps: true });

const PlanSchema:Schema<IPlan> = new Schema<IPlan>({
  quantity: {
    type: Number,
    required:true,
  },
  quantityLeft: {
    type: Number,
    default:0,
    required:true,
  },
  planValidity:{
    type: Number,
    required:false,
  },
  amount: {
    type: Number,
    required:false,
  },
  paidStatus: {
    type: Boolean,
    default:false,
  },
  subscriptionType: {
    type: Schema.Types.ObjectId,
    ref:"Subscription",
    required:true
  },
  Organization: {
    type: Schema.Types.ObjectId,
    ref:"Organization",
    required:true
  },
}, {
  timestamps: true,
})

const appTokenSchema:Schema<IappToken> = new Schema<IappToken>({
  token: {
    type: String,
    required:true
  },
  used:{
    type: Boolean,
    default:false,
  },
  expired:{
    type: Boolean,
    default:false,
  },
  expires_at:{
    type:Date
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref:"Plan",
    required:true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  // usedFor: {
  //   type: Schema.Types.ObjectId,
  //   ref:"User",
  //   required:false
  // },
}, {
  timestamps: true,
})

const SignInOutRecordSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorizedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  guardians: { type: Schema.Types.ObjectId, ref: 'User' },
  coordinate: [{ type: String }],
  actionType: String,
  approvalBy: { type: Schema.Types.ObjectId, ref: 'User' },
  authorizationType: { type: String, required: true },
  scannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  scannedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  scanned: { type: Boolean, default: true },
  organization: {
    type: Schema.Types.ObjectId,
    ref:"Organization",
    required:true
  },
  other: {
    type: Schema.Types.ObjectId,
    ref:"Media",
    required:false
  },
}, { timestamps: true });

export const Organization: Model<IOrganization> = model<IOrganization>('Organization', OrganizationSchema);
export const Token: Model<Itoken> = model<Itoken>('Token', TokenSchema);
export const Unit: Model<IUnit> = model<IUnit>('Unit', UnitSchema);
export const SubUnit: Model<ISubUnit> = model<ISubUnit>('SubUnit', SubUnitSchema);
export const User: Model<Iuser> = model<Iuser>('User', UserSchema);
export const AppToken: Model<IappToken> = model<IappToken>('AppToken', appTokenSchema);
export const Plan: Model<IPlan> = model<IPlan>('Plan', PlanSchema);
export const SignInOutRecordModel: Model<ISignInOutRecord> = model<ISignInOutRecord>('SignInOutRecord', SignInOutRecordSchema);

