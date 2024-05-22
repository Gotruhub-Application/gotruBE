import { Decimal128, Document, Schema} from 'mongoose';

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


export interface ISubaccount extends Document {
  business_name: string;
  settlement_bank: string;
  account_number: string;
  // percentage_charge: number;
  description: string;
  primary_contact_email: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  subaccount_code:string;
  // metadata: string; // Assuming metadata is a stringified JSON object
  organization: Schema.Types.ObjectId; // Assuming organization is a string representing ObjectId
}

export interface Itoken extends Document{
  email: Schema.Types.ObjectId;
  token: string;
  created_at?: Date;
  expires_at: Date;
};

export interface IPlan extends Document{
  subscriptionType: Schema.Types.ObjectId;
  Organization: Schema.Types.ObjectId;
  quantity: number;
  quantityLeft: number;
  amount: number;
  planValidity: number,
  paidStatus:boolean;
  created_at?: Date;
  expires_at: Date;
};

export interface IappToken extends Document{
  plan: IPlan | Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  usedFor: Schema.Types.ObjectId;
  token: string;
  used:boolean;
  expired:boolean;
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
  defaultEmail?:string,
  password?:string,
  phone?:string,
  regNum?:string,
  passQrcode?:string,
  guardians: {type:Schema.Types.ObjectId},
  piviotUnit?: {type:Schema.Types.ObjectId},
  subUnit?: {type:Schema.Types.ObjectId},
  profileImage?: {type:Schema.Types.ObjectId},
  relationImage?: {type:Schema.Types.ObjectId},
  signature?: {type:Schema.Types.ObjectId},
  organization: {type:Schema.Types.ObjectId},
  children:[{type:Schema.Types.ObjectId}],
  role:string,
  onboardingCompleted:boolean,
  createdAt:Date,
  updatedAt:Date,
  passToken?: {type:Schema.Types.ObjectId},
  tradeToken?: {type:Schema.Types.ObjectId},
  monitorToken?: {type:Schema.Types.ObjectId},
  fcmToken:string,
  appPermissions:[string],
  bankName:string,
  accountNum:string,
  accountName:string,
}
export interface IWallet extends Document {
  user: Schema.Types.ObjectId;
  pin:string;
  // changedPin:boolean;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface IWalletTransaction extends Document {
  wallet: IWallet['_id'];
  type: 'credit' | 'debit';
  user: Schema.Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};
export interface IWithdrawalRequest extends Document {
  wallet: IWallet['_id'];
  user: Iuser['_id'];
  timestamp: Date;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
}

export interface ISignInOutRecord extends Document {
  user: Schema.Types.ObjectId,
  authorizedFor:[Schema.Types.ObjectId],
  guardians: {type:Schema.Types.ObjectId},
  organization: {type:Schema.Types.ObjectId},
  other: {type:Schema.Types.ObjectId},
  coordinate:[string],
  actionType:string,
  approvalBy: Schema.Types.ObjectId,
  authorizationType: string,
  scannedBy:Schema.Types.ObjectId,
  scannedUser:Schema.Types.ObjectId,
  scanned:boolean,
  createdAt:Date,
  updatedAt:Date
}

export interface ICategory extends Document {
  name: string;
  image:Schema.Types.ObjectId,
  organization:Schema.Types.ObjectId;
}

export interface IProduct extends Document {
  productCoverImage: Schema.Types.ObjectId;
  uploadedBy: Schema.Types.ObjectId;
  colors: string[];
  price: number;
  quantity: number;
  size?: string[];
  category: Schema.Types.ObjectId;
  productName: string;
  description: string;
  flavor?: string[];
  minimumQuantity: number;
  inStock:boolean
};

export interface IOrder extends Document {
  user: Schema.Types.ObjectId;
  attendant: Schema.Types.ObjectId;
  items: Array<{ product: Schema.Types.ObjectId, quantity: number }>;
  totalAmount: number;
  paymentMode: string;
  status: string;
  // walletTransaction: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}