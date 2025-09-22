import { IOrder } from '../models/Order';
import { IExternalOrder } from '../models/ExternalOrder';

export function mapOrderToExternal(order: IOrder): Partial<IExternalOrder> {
  return {
    id: order._id.toString(),
    displayId: order.orderNumber || `EXT-${Date.now()}`,
    createdAt: order.createdAt,
    category: "food",
    orderTiming: "immediate",
    orderType: "delivery",
    delivery: {
      mode: "delivery",
      description: "Standard delivery",
      deliveredBy: "restaurant",
      deliveryDateTime: new Date(Date.now() + 30 * 60000), // +30min
      deliveryAddress: {
        streetName: order.address?.street || "",
        streetNumber: order.address?.number || "",
        formattedAddress: `${order.address?.street}, ${order.address?.number}, ${order.address?.district}`,
        neighborhood: order.address?.district || "",
        postalCode: order.address?.zip_code || "",
        city: order.address?.city || "",
        state: order.address?.state || "",
        country: "BR",
        coordinates: { latitude: 0, longitude: 0 }
      }
    },
    preparationStartDateTime: new Date(),
    isTest: false,
    salesChannel: "app",
    merchant: { id: "merchant-001", name: "My Store" },
    customer: {
      id: order.customer_number,
      name: "Customer Name", // precisa buscar em tabela cliente se houver
      phone: {
        number: "000000000",
        localizer: "SMS",
        localizerExpiration: new Date(Date.now() + 10 * 60000)
      },
      ordersCountOnMerchant: 1,
      segmentation: "regular"
    },
    items: order.order_products.map((p, idx) => ({
      index: idx,
      id: p.id.toString(),
      uniqueId: `${order._id}-${p.id}`,
      name: p.name,
      type: "product",
      externalCode: p.id.toString(),
      quantity: p.quantity ?? 1,
      unit: "un",
      unitPrice: p.unitPrice,
      optionsPrice: p.finalPrice - p.unitPrice,
      totalPrice: p.finalPrice,
      price: p.finalPrice,
      options: []
    })),
    total: {
      additionalFees: 0,
      subTotal: order.total,
      deliveryFee: 0,
      benefits: 0,
      orderAmount: order.total
    },
    payments: {
      prepaid: order.total,
      pending: 0,
      methods: [
        {
          value: order.total,
          currency: "BRL",
          method: order.payment_method ?? "cash",
          prepaid: true,
          type: order.payment_method ?? "cash"
        }
      ]
    },
    additionalFees: [],
    picking: { picker: "system" }
  };
}

export function validateOrderForExternal(order: any) {
  if (!order.customer_number) {
    throw new Error("Missing customer_number");
  }
  if (!order.payment_method) {
    throw new Error("Missing payment method");
  }
  if (!order.address) {
    throw new Error("Missing address");
  }
  if (!order.order_products || order.order_products.length === 0) {
    throw new Error("No products in order");
  }
  if (!order.total || order.total <= 0) {
    throw new Error("Invalid total amount");
  }
}