import mongoose, { Document, Schema } from 'mongoose';

// Interface for Component
interface IComponent {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  enabled: string;
  barcode?: string;
  detail?: string;
  href?: string;
  value?: number;
}

// Interface for Variable
interface IVariable {
  id: number;
  name: string;
  required: string;
  quantity: number;
  maximum: string;
  quantityMaximum: number;
  components: IComponent[];
}

// Interface for Product
export interface IProduct extends Document {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  enabled: string;
  barcode?: string;
  detail?: string;
  href?: string;
  salesgroup?: number;
  groupId?: number;
  type?: number;
  value: number;
  highlighted?: string;
  manufactured?: string;
  productResale?: string;
  lastCost?: number;
  variables?: IVariable[];
  createdAt: Date;
  updatedAt: Date;
}

// Component Schema
const ComponentSchema = new Schema<IComponent>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  unit: { type: String, required: true },
  enabled: { type: String, required: true },
  barcode: { type: String },
  detail: { type: String },
  href: { type: String },
  value: { type: Number }
});

// Variable Schema
const VariableSchema = new Schema<IVariable>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  required: { type: String, required: true },
  quantity: { type: Number, required: true },
  maximum: { type: String, required: true },
  quantityMaximum: { type: Number, required: true },
  components: [ComponentSchema]
});

// Product Schema
const ProductSchema = new Schema<IProduct>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  unit: { type: String, required: true },
  enabled: { type: String, required: true },
  barcode: { type: String },
  detail: { type: String },
  href: { type: String },
  salesgroup: { type: Number },
  groupId: { type: Number },
  type: { type: Number },
  highlighted: { type: String },
  manufactured: { type: String },
  productResale: { type: String },
  lastCost: { type: Number },
  value: { type: Number },
  variables: [VariableSchema]
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', ProductSchema);

