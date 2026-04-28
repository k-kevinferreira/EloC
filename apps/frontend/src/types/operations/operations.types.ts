import type { Product } from '@/types/catalog/catalog.types';

export type SaleEntry = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  paymentMethod: string;
  status: string;
  customerName: string | null;
  notes: string | null;
  soldAt: string;
  createdAt: string;
  product: Product;
};

export type SaleEntryMutationInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
  paymentMethod: string;
  status: string;
  customerName: string | null;
  notes: string | null;
  soldAt: string;
};

export type Expense = {
  id: string;
  shipmentId: string | null;
  type: string;
  description: string;
  amount: string;
  expenseDate: string;
  notes: string | null;
  createdAt: string;
  shipment: Shipment | null;
};

export type ExpenseMutationInput = {
  shipmentId: string | null;
  type: string;
  description: string;
  amount: number;
  expenseDate: string;
  notes: string | null;
};

export type Shipment = {
  id: string;
  code: string;
  supplier: string;
  shipmentDate: string;
  totalCost: string;
  notes: string | null;
  createdAt: string;
  items: ShipmentItem[];
  expenses: Omit<Expense, 'shipment'>[];
};

export type ShipmentItem = {
  id: string;
  shipmentId: string;
  productId: string;
  quantity: number;
  unitCost: string;
  totalCost: string;
  product: Product;
};

export type ShipmentItemMutationInput = {
  productId: string;
  quantity: number;
  unitCost: number;
};

export type ShipmentMutationInput = {
  code: string;
  supplier: string;
  shipmentDate: string;
  notes: string | null;
  items: ShipmentItemMutationInput[];
};
