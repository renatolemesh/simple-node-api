// routes/orders.ts
import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  listOrders,
  addProductToOrder,
  getOrderByCustomerNumber,
  updateOrderStatus,
  removeProductFromOrder,
  setOrderAddress,
  setOrderPaymentMethod
} from '../controllers/orderController';

const router = Router();

/**
 * Create a new order
 * POST /orders
 */
router.post('/', createOrder);

/**
 * List orders (paginated)
 * GET /orders?page=1&limit=50
 */
router.get('/', listOrders);

/**
 * Get order by Mongo _id
 * GET /orders/:id
 */
router.get('/:id', getOrderById);

/**
 * update order status
 * Posts /orders/:id/updateStatus
 */
router.post('/:id/updateStatus', updateOrderStatus);

/**
 * Get latest order by customer_number and optional status query
 * GET /orders/customer/:customer_number
 * optional query: ?status=completed
 */
router.get('/customer/:customer_number', getOrderByCustomerNumber);

/**
 * Add a product to an existing order
 * POST /orders/:id/products
 */
router.post('/:id/products', addProductToOrder);

/**
 * remove product from a existing order
 * DELETE /orders/:id/products/:productId
 */
router.delete('/:id/products/:productId', removeProductFromOrder); // remove product

/**
 * Add a product to an existing order
 * POST /orders/:id/products
 */
router.post('/:id/address', setOrderAddress);

/**
 * set order payment method
 * Posts /orders/:id/paymentMethod
 */
router.post('/:id/paymentMethod', setOrderPaymentMethod);

export default router;
