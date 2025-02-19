import mongoose, { Schema, Model, model, Query } from 'mongoose';
import bcrypt from "bcrypt"
import { IOrganization, Itoken, IUnit, ISubUnit, Iuser, IPlan, IappToken, ISignInOutRecord, ICategory, IProduct, ISubaccount, IWallet, IWalletTransaction, IWithdrawalRequest, IOrder, IOrderPickup } from '../interfaces/organization';
import { CompareCoordinate, CreateNotificationParams } from '../interfaces/general.interface';
import { createNotification, isUserLocationInRange, writeErrosToLogs } from '../support/helpers';
import { sendNotif } from '../support/firebaseNotification';
import { Notification } from './general.models';

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
  nameOfProprietor: {
    type: String,
    default: ""
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
    ref: "Media",
    required: false
  },
  opLicenceImage: {
    type: Schema.Types.ObjectId,
    ref: "Media",
    required: false
  },
  startLocation: {
    lat: { type: String, default: "" },
    long: { type: String, default: "" }
  },
  endLocation: {
    lat: { type: String, default: "" },
    long: { type: String, default: "" }
  },
  isVerified: {
    type: Boolean,
    required: false,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fcmToken: {
    type: String,
    default: ""
  },
  logo: {
    type: Schema.Types.ObjectId,
    ref: "Media",
    required: false
  },
  motto: {
    type: String,
    default: "",
    required: false
  },
}, {
  timestamps: true,
})

// Add hasActiveSubPlan method to the schema
OrganizationSchema.methods.hasActiveSubPlan = async function (): Promise<boolean> {
  const activePlans = await Plan.find({
    Organization: this._id,
    quantityLeft: { $gt: 0 },
    paidStatus: true
  }).limit(1).exec();

  return activePlans.length > 0;
};

const TokenSchema: Schema<Itoken> = new Schema<Itoken>({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: false
  },
  expires_at: {
    type: Date,
    required: true
  },
})

const UnitSchema: Schema<IUnit> = new Schema<IUnit>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
}, {
  timestamps: true,
})

const SubUnitSchema: Schema<ISubUnit> = new Schema<ISubUnit>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: "Unit",
    required: true
  },
  coordinator: { type: Schema.Types.ObjectId, ref: 'User', required: true },

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
    default: ""
  },
  bankName: {
    type: String,
    default: ""
  },
  accountNum: {
    type: String,
    default: ""
  },
  accountName: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    required: false,
    unique: true,
    default: ""
  },
  defaultEmail: {
    type: String,
    required: false,
    unique: false,
    default: ""
  },
  guardians: { type: Schema.Types.ObjectId, ref: "User", required: false },
  piviotUnit: { type: Schema.Types.ObjectId, ref: "Unit", required: false },
  subUnit: { type: Schema.Types.ObjectId, ref: "SubUnit", required: false },
  profileImage: { type: Schema.Types.ObjectId, ref: "Media", required: false },
  relationImage: { type: Schema.Types.ObjectId, ref: "Media", required: false },
  signature: { type: Schema.Types.ObjectId, ref: "Media", required: false },
  organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  role: { type: String, required: true },
  children: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
  onboardingCompleted: {
    type: Boolean,
    required: false,
    default: false
  },
  fcmToken: {
    type: String,
    default: ""
  },
  passToken: { type: Schema.Types.ObjectId, ref: "AppToken", required: false },
  tradeToken: { type: Schema.Types.ObjectId, ref: "AppToken", required: false },
  monitorToken: { type: Schema.Types.ObjectId, ref: "AppToken", required: false },
  appPermissions: [String],

}, { timestamps: true });

UserSchema.pre('findOne', function () {
  this
    .populate('profileImage')
    .populate('piviotUnit')
    .populate('subUnit')
    .populate('signature')
    .populate('relationImage')
    .populate('children')
    .populate('guardians')
    .populate('passToken')
    .populate('tradeToken')
    .populate('monitorToken')
});

UserSchema.pre('find', function () {
  this
    .populate('profileImage')
    .populate('piviotUnit')
    .populate('subUnit')
    .populate('signature')
    .populate('relationImage');
});

UserSchema.pre("save", async function (next) {
  if (this.isNew && this.role == "student") {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("0000", salt)
    await WalletModel.create({
      user: this._id,
      pin: password
    });
  }
  next();
})

