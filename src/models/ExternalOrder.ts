import mongoose, { Document, Schema } from 'mongoose';

// Interfaces for nested structures
interface ICoordinates {
  latitude: number;
  longitude: number;
}

interface IDeliveryAddress {
  streetName: string;
  streetNumber: string;
  formattedAddress: string;
  neighborhood: string;
  complement?: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  reference?: string;
  coordinates: ICoordinates;
}

interface IDelivery {
  mode: string;
  description: string;
  deliveredBy: string;
  deliveryDateTime: Date;
  deliveryAddress: IDeliveryAddress;
  pickupCode?: string;
}

interface IMerchant {
  id: string;
  name: string;
}

interface IPhone {
  number: string;
  localizer: string;
  localizerExpiration: Date;
}

interface ICustomer {
  id: string;
  name: string;
  phone: IPhone;
  ordersCountOnMerchant: number;
  segmentation: string;
}

interface ICustomization {
  id: string;
  externalCode: string;
  name: string;
  groupName: string;
  type: string;
  quantity: number;
  unitPrice: number;
  addition: number;
  price: number;
}

interface IOption {
  index: number;
  id: string;
  name: string;
  type: string;
  groupName: string;
  customizations: ICustomization[];
  externalCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  addition: number;
  price: number;
}

interface IItem {
  index: number;
  id: string;
  uniqueId: string;
  name: string;
  type: string;
  externalCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  optionsPrice: number;
  totalPrice: number;
  price: number;
  observations?: string;
  options: IOption[];
  imageUrl?: string;
}

interface ITotal {
  additionalFees: number;
  subTotal: number;
  deliveryFee: number;
  benefits: number;
  orderAmount: number;
}

interface ICard {
  brand: string;
}

interface IPaymentMethod {
  value: number;
  currency: string;
  method: string;
  prepaid: boolean;
  type: string;
  card?: ICard;
}

interface IPayments {
  prepaid: number;
  pending: number;
  methods: IPaymentMethod[];
}

interface ILiability {
  name: string;
  percentage: number;
}

interface IAdditionalFee {
  type: string;
  description: string;
  fullDescription: string;
  value: number;
  liabilities: ILiability[];
}

interface IPicking {
  picker: string;
}

export interface IExternalOrder extends Document {
  id: string;
  displayId: string;
  createdAt: Date;
  category: string;
  orderTiming: string;
  orderType: string;
  delivery: IDelivery;
  preparationStartDateTime: Date;
  isTest: boolean;
  salesChannel: string;
  merchant: IMerchant;
  customer: ICustomer;
  items: IItem[];
  total: ITotal;
  payments: IPayments;
  additionalFees: IAdditionalFee[];
  picking: IPicking;
  
  // Internal fields
  status?: string;
  processedAt?: Date;
  updatedAt: Date;
}

// Schemas
const CoordinatesSchema = new Schema<ICoordinates>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
}, { _id: false });

const DeliveryAddressSchema = new Schema<IDeliveryAddress>({
  streetName: { type: String, required: true },
  streetNumber: { type: String, required: true },
  formattedAddress: { type: String, required: true },
  neighborhood: { type: String, required: true },
  complement: { type: String },
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  reference: { type: String },
  coordinates: { type: CoordinatesSchema, required: true }
}, { _id: false });

const DeliverySchema = new Schema<IDelivery>({
  mode: { type: String, required: true },
  description: { type: String, required: true },
  deliveredBy: { type: String, required: true },
  deliveryDateTime: { type: Date, required: true },
  deliveryAddress: { type: DeliveryAddressSchema, required: true },
  pickupCode: { type: String }
}, { _id: false });

const MerchantSchema = new Schema<IMerchant>({
  id: { type: String, required: true },
  name: { type: String, required: true }
}, { _id: false });

const PhoneSchema = new Schema<IPhone>({
  number: { type: String, required: true },
  localizer: { type: String, required: true },
  localizerExpiration: { type: Date, required: true }
}, { _id: false });

const CustomerSchema = new Schema<ICustomer>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: PhoneSchema, required: true },
  ordersCountOnMerchant: { type: Number, required: true },
  segmentation: { type: String, required: true }
}, { _id: false });

