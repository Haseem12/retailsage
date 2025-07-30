
export interface Product {
  id: number;
  name: string;
  price: number;
  icon: string;
  category: string;
  stock: number;
  barcode?: string;
  description?: string;
};

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  items: ReceiptItem[];
  subtotal: number;
  total: number;
  date: string;
}

export interface SpoilageEvent {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    reason: string;
    date: string;
}