const walletSchema: Schema<IWallet> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, default: 0 },
    pin: String,
    // changedPin:{
    //   type:Boolean, default:false
    // }
  },
  {
    timestamps: true,
  }
);


const walletTransactionSchema: Schema<IWalletTransaction> = new Schema(
  {
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const withdrawalRequestSchema: Schema<IWithdrawalRequest> = new Schema<IWithdrawalRequest>({
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
}, {
  timestamps: true,
}
);

withdrawalRequestSchema.pre('findOne', function () {
  this
    .populate('user')
    .populate('wallet')
});


// Pre-save hook to handle wallet update and transaction creation
withdrawalRequestSchema.pre<IWithdrawalRequest>('save', async function (next) {
  if (this.isNew) {
    const wallet = await WalletModel.findById(this.wallet);
    if (!wallet) {
      return next(new Error('Associated wallet not found.'));
    }
    if (wallet.balance < this.amount) {
      return next(new Error('Insufficient funds in wallet.'));
    }

    // Debit the wallet
    wallet.balance -= this.amount;
    await wallet.save();

    // Create a debit transaction
    await WalletTransactionModel.create({
      wallet: this.wallet,
      user: this.user,
      amount: this.amount,
      type: 'debit'
    });
  }
  next();
});

const PlanSchema: Schema<IPlan> = new Schema<IPlan>({
  quantity: {
    type: Number,
    required: true,
  },
  quantityLeft: {
    type: Number,
    default: 0,
    required: true,
  },
  planValidity: {
    type: Number,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
  },
  paidStatus: {
    type: Boolean,
    default: false,
  },
  subscriptionType: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
    required: true
  },
  isContract: { type: Boolean, default: false },
  Organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
}, {
  timestamps: true,
})

PlanSchema.pre('find', function (next) {
  this.populate("subscriptionType");
  next();
});
PlanSchema.pre('findOne', function (next) {
  this.populate("subscriptionType");
  next();
});


const appTokenSchema: Schema<IappToken> = new Schema<IappToken>({
  token: {
    type: String,
    required: true
  },
  used: {
    type: Boolean,
    default: false,
  },
  expired: {
    type: Boolean,
    default: false,
  },
  expires_at: {
    type: Date
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // usedFor: {
  //   type: Schema.Types.ObjectId,
  //   ref:"User",
  //   required:false
  // },
}, {
  timestamps: true,
})

const SignInOutRecordSchema: Schema<ISignInOutRecord> = new Schema<ISignInOutRecord>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorizedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  guardians: { type: Schema.Types.ObjectId, ref: 'User' },
  coordinate: {
    lat: { type: String, required: true },
    long: { type: String, required: true }
  },
  actionType: { type: String, required: true },
  approvalBy: { type: Schema.Types.ObjectId, ref: 'User' },
  authorizationType: { type: String, required: true },
  scannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  scannedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  scanned: { type: Boolean, default: true },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  other: {
    type: Schema.Types.ObjectId,
    ref: "Media",
    required: false
  },
  isValid: { type: Boolean, default: true },
  piviotUnit: { type: Schema.Types.ObjectId, ref: "Unit", required: false },
  subUnit: { type: Schema.Types.ObjectId, ref: "SubUnit", required: false },
}, { timestamps: true });

