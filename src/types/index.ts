export type OrderStatus = 'Pending verification' | 'Pending confirmation' | 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'upi' | 'upi_gpay' | 'cod' | 'razorpay';
export type PaymentStatus = 'Pending verification' | 'Paid' | 'COD Pending' | 'Cash on Delivery' | 'Pending confirmation' | 'Pending' | 'pending' | 'paid' | 'failed';

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  pack_quantity: number;
  stock_quantity: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StoreSettings {
  id: number;
  delivery_charge: number;
  free_delivery_threshold: number | null;
  min_packs_per_order: number;
  cod_enabled: boolean;
  cod_min_order_value: number;
  estimated_delivery_time: string;
  allowed_pincodes: string;
  store_contact_email: string;
  store_whatsapp: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface OrderStatusHistoryItem {
  id?: string;
  order_id?: string;
  status: OrderStatus;
  note?: string;
  created_at: string;
}

export interface Order {
  id: string;
  confirmation_token?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  order_status: OrderStatus;
  tracking_number?: string | null;
  courier_name?: string | null;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
  order_status_history?: OrderStatusHistoryItem[];
}

export interface ShippingAddressForm {
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: PaymentMethod;
}
