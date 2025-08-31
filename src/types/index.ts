// src/types/index.ts
import { OrderStatus } from "@prisma/client";

// No exportamos Decimal, ya que no se puede pasar a los componentes cliente
// import { Decimal } from "@prisma/client/runtime/library";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; // Usaremos 'number' en todo el frontend
  image: string | null;
  isActive: boolean;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primaryColor: string;
  backgroundColor: string;
  products: Product[];
  user: {
    name: string | null;
    email: string;
  };
}

export interface OrderItem {
    id: string;
    quantity: number;
    price: number; // Usaremos 'number'
    product: Product;
};

export interface Order {
    id:string;
    customerName: string;
    total: number; // Usaremos 'number'
    status: OrderStatus;
    createdAt: string;
    items: OrderItem[];
};