SignInOutRecordSchema.pre("save", async function (next) {
  const record = this as ISignInOutRecord;
  // get the user and guardian
  const user = await User.findById(this.user);
  const guardian = await User.findById(user?.guardians);
  if (record.isNew) {
    this.piviotUnit = user?.piviotUnit;
    this.subUnit = user?.subUnit;

    try {
      const orgnz = await mongoose.model('Organization').findById(record.organization).select("startLocation endLocation nameOfEstablishment ").exec();
      if (!orgnz) {
        return next(new Error("Organization not found"));
      }

      const coordinates: CompareCoordinate = {
        startLocation: { lat: orgnz.startLocation.lat as string, long: orgnz.startLocation.long as string },
        endLocation: { lat: orgnz.endLocation.lat as string, long: orgnz.endLocation.long as string },
        userLocation: { lat: record.coordinate.lat as string, long: record.coordinate.long as string }
      };

      const resp = isUserLocationInRange(coordinates);
      if (!resp) {
        // const payload: CreateNotificationParams = {
        //   owner: orgnz._id.toString(),
        //   title: `suspicious_${record.actionType}`,
        //   type: `gotrupass`,
        //   message: `New suspicious ${record.actionType} at ${record.coordinate.lat}, ${record.coordinate.long}`
        // };
        // await createNotification(payload);
        // send notification 
        // const notifyPayload = {
        //   type: `gotrupass`,
        // };

        // const token = "egKQbjIqTiapi7MMvQXU77:APA91bEb0rDg882auDKv7CBNJ2YhQrH1JpKZr81vYGxMeN_E3g7VKfU3BJ2yWXOVQv5J0m9Pl06mcLP8S1ba3MOg7apQEu_I9vMK9u7ANGM1MFkbvDTMdVSNmJcfxT-DjIu6JhMQn2bo"
        // await sendNotif(orgnz.fcmToken, `suspicious_${record.actionType}`, `New suspicious ${record.actionType} at ${record.coordinate.lat}, ${record.coordinate.long}`, notifyPayload)
        this.isValid = false;
        await Notification.create({
          owner: record.organization.toString(),
          title: `suspicious_${this.actionType}`,
          type: `gotrupass`,
          message: `Suspicious ${this.actionType} by ${user?.fullName} at on ${this.createdAt} \n Scan LOcation: ${record.coordinate.lat}, ${record.coordinate.long}`
        });
      };
      if (guardian) {
        let message;
        if (this.actionType == "sign_in") {
          message = "arrived"
        } else {
          message = "left"
        }
        if (guardian?.fcmToken) {
          try {
            await sendNotif(guardian.fcmToken, `${orgnz?.nameOfEstablishment}`, `Your child ${user?.fullName} just ${message} school on ${this.createdAt}\n Scanned location: ${record.coordinate.lat}, ${record.coordinate.long}`, { type: `gotrupass` });
          } catch (error: any) {
            writeErrosToLogs(error);
          };
        }

        await Notification.create({
          owner: this.guardians,
          title: `${orgnz?.nameOfEstablishment}`,
          type: `gotrupass`,
          message: `Your child ${user?.fullName} just ${message} school on ${this.createdAt}\n Scanned location: ${record.coordinate.lat}, ${record.coordinate.long}`
        });
      }
    } catch (error: any) {
      return next(error);
    }
  }

  next();
});


const categorySchema: Schema<ICategory> = new Schema<ICategory>({
  name: { type: String, required: true },
  image: { type: Schema.Types.ObjectId, ref: 'Media' },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true }); // Include timestamps

categorySchema.pre('find', function () {
  this
    .populate('image')
  // .populate('organization')
});

categorySchema.pre('findOne', function () {
  this
    .populate('image')
  // .populate('organization')
});

// Define the Product schema
const productSchema: Schema<IProduct> = new Schema<IProduct>({
  productCoverImage: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  colors: { type: [String] },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: [String], required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  productName: { type: String, required: true },
  description: { type: String, required: true },
  flavor: { type: [String] },
  minimumQuantity: { type: Number, required: true },
  inStock: {
    type: Boolean,
    default: true
  },
}, { timestamps: true }); // Include timestamps

// productSchema.pre("save", async function (next) {
//   let message;
//   if (!this.isNew) {
//     if (this.quantity < this.minimumQuantity){
//       message = `Low stock: ${this.productName} has only ${this.quantity} left. Please order more soon.`
//     }else if (this.quantity <=0){
//       message = `You have ran out of  ${this.productName}.`
//     }
//     await Notification.create({
//       owner: this.uploadedBy.toString(),
//       title: `Low stock`,
//       type: `gotrutrade`,
//       message: message
//     });

//   }
//   next();
// })

productSchema.pre('findOne', function () {
  this
    .populate('productCoverImage')
    .populate('category')
  // .populate('uploadedBy')
});
productSchema.pre('find', function () {
  this
    .populate('productCoverImage')
    .populate('category')
  // .populate('uploadedBy')
});

const productHistorySchema =  new Schema ({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  description: { type: String, required: true },
},{ timestamps: true })


