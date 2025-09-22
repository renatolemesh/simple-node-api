export interface ExternalComponent {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  price: number;
  customize: boolean;
  subComponents?: ExternalComponent[];
}

export interface ExternalVariable {
  id: number;
  name: string;
  required: boolean;
  quantity: number;
  maximum: number;
  additional: boolean;
  additionalQuantity: number;
  additionalValue: number;
  components: ExternalComponent[];
}

export interface ExternalProduct {
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
  variables: ExternalVariable[];
  components: ExternalComponent[];
  createdAt: Date;
}

export interface CacheStatus {
  totalProducts: number;
  lastFetch: Date | null;
  isEmpty: boolean;
  processorStats?: {
    totalProducts: number;
    productsWithVariables: number;
    enabledProducts: number;
    lastUpdated: Date;
  };
}