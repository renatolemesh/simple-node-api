import mongoose, { Document } from 'mongoose';
interface IComponent {
    id: number;
    name: string;
    unitPrice: number;
    unit: string;
    enabled: string;
    barcode?: string;
    detail?: string;
    href?: string;
}
interface IVariable {
    id: number;
    name: string;
    required: string;
    quantity: number;
    maximum: string;
    quantityMaximum: number;
    components: IComponent[];
}
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
    highlighted?: string;
    manufactured?: string;
    productResale?: string;
    lastCost?: number;
    variables?: IVariable[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map