const OrderSchema: Schema<IOrder> = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  attendant: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'delivered', "not_delivered", "paid"], default: 'not_delivered' },
  // walletTransaction: { type: Schema.Types.ObjectId, ref: 'WalletTransaction', required: true },
  collectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  paymentMode: { type: String, enum: ['wallet', 'cash'], default: 'wallet' },

  deliveryDate: {
    type: Date
  },
  deliveredOn: {
    type: Date
  },
}, { timestamps: true });
OrderSchema.pre("save", async function (next) {
  if (this.isNew && this.attendant) {
    const user = await User.findById(this.attendant);
    const message = `Sales by ${user?.fullName} on ${this.createdAt} of #${this.totalAmount} from stocks via ${this.paymentMode}.`
    await Notification.create({
      owner: this.organization.toString(),
      title: `New trade sales`,
      type: `gotrutrade`,
      message: message
    });

  }
  next();
})

OrderSchema.pre('find', function () {
  this
    .populate('user')
    .populate('items.product')
    .populate('attendant')
    .populate('collectedBy')

});

OrderSchema.pre('findOne', function () {
  this
    .populate('user')
    .populate('items.product')
    .populate('attendant')
    .populate('collectedBy')

});


const OrderPickupSchema: Schema<IOrderPickup> = new Schema<IOrderPickup>({
  assignee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  subunit: { type: Schema.Types.ObjectId, ref: 'SubUnit', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

// Pre-find middleware to populate references
OrderPickupSchema.pre('find', function () {
  this
    .populate('assignee')
    .populate('unit')
    .populate('subunit')
    .populate('organization');
});

// Pre-findOne middleware to populate references
OrderPickupSchema.pre('findOne', function () {
  this
    .populate('assignee')
    .populate('unit')
    .populate('subunit')
    .populate('organization');
});


const SubaccountSchema: Schema<ISubaccount> = new Schema<ISubaccount>({
  business_name: {
    type: String,
    required: true,
  },
  settlement_bank: {
    type: String,
    required: true,
  },
  account_number: {
    type: String,
    required: true,
  },
  account_name: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  primary_contact_email: {
    type: String,
    required: true,
    // match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
  },
  primary_contact_name: {
    type: String,
    required: true,
  },
  primary_contact_phone: {
    type: String,
    required: true,
    // match: [/^\+?[1-9]\d{1,14}$/, 'Please use a valid phone number.'],
  },
  // metadata: {
  //     type: String,
  //     required: false,
  // },
  subaccount_code: {
    type: String,
    default: ""
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
}, {
  timestamps: true,
});

export const OrderPickup: Model<IOrderPickup> = model<IOrderPickup>('OrderPickup', OrderPickupSchema);
export const Order: Model<IOrder> = model<IOrder>('Order', OrderSchema);
export const WithdrawalRequest: Model<IWithdrawalRequest> = model<IWithdrawalRequest>('WithdrawalRequest', withdrawalRequestSchema);
export const SubaccountModel = model<ISubaccount>('Subaccount', SubaccountSchema);
export const WalletModel: Model<IWallet> = model<IWallet>('Wallet', walletSchema);
export const WalletTransactionModel: Model<IWalletTransaction> = model<IWalletTransaction>('WalletTransaction', walletTransactionSchema);
export const Organization: Model<IOrganization> = model<IOrganization>('Organization', OrganizationSchema);
export const Token: Model<Itoken> = model<Itoken>('Token', TokenSchema);
export const Unit: Model<IUnit> = model<IUnit>('Unit', UnitSchema);
export const SubUnit: Model<ISubUnit> = model<ISubUnit>('SubUnit', SubUnitSchema);
export const User: Model<Iuser> = model<Iuser>('User', UserSchema);
export const AppToken: Model<IappToken> = model<IappToken>('AppToken', appTokenSchema);
export const Plan: Model<IPlan> = model<IPlan>('Plan', PlanSchema);
export const SignInOutRecordModel: Model<ISignInOutRecord> = model<ISignInOutRecord>('SignInOutRecord', SignInOutRecordSchema);

export const Category: Model<ICategory> = model<ICategory>('Category', categorySchema);
export const Product: Model<IProduct> = model<IProduct>('Product', productSchema);
export const ProductHistory = model("ProductHistory", productHistorySchema);
