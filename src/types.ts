export type PaymentMethod = 'Billetera Digital' | 'Efectivo / Cash' | 'Tarjeta / Transferencia' | 'Billetera Virtual' | 'Transacción Interbancaria' | 'Efectivo';

export interface Lot {
  id: string;
  quantity: number;
  remainingStock: number;
  totalCost: number;
  unitCost: number;
  importDate: any;
  // optional product info for journal view
  productName?: string;
  productSku?: string;
  sellingPrice?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  sizes: string[];
  material: string;
  totalStock: number;
  sellingPrice: number;
  imageUrl: string;
  location: string;
  lots: Lot[];
  createdAt: any;
  updatedAt: any;
}

export interface Sale {
  id: string;
  productId: string;
  lotId?: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  location: string;
  timestamp: any;
}

export interface ProductLog {
  id: string;
  product_id: string;
  product_name: string;
  event_type: 'import' | 'stock_withdrawal' | 'product_edit';
  quantity_delta: number;
  notes: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  created_at: string;
}

export type AppView = 'Home' | 'Inventory' | 'New Sale' | 'Reports' | 'Profile' | 'LotJournal' | 'Employees';
