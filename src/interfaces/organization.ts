import { Document, Schema} from 'mongoose';

export interface IOrganization extends Document {
  phone: string;
  email: string;
  password: string;
  role: 'admin';
  domain?: string;
  personalAddress?: string;
  businessAddress?: string;
  state?: string;
  lga?: string;
  govtlevel?: string;
  website?: string;
  yearOfEstablishment?: string;
  level?: 'smallbiz';
  bizType?: string;
  bankCode?: string;
  bankName?: string;
  accName?: string;
  bankAcc?: string;
  bizStatus?: 'pending';
  qrcode?: string;
  regType?: string;
  cacImage?: Schema.Types.ObjectId;
  opLicenceImage?: Schema.Types.ObjectId;
  referalCode?: string;
  nameOfEstablishment?: string;
  agency:string,
  isVerified:boolean
}

export interface Itoken extends Document{
  email: Schema.Types.ObjectId;
  token: string;
  created_at?: Date;
  expires_at: Date;
};

export interface IUnit extends Document {
  name:string
  organization: Schema.Types.ObjectId;
}
export interface ISubUnit extends Document {
  name:string
  unit: Schema.Types.ObjectId;
  organization: Schema.Types.ObjectId;
}

export interface Iuser extends Document {
  fullName:string,
  email?:string,
  password?:string,
  phone?:string,
  regNum?:string,
  guardians?: [{type:Schema.Types.ObjectId}],
  piviotUnit?: {type:Schema.Types.ObjectId},
  subUnit?: {type:Schema.Types.ObjectId},
  profileImage?: {type:Schema.Types.ObjectId},
  signature?: {type:Schema.Types.ObjectId},
  organization: {type:Schema.Types.ObjectId},
  children:[{type:Schema.Types.ObjectId}],
  role:string
}