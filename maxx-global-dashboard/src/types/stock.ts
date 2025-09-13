// src/types/stock.ts
export interface ProductSimple {
  id: number;
  name: string;
  code: string;
}

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  code: string;
  categoryName?: string;
}

export interface StockMovementResponse {
  id: number;
  product: ProductSummary;
  movementType: string;
  movementTypeCode: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
  batchNumber?: string;
  expiryDate?: string;
  referenceType?: string;
  referenceId?: number;
  documentNumber?: string;
  notes?: string;
  performedBy?: UserSummary;
  movementDate: string;
  createdDate: string;
  status: string;
}

export interface DailySummaryResponse {
  date: string;
  totalMovements: number;
  totalStockIn: number;
  totalStockOut: number;
  netChange: number;
}

export interface TopMovementProduct {
  productId: number;
  productName: string;
  productCode: string;
  totalMovements: number;
  totalQuantity: number;
}

export interface StockSummaryResponse {
  productId: number;
  productName: string;
  productCode: string;
  currentStock: number;
  totalStockIn?: number;
  totalStockOut?: number;
  averageCost?: number;
  totalValue?: number;
  lastMovementDate?: string;
  lastMovementType?: string;
}