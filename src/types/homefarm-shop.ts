export type Product = {
  id: string;
  name: string;
  icon: string;
  stock: number;
  unit: string;
  price: number;
  cost: number;
  color?: string;
  unlockDay?: number;
  category?: "core" | "fruit" | "meat" | "seafood" | "addon";
};

export type OrderItem = {
  id: string;
  qty: number;
};

export type CustomerType = {
  name: string;
  avatar: string;
  mood: string;
  patience: number;
  size: number;
  prefer?: string[];
  quote: string;
};

export type Customer = CustomerType & {
  orderNo: number;
  order: OrderItem[];
  repeat?: boolean;
};

export type MascotState =
  | "idle"
  | "happy"
  | "combo"
  | "wrong"
  | "hurry"
  | "fail"
  | "idea"
  | "thinking"
  | "trust";

export type ShopEvent = {
  id: string;
  title: string;
  description: string;
  type: "bad" | "good" | "neutral";
  cashDelta?: number;
  moodDelta?: number;
  stockDelta?: Record<string, number>;
};
