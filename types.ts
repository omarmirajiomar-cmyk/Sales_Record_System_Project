export enum UserRole {
  ADMIN = 'ADMIN',
  SALER = 'SALER'
}

export enum DebtorStatus {
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  UNPAID = 'UNPAID'
}

export type PaymentMethod = 'Cash' | 'AzamPesa';

export interface User {
  id: string;
  role: UserRole;
  pin: string;
  default_pin_changed: boolean;
  name: string;
  salary_amount?: number;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
  paymentMethod: PaymentMethod;
  date: string; // ISO String
}

export interface Expense {
  id: string;
  date: string; // ISO String
  amount: number;
  description: string;
  category: string;
}

export interface Debtor {
  id: string;
  name: string;
  phone: string;
  item_borrowed: string; // What item/product was borrowed (e.g., "10kg Sugar", "50L Cooking Oil", "Electronics")
  total_debt: number;
  balance: number;
  status: DebtorStatus;
  created_at: string;
}

export interface DebtorPayment {
  id: string;
  debtor_id: string;
  amount_paid: number;
  date: string;
  remaining_balance: number;
}

export interface MonthlySummary {
  month: number;
  year: number;
  total_sales: number;
  total_expenses: number;
  total_debtor_payments: number;
  salary_cost: number;
  profit_or_loss: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}