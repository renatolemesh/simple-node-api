import mongoose, { Document, Schema } from 'mongoose';

interface IOrderProductComponent {
  id: number;
  name: string;
  value?: number; // aditional value
}

interface IOrderProductVariable {
  id: number;
  name: string;
  components: IOrderProductComponent[];
}

interface IOrderProduct {
  id: number; // product id original
  name: string;
  unitPrice: number;
  variables: IOrderProductVariable[];
  finalPrice: number; // calculate (unitPrice + sum of values)
  quantity?: number; // optional, defaults 1
}

export interface IOrder extends Document {
  orderNumber?: string;
  order_products: IOrderProduct[];
  total: number;
  customer_number: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  address?: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zip_code: string;
  }
}

const ComponentSchema = new Schema<IOrderProductComponent>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  value: { type: Number, default: 0 }
}, { _id: false });

const VariableSchema = new Schema<IOrderProductVariable>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  components: { type: [ComponentSchema], default: [] }
}, { _id: false });

const OrderProductSchema = new Schema<IOrderProduct>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  variables: { type: [VariableSchema], default: [] },
  finalPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: Number, index: true, unique: true },
  order_products: { type: [OrderProductSchema], default: [] },
  total: { type: Number, default: 0 },
  customer_number: { type: String }, 
  status: { type: String, default: 'pending' }
}, {
  timestamps: true
});

/**
 * Hook that recalculates finalPrice of each order_product and total of the order before saving.
 * finalPrice of the item = unitPrice + sum(values of all components inside variables) 
 * multiplied by quantity.
 */
OrderSchema.pre('save', function (next) {
  try {
    let total = 0;
    this.order_products = this.order_products.map(item => {
      // sum of all values of components
      const addValue = (item.variables || []).reduce((varAcc, variable) => {
        return varAcc + (variable.components || []).reduce((cAcc, comp) => cAcc + (comp.value || 0), 0);
      }, 0);

      const finalSingle = Number((item.unitPrice + addValue).toFixed(2));
      const qty = item.quantity ?? 1;
      const finalPrice = Number((finalSingle * qty).toFixed(2));

      total += finalPrice;

      return {
        ...item,
        finalPrice,
        quantity: qty
      };
    });

    this.total = Number(total.toFixed(2));
    next();
  } catch (err) {
    next(this instanceof Error ? this : new Error('Error calculating total of order'));
  }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
