export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'technician';
  isActive: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  model?: string;
  barcode: string;
  sku: string;
  image?: string;
  isAvailable: boolean;
  stockQuantity: number;
  minStockLevel: number;
  warranty: number; // in months
  specifications?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: Date;
  totalPurchases: number;
  lastVisit?: Date;
}

export interface SaleItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  warranty?: number; // in months
}

export interface Sale {
  id: string;
  customerId?: string;
  customer?: Customer;
  cashierId: string;
  cashier: User;
  items: SaleItem[];
  status: 'draft' | 'completed' | 'refunded' | 'cancelled';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Payment {
  id: string;
  saleId?: string;
  repairId?: string;
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
}

export interface RepairService {
  id: string;
  customerId: string;
  customer: Customer;
  technicianId?: string;
  technician?: User;
  deviceType: 'mobile' | 'laptop' | 'tablet' | 'other';
  brand: string;
  model: string;
  imei?: string;
  serialNumber?: string;
  issue: string;
  diagnosis?: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedTime: number; // in hours
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'received' | 'diagnosed' | 'waiting_parts' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  parts: RepairPart[];
  notes?: string;
  customerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  deliveredAt?: Date;
}

export interface RepairPart {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  cost: number;
  isWarrantyVoid?: boolean;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  products: Product[];
  productCategories: ProductCategory[];
  customers: Customer[];
  sales: Sale[];
  repairServices: RepairService[];
  currentSale: Sale | null;
  isOffline: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface SaleContextType {
  currentSale: Sale | null;
  createSale: (customerId?: string) => void;
  addItemToSale: (product: Product, quantity: number, discount?: number) => void;
  removeItemFromSale: (saleItemId: string) => void;
  updateItemQuantity: (saleItemId: string, quantity: number) => void;
  updateItemDiscount: (saleItemId: string, discount: number) => void;
  completeSale: (paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer') => Promise<void>;
  cancelSale: () => void;
  calculateTotal: () => number;
  scanBarcode: (barcode: string) => Promise<Product | null>;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

export interface OfflineSale {
  id: string;
  sale: Sale;
  timestamp: Date;
  synced: boolean;
}

export interface AppSettings {
  shopName: string;
  currency: string;
  taxRate: number;
  theme: 'light' | 'dark';
  language: string;
  autoLogoutTime: number; // in minutes
  receiptFooter: string;
  barcodeScanner: boolean;
  thermalPrinter: boolean;
}

export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  activeSales: number;
  lowStockItems: number;
  pendingRepairs: number;
  completedRepairs: number;
  popularProducts: { product: Product; count: number }[];
}

export interface Receipt {
  id: string;
  saleId?: string;
  repairId?: string;
  type: 'sale' | 'repair' | 'estimate';
  customerName: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  createdAt: Date;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  warranty?: number;
}

// Kitchen and Menu types for compatibility
export interface KitchenOrder {
  id: string;
  orderId?: string;
  tableNumber?: number;
  customerId?: string;
  customer?: Customer;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  priority: 'low' | 'normal' | 'high';
  estimatedTime: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  status: 'pending' | 'preparing' | 'ready';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
  allergens: string[];
  ingredients: string[];
  nutritionalInfo?: Record<string, any>;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}