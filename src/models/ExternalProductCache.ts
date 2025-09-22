import { ExternalProduct } from '../types/ExternalProduct';

class ExternalProductCache {
  private cache: Map<number, ExternalProduct> = new Map();
  private allProducts: ExternalProduct[] = [];
  private lastFetch: Date | null = null;

  set(products: ExternalProduct[]): void {
    this.cache.clear();
    this.allProducts = products;
    products.forEach(product => {
      this.cache.set(product.id, product);
    });
    this.lastFetch = new Date();
  }

  get(id: number): ExternalProduct | undefined {
    return this.cache.get(id);
  }

  search(query: string): ExternalProduct[] {
    const searchTerm = query.toLowerCase();
    return this.allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.barcodes.some(barcode => barcode.includes(query)) ||
      product.id.toString() === query
    );
  }

  getAll(): ExternalProduct[] {
    return this.allProducts;
  }

  getByType(type: number): ExternalProduct[] {
    return this.allProducts.filter(product => product.type === type);
  }

  getWithVariables(): ExternalProduct[] {
    return this.allProducts.filter(product => product.hasVariables);
  }

  getEnabled(): ExternalProduct[] {
    return this.allProducts.filter(product => product.enabled);
  }

  isEmpty(): boolean {
    return this.cache.size === 0;
  }

  getLastFetch(): Date | null {
    return this.lastFetch;
  }

  clear(): void {
    this.cache.clear();
    this.allProducts = [];
    this.lastFetch = null;
  }

  size(): number {
    return this.cache.size;
  }
}

export const externalProductCache = new ExternalProductCache();