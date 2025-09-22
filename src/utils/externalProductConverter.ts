import { ICachedProduct } from '../processExternalProducts'; // Adjust path
import { ExternalProduct, ExternalVariable, ExternalComponent } from '../types/ExternalProduct';

/**
 * Converts a cached component to external component format
 */
function convertComponent(cachedComponent: any): ExternalComponent {
  return {
    id: cachedComponent.id,
    name: cachedComponent.name,
    unitPrice: cachedComponent.unitPrice,
    unit: cachedComponent.unit,
    quantity: cachedComponent.quantity,
    price: cachedComponent.price,
    customize: cachedComponent.customize,
    subComponents: cachedComponent.subComponents?.map(convertComponent)
  };
}

/**
 * Converts a cached variable to external variable format
 */
function convertVariable(cachedVariable: any): ExternalVariable {
  return {
    id: cachedVariable.id,
    name: cachedVariable.name,
    required: cachedVariable.required,
    quantity: cachedVariable.quantity,
    maximum: cachedVariable.maximum,
    additional: cachedVariable.additional,
    additionalQuantity: cachedVariable.additionalQuantity,
    additionalValue: cachedVariable.additionalValue,
    components: cachedVariable.components.map(convertComponent)
  };
}

/**
 * Converts ICachedProduct to ExternalProduct format
 */
export function convertCachedToExternal(cachedProduct: ICachedProduct): ExternalProduct {
  return {
    id: cachedProduct.id,
    name: cachedProduct.name,
    unitPrice: cachedProduct.unitPrice,
    unit: cachedProduct.unit,
    enabled: cachedProduct.enabled,
    type: cachedProduct.type,
    detail: cachedProduct.detail,
    imageUrl: cachedProduct.imageUrl,
    manufactured: cachedProduct.manufactured,
    lastCost: cachedProduct.lastCost,
    barcodes: cachedProduct.barcodes,
    hasVariables: cachedProduct.hasVariables,
    variables: cachedProduct.variables.map(convertVariable),
    components: cachedProduct.baseComponents.map(convertComponent),
    createdAt: cachedProduct.createdAt
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