export interface Shop {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  email: string;
  currency: string;
  tax_rate: number | string;
  is_active: boolean;
  receipt_header?: string;
  receipt_footer?: string;
}

export interface Category {
  id: number;
  shop: number;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  shop: number;
  category: number;
  category_name?: string;
  brand?: number;
  brand_name?: string;
  unit?: number;
  unit_name?: string;
  name: string;
  description: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  alert_quantity: number;
  barcode: string;
  barcode_image?: string;
}

export interface Brand {
  id: number;
  shop: number;
  name: string;
  description?: string;
}

export interface Unit {
  id: number;
  shop: number;
  name: string;
  short_name: string;
}

export interface Customer {
  id: number;
  shop: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  points: number;
  balance: number | string;
}

export interface Expense {
  id: number;
  shop: number;
  category: number;
  category_name?: string;
  amount: number | string;
  description: string;
  date: string;
}

export interface StockAdjustment {
  id: number;
  shop: number;
  user: number;
  user_name?: string;
  product: number;
  product_name?: string;
  quantity: number;
  adjustment_type: 'Addition' | 'Subtraction';
  reason: string;
  date: string;
}

export interface StockTransfer {
  id: number;
  shop_from: number;
  shop_from_name?: string;
  shop_to: number;
  shop_to_name?: string;
  user: number;
  product: number;
  product_name?: string;
  quantity: number;
  status: 'Pending' | 'Completed';
  date: string;
}

export interface SaleReturn {
  id: number;
  sale: number;
  product: number;
  product_name?: string;
  quantity: number;
  amount_refunded: number | string;
  reason: string;
  date: string;
}

export interface Supplier {
  id: number;
  shop: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}

export interface PurchaseItem {
  id?: number;
  purchase?: number;
  product: number;
  product_name?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface Purchase {
  id: number;
  shop: number;
  supplier: number;
  supplier_name?: string;
  total_amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  purchase_date: string;
  items?: PurchaseItem[];
}

export interface SaleItem {
  id?: number;
  sale?: number;
  product: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SalePayment {
  id?: number;
  method: string;
  amount: number;
  timestamp?: string;
}

export interface Sale {
  id: number;
  shop: number;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_method?: string;
  timestamp: string;
  items?: SaleItem[];
  payments?: SalePayment[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
