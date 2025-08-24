import { Request, Response } from 'express';
import Order from '../models/Order';

// Create order (receive order_products in body)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // optional
    payload.orderNumber = payload.orderNumber || `ORD-${Date.now()}`;

    const order = new Order(payload);
    await order.save();

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};

export const listOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const orders = await Order.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Order.countDocuments();

    return res.json({
      success: true,
      data: orders,
      pagination: { currentPage: page, totalItems: total, itemsPerPage: limit }
    });
  } catch (error) {
    console.error('listOrders error:', error);
    return res.status(500).json({ success: false, error: 'Failed to list orders' });
  }
};

// Add product to an existing order
export const addProductToOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // order id
    const product = req.body; // product object following the order_product shape

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.order_products.push(product);
    await order.save();

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('addProductToOrder error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add product' });
  }
};


export const getOrderByCustomerNumber = async (req: Request, res: Response) => {
  try {
    const { customer_number } = req.params;
    const rawStatus = (req.params.status as string) || (req.query.status as string) || '';
    const status = rawStatus ? rawStatus.toLowerCase() : '';

    // default to pending unless explicitly completed
    const targetStatus = status === 'completed' ? 'completed' : 'pending';

    let order = await Order.findOne({ customer_number, status: targetStatus })
      .sort({ createdAt: -1 });

    // if no pending order and status != completed → create new pending order
    if (!order && targetStatus === 'pending') {
      order = new Order({
        customer_number,
        status: 'pending',
        products: [], // empty array
      });
      await order.save();
    }

    return res.json({ success: true, data: order ?? null });
  } catch (error) {
    console.error('getOrderByCustomerNumber error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};


// update status of an existing order
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // order id
    const { status } = req.body; // new order status

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.status = status;
    await order.save();

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};

// Remove product from an existing order
export const removeProductFromOrder = async (req: Request, res: Response) => {
  try {
    const { id, productId } = req.params; // order id e product id

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const initialLength = order.order_products.length;

    // filtra o produto removendo pelo campo id
    order.order_products = order.order_products.filter(
      (p) => p.id.toString() !== productId.toString()
    );

    if (order.order_products.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Product not found in order' });
    }

    await order.save();

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('removeProductFromOrder error:', error);
    return res.status(500).json({ success: false, error: 'Failed to remove product' });
  }
};

