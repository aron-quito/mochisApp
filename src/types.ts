export type PaymentMethod = 'Billetera Digital' | 'Efectivo / Cash' | 'Tarjeta / Transferencia' | 'Billetera Virtual' | 'Transacción Interbancaria' | 'Efectivo';

export interface Lot {
  id: string;
  quantity: number;
  remainingStock: number;
  totalCost: number; // Costo total de lo importado
  unitCost: number; // totalCost / quantity
  importDate: any; // Firebase Timestamp or ISO string
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
  sellingPrice: number; // Precio público
  imageUrl: string;
  location: string;
  lots: Lot[];
  createdAt: any;
  updatedAt: any;
}

export interface Sale {
  id: string;
  productId: string;
  lotId?: string; // Optional: linkage to specific lot
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  location: string;
  timestamp: any;
}

export type AppView = 'Home' | 'Inventory' | 'New Sale' | 'Reports' | 'Profile';