const CustomizationSchema = new Schema<ICustomization>({
  id: { type: String, required: true },
  externalCode: { type: String, required: true },
  name: { type: String, required: true },
  groupName: { type: String, required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  addition: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const OptionSchema = new Schema<IOption>({
  index: { type: Number, required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  groupName: { type: String, required: true },
  customizations: { type: [CustomizationSchema], default: [] },
  externalCode: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  addition: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const ItemSchema = new Schema<IItem>({
  index: { type: Number, required: true },
  id: { type: String, required: true },
  uniqueId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  externalCode: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  optionsPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  price: { type: Number, required: true },
  observations: { type: String },
  options: { type: [OptionSchema], default: [] },
  imageUrl: { type: String }
}, { _id: false });

const TotalSchema = new Schema<ITotal>({
  additionalFees: { type: Number, required: true },
  subTotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  benefits: { type: Number, required: true },
  orderAmount: { type: Number, required: true }
}, { _id: false });

const CardSchema = new Schema<ICard>({
  brand: { type: String, required: true }
}, { _id: false });

const PaymentMethodSchema = new Schema<IPaymentMethod>({
  value: { type: Number, required: true },
  currency: { type: String, required: true },
  method: { type: String, required: true },
  prepaid: { type: Boolean, required: true },
  type: { type: String, required: true },
  card: { type: CardSchema }
}, { _id: false });

const PaymentsSchema = new Schema<IPayments>({
  prepaid: { type: Number, required: true },
  pending: { type: Number, required: true },
  methods: { type: [PaymentMethodSchema], required: true }
}, { _id: false });

const LiabilitySchema = new Schema<ILiability>({
  name: { type: String, required: true },
  percentage: { type: Number, required: true }
}, { _id: false });

const AdditionalFeeSchema = new Schema<IAdditionalFee>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  fullDescription: { type: String, required: true },
  value: { type: Number, required: true },
  liabilities: { type: [LiabilitySchema], required: true }
}, { _id: false });

const PickingSchema = new Schema<IPicking>({
  picker: { type: String, required: true }
}, { _id: false });

// Main Order Schema
const ExternalOrderSchema = new Schema<IExternalOrder>({
  id: { type: String, required: true, unique: true, index: true },
  displayId: { type: String, required: true, index: true },
  createdAt: { type: Date, required: true },
  category: { type: String, required: true },
  orderTiming: { type: String, required: true },
  orderType: { type: String, required: true },
  delivery: { type: DeliverySchema, required: true },
  preparationStartDateTime: { type: Date, required: true },
  isTest: { type: Boolean, required: true },
  salesChannel: { type: String, required: true },
  merchant: { type: MerchantSchema, required: true },
  customer: { type: CustomerSchema, required: true },
  items: { type: [ItemSchema], required: true },
  total: { type: TotalSchema, required: true },
  payments: { type: PaymentsSchema, required: true },
  additionalFees: { type: [AdditionalFeeSchema], default: [] },
  picking: { type: PickingSchema, required: true },
  
  // Internal control fields
  status: { 
    type: String, 
    enum: ['received', 'processing', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled'],
    default: 'received' 
  },
  processedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for better performance
ExternalOrderSchema.index({ 'merchant.id': 1, createdAt: -1 });
ExternalOrderSchema.index({ 'customer.id': 1 });
ExternalOrderSchema.index({ salesChannel: 1, createdAt: -1 });
ExternalOrderSchema.index({ status: 1 });
ExternalOrderSchema.index({ isTest: 1 });

// Pre-save hook to set processedAt when status changes
ExternalOrderSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status !== 'received') {
    this.processedAt = new Date();
  }
  next();
});

// Methods
ExternalOrderSchema.methods.getTotalItemsCount = function(): number {
  return this.items.reduce((total: number, item: IItem) => total + (item.quantity || 0), 0);
};

ExternalOrderSchema.methods.getEstimatedDeliveryTime = function(): Date {
  return this.delivery.deliveryDateTime;
};

ExternalOrderSchema.methods.isExpiredOrder = function(): boolean {
  const now = new Date();
  const orderDate = new Date(this.createdAt);
  const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
  return diffInHours > 24; // Consider expired after 24 hours
};

export default mongoose.model<IExternalOrder>('ExternalOrder', ExternalOrderSchema);