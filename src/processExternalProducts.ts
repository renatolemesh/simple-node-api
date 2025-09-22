// Fixed ExternalProductDataProcessor.ts

// Types for the product structure
interface IBaseComponent {
  id: number;
  salesgroup: number;
  barcode: string;
  groupId: number;
  name: string;
  unit: string;
  enabled: string;
  unitPrice: number;
  lastCost: number;
  type: number;
  manufactured: string;
  detail?: string;
  href?: string;
  barcodes: string[];
}

interface IProductStructure {
  id: number;
  product: number;
  componentId: number;
  variableComposition: number | null;
  order: number;
  quantity: number;
  value: number;
  price: number;
  default: string;
  customize: string;
  component: IBaseComponent & {
    structure?: IProductStructure[];
  };
}

interface IVariableComponent {
  id: number;
  product: number;
  componentId: number;
  variableComposition: number;
  order: number;
  quantity: number;
  value: number;
  price: number;
  default: string;
  customize: string;
  component: IBaseComponent;
}

interface IVariable {
  id: number;
  order: number;
  price: number;
  name: string;
  requerid: string;
  quantity: number;
  maximum: string;
  quantitymaximum: number;
  additional: string;
  quantityadditional: number;
  valueadditional: number;
  components: IVariableComponent[];
}

interface IVariableStructure {
  id: number;
  product: number;
  variableComposition: number;
  variable: IVariable;
  href?: string;
  displayName?: string;
}

interface IRawProduct {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  enabled: string;
  type: number;
  detail?: string;
  href?: string;
  manufactured: string;
  lastCost: number;
  barcodes: string[];
  structure?: (IProductStructure | IVariableStructure)[]; // Made optional
}

// Processed/Cached product interfaces
interface ICachedComponent {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  price: number;
  customize: boolean;
  subComponents?: ICachedComponent[];
}

interface ICachedVariable {
  id: number;
  name: string;
  required: boolean;
  quantity: number;
  maximum: number;
  additional: boolean;
  additionalQuantity: number;
  additionalValue: number;
  components: ICachedComponent[];
}

interface ICachedProduct {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  enabled: boolean;
  type: number;
  detail?: string;
  imageUrl?: string;
  manufactured: boolean;
  lastCost: number;
  barcodes: string[];
  hasVariables: boolean;
  variables: ICachedVariable[];
  baseComponents: ICachedComponent[];
  createdAt: Date;
}

// Cache storage
class ProductCache {
  private cache: Map<number, ICachedProduct> = new Map();
  private lastUpdated: Map<number, Date> = new Map();

  set(productId: number, product: ICachedProduct): void {
    this.cache.set(productId, product);
    this.lastUpdated.set(productId, new Date());
  }

  get(productId: number): ICachedProduct | undefined {
    return this.cache.get(productId);
  }

  has(productId: number): boolean {
    return this.cache.has(productId);
  }

  getAll(): ICachedProduct[] {
    return Array.from(this.cache.values());
  }

  delete(productId: number): boolean {
    this.lastUpdated.delete(productId);
    return this.cache.delete(productId);
  }

  clear(): void {
    this.cache.clear();
    this.lastUpdated.clear();
  }

  getLastUpdated(productId: number): Date | undefined {
    return this.lastUpdated.get(productId);
  }

  size(): number {
    return this.cache.size;
  }

  // Get products by criteria
  getByType(type: number): ICachedProduct[] {
    return this.getAll().filter(product => product.type === type);
  }

  getWithVariables(): ICachedProduct[] {
    return this.getAll().filter(product => product.hasVariables);
  }

  getEnabled(): ICachedProduct[] {
    return this.getAll().filter(product => product.enabled);
  }
}

// Product data processor
export class ExternalProductDataProcessor {
  private productCache = new ProductCache();

  private processComponent(structure: IProductStructure): ICachedComponent {
    const component = structure.component;
    
    const cachedComponent: ICachedComponent = {
      id: component.id,
      name: component.name,
      unitPrice: component.unitPrice,
      unit: component.unit,
      quantity: structure.quantity,
      price: structure.price,
      customize: structure.customize === 'S'
    };

    // Process sub-components recursively if they exist
    if (component.structure && component.structure.length > 0) {
      cachedComponent.subComponents = component.structure.map(subStructure => 
        this.processComponent(subStructure)
      );
    }

    return cachedComponent;
  }

  private processVariable(variableStructure: IVariableStructure): ICachedVariable {
    const variable = variableStructure.variable;
    
    return {
      id: variable.id,
      name: variable.name,
      required: variable.requerid === 'S',
      quantity: variable.quantity,
      maximum: variable.quantitymaximum,
      additional: variable.additional === 'S',
      additionalQuantity: variable.quantityadditional,
      additionalValue: variable.valueadditional,
      components: (variable.components || []).map(comp => ({
        id: comp.component.id,
        name: comp.component.name,
        unitPrice: comp.component.unitPrice,
        unit: comp.component.unit,
        quantity: comp.quantity,
        price: comp.price,
        customize: comp.customize === 'S'
      }))
    };
  }

  processProduct(rawProduct: IRawProduct): ICachedProduct {
    const variables: ICachedVariable[] = [];
    const baseComponents: ICachedComponent[] = [];

    // Handle structure being undefined or null - THIS IS THE FIX
    if (rawProduct.structure && Array.isArray(rawProduct.structure)) {
      // Separate variables from regular components
      rawProduct.structure.forEach(item => {
        try {
          // Check if this is a variable structure (has variableComposition and variable property)
          if ('variableComposition' in item && item.variableComposition !== null && 'variable' in item) {
            variables.push(this.processVariable(item as IVariableStructure));
          } else if ('component' in item) {
            // Regular component structure
            baseComponents.push(this.processComponent(item as IProductStructure));
          }
        } catch (error) {
          console.warn(`Error processing structure item for product ${rawProduct.id}:`, error);
          // Continue processing other items
        }
      });
    }

    const cachedProduct: ICachedProduct = {
      id: rawProduct.id,
      name: rawProduct.name,
      unitPrice: rawProduct.unitPrice || 0,
      unit: rawProduct.unit || 'UN',
      enabled: rawProduct.enabled === 'S',
      type: rawProduct.type || 0,
      detail: rawProduct.detail,
      imageUrl: rawProduct.href,
      manufactured: rawProduct.manufactured === 'S',
      lastCost: rawProduct.lastCost || 0,
      barcodes: rawProduct.barcodes || [],
      hasVariables: variables.length > 0,
      variables,
      baseComponents,
      createdAt: new Date()
    };

    // Cache the processed product
    this.productCache.set(rawProduct.id, cachedProduct);
    
    return cachedProduct;
  }

  // Process multiple products with error handling
  processProducts(rawProducts: IRawProduct[]): ICachedProduct[] {
    if (!Array.isArray(rawProducts)) {
      console.warn('processProducts received non-array input:', rawProducts);
      return [];
    }

    const processed: ICachedProduct[] = [];
    
    rawProducts.forEach((product, index) => {
      try {
        if (product && typeof product === 'object' && product.id) {
          processed.push(this.processProduct(product));
        } else {
          console.warn(`Invalid product at index ${index}:`, product);
        }
      } catch (error) {
        console.error(`Error processing product at index ${index}:`, error);
        // Continue with next product
      }
    });

    return processed;
  }

  // Cache methods
  getCachedProduct(productId: number): ICachedProduct | undefined {
    return this.productCache.get(productId);
  }

  getAllCachedProducts(): ICachedProduct[] {
    return this.productCache.getAll();
  }

  getCachedProductsByType(type: number): ICachedProduct[] {
    return this.productCache.getByType(type);
  }

  getCachedProductsWithVariables(): ICachedProduct[] {
    return this.productCache.getWithVariables();
  }

  getEnabledProducts(): ICachedProduct[] {
    return this.productCache.getEnabled();
  }

  // Check if product exists in cache
  isProductCached(productId: number): boolean {
    return this.productCache.has(productId);
  }

  // Remove product from cache
  removeCachedProduct(productId: number): boolean {
    return this.productCache.delete(productId);
  }

  // Clear all cache
  clearCache(): void {
    this.productCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      totalProducts: this.productCache.size(),
      productsWithVariables: this.getCachedProductsWithVariables().length,
      enabledProducts: this.getEnabledProducts().length,
      lastUpdated: new Date()
    };
  }

  // Update existing cached product
  updateCachedProduct(productId: number, rawProduct: IRawProduct): ICachedProduct {
    const processed = this.processProduct(rawProduct);
    this.productCache.set(productId, processed);
    return processed;
  }

  // Get product with full hierarchy (useful for complex products)
  getProductHierarchy(productId: number): any {
    const product = this.getCachedProduct(productId);
    if (!product) return null;

    return {
      ...product,
      totalComponents: this.countTotalComponents(product),
      totalVariables: product.variables.length,
      estimatedCost: this.calculateEstimatedCost(product)
    };
  }

  private countTotalComponents(product: ICachedProduct): number {
    let count = product.baseComponents.length;
    
    // Count components in variables
    product.variables.forEach(variable => {
      count += variable.components.length;
    });

    // Count sub-components recursively
    const countSubComponents = (components: ICachedComponent[]): number => {
      return components.reduce((total, comp) => {
        let subCount = 0;
        if (comp.subComponents) {
          subCount = comp.subComponents.length + countSubComponents(comp.subComponents);
        }
        return total + subCount;
      }, 0);
    };

    count += countSubComponents(product.baseComponents);

    return count;
  }

  private calculateEstimatedCost(product: ICachedProduct): number {
    let totalCost = product.lastCost || 0;

    // Add costs from base components
    product.baseComponents.forEach(comp => {
      totalCost += ((comp.unitPrice || 0) * (comp.quantity || 0));
    });

    return Number(totalCost.toFixed(2));
  }

  // Search products with null safety
  searchProducts(searchTerm: string): ICachedProduct[] {
    if (!searchTerm) return [];
    
    const term = searchTerm.toLowerCase();
    return this.getAllCachedProducts().filter(product => {
      try {
        return (
          (product.name && product.name.toLowerCase().includes(term)) ||
          (product.barcodes && product.barcodes.some(barcode => barcode && barcode.includes(term))) ||
          product.id.toString() === term
        );
      } catch (error) {
        console.warn(`Error searching product ${product.id}:`, error);
        return false;
      }
    });
  }
}

// Export singleton instance
export const productDataProcessor = new ExternalProductDataProcessor();

// Export types for use in other modules
export type { ICachedProduct, ICachedVariable, ICachedComponent, IRawProduct };