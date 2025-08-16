import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Sale, SaleItem, Product, Customer, SaleContextType } from "../types";
import { useAuth } from "./AuthContext";
import { v4 as uuidv4 } from "uuid";

interface SaleState {
  currentSale: Sale | null;
  loading: boolean;
  error: string | null;
}

type SaleAction =
  | {
      type: "CREATE_SALE";
      payload: { customerId?: string; customer?: Customer };
    }
  | {
      type: "ADD_ITEM";
      payload: { product: Product; quantity: number; discount?: number };
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | {
      type: "UPDATE_QUANTITY";
      payload: { saleItemId: string; quantity: number };
    }
  | {
      type: "UPDATE_DISCOUNT";
      payload: { saleItemId: string; discount: number };
    }
  | { type: "COMPLETE_SALE_START" }
  | { type: "COMPLETE_SALE_SUCCESS" }
  | { type: "COMPLETE_SALE_FAILURE"; payload: string }
  | { type: "CANCEL_SALE" }
  | { type: "CLEAR_ERROR" };

const initialState: SaleState = {
  currentSale: null,
  loading: false,
  error: null,
};

function saleReducer(state: SaleState, action: SaleAction): SaleState {
  switch (action.type) {
    case "CREATE_SALE": {
      const { customerId, customer } = action.payload;
      const newSale: Sale = {
        id: uuidv4(),
        customerId,
        customer,
        cashierId: "", // Will be set from auth context
        cashier: {} as any, // Will be set from auth context
        items: [],
        status: "draft",
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        paymentMethod: "cash",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        currentSale: newSale,
        error: null,
      };
    }

    case "ADD_ITEM": {
      if (!state.currentSale) return state;

      const { product, quantity, discount = 0 } = action.payload;
      const existingItemIndex = state.currentSale.items.findIndex(
        (item) => item.productId === product.id
      );

      let updatedItems: SaleItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = state.currentSale.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = item.quantity + quantity;
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: (item.unitPrice - (item.discount || 0)) * newQuantity,
            };
          }
          return item;
        });
      } else {
        // Add new item
        const newItem: SaleItem = {
          id: uuidv4(),
          productId: product.id,
          product,
          quantity,
          unitPrice: product.price,
          discount,
          totalPrice: (product.price - discount) * quantity,
        };
        updatedItems = [...state.currentSale.items, newItem];
      }

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const tax = subtotal * 0.18; // 18% GST
      const total = subtotal + tax;

      return {
        ...state,
        currentSale: {
          ...state.currentSale,
          items: updatedItems,
          subtotal,
          tax,
          total,
          updatedAt: new Date(),
        },
      };
    }

    case "REMOVE_ITEM": {
      if (!state.currentSale) return state;

      const updatedItems = state.currentSale.items.filter(
        (item) => item.id !== action.payload
      );

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      return {
        ...state,
        currentSale: {
          ...state.currentSale,
          items: updatedItems,
          subtotal,
          tax,
          total,
          updatedAt: new Date(),
        },
      };
    }

    case "UPDATE_QUANTITY": {
      if (!state.currentSale) return state;

      const { saleItemId, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return saleReducer(state, { type: "REMOVE_ITEM", payload: saleItemId });
      }

      const updatedItems = state.currentSale.items.map((item) => {
        if (item.id === saleItemId) {
          return {
            ...item,
            quantity,
            totalPrice: (item.unitPrice - (item.discount || 0)) * quantity,
          };
        }
        return item;
      });

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      return {
        ...state,
        currentSale: {
          ...state.currentSale,
          items: updatedItems,
          subtotal,
          tax,
          total,
          updatedAt: new Date(),
        },
      };
    }

    case "UPDATE_DISCOUNT": {
      if (!state.currentSale) return state;

      const { saleItemId, discount } = action.payload;
      const updatedItems = state.currentSale.items.map((item) => {
        if (item.id === saleItemId) {
          return {
            ...item,
            discount,
            totalPrice: (item.unitPrice - discount) * item.quantity,
          };
        }
        return item;
      });

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      return {
        ...state,
        currentSale: {
          ...state.currentSale,
          items: updatedItems,
          subtotal,
          tax,
          total,
          updatedAt: new Date(),
        },
      };
    }

    case "COMPLETE_SALE_START":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "COMPLETE_SALE_SUCCESS":
      return {
        ...state,
        currentSale: null,
        loading: false,
        error: null,
      };

    case "COMPLETE_SALE_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "CANCEL_SALE":
      return {
        ...state,
        currentSale: null,
        error: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export function SaleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(saleReducer, initialState);
  const { user } = useAuth();

  const createSale = (customerId?: string) => {
    const customer = customerId
      ? mockCustomers.find((c) => c.id === customerId)
      : undefined;
    dispatch({ type: "CREATE_SALE", payload: { customerId, customer } });
  };

  const addItemToSale = (
    product: Product,
    quantity: number,
    discount?: number
  ) => {
    if (!product.isAvailable) {
      dispatch({
        type: "COMPLETE_SALE_FAILURE",
        payload: "Product is not available",
      });
      return;
    }

    if (product.stockQuantity < quantity) {
      dispatch({
        type: "COMPLETE_SALE_FAILURE",
        payload: "Insufficient stock",
      });
      return;
    }

    dispatch({ type: "ADD_ITEM", payload: { product, quantity, discount } });
  };

  const removeItemFromSale = (saleItemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: saleItemId });
  };

  const updateItemQuantity = (saleItemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { saleItemId, quantity } });
  };

  const updateItemDiscount = (saleItemId: string, discount: number) => {
    dispatch({ type: "UPDATE_DISCOUNT", payload: { saleItemId, discount } });
  };

  const completeSale = async (
    paymentMethod: "cash" | "card" | "upi" | "bank_transfer"
  ) => {
    if (!state.currentSale || !user) {
      dispatch({
        type: "COMPLETE_SALE_FAILURE",
        payload: "No active sale or user",
      });
      return;
    }

    if (state.currentSale.items.length === 0) {
      dispatch({
        type: "COMPLETE_SALE_FAILURE",
        payload: "Cannot complete sale with no items",
      });
      return;
    }

    dispatch({ type: "COMPLETE_SALE_START" });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const completedSale: Sale = {
        ...state.currentSale,
        cashierId: user.id,
        cashier: user,
        status: "completed",
        paymentMethod,
        completedAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in localStorage for offline support
      const existingSales = JSON.parse(localStorage.getItem("sales") || "[]");
      existingSales.push(completedSale);
      localStorage.setItem("sales", JSON.stringify(existingSales));

      // Update product stock
      state.currentSale.items.forEach((item) => {
        const product = item.product;
        product.stockQuantity -= item.quantity;
        // Update product in localStorage or send to API
      });

      dispatch({ type: "COMPLETE_SALE_SUCCESS" });
    } catch (error) {
      dispatch({
        type: "COMPLETE_SALE_FAILURE",
        payload: "Failed to complete sale",
      });
    }
  };

  const cancelSale = () => {
    dispatch({ type: "CANCEL_SALE" });
  };

  const calculateTotal = (): number => {
    return state.currentSale?.total || 0;
  };

  const scanBarcode = async (barcode: string): Promise<Product | null> => {
    try {
      // Simulate barcode scanning - in real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const product = mockProducts.find((p) => p.barcode === barcode);
      return product || null;
    } catch (error) {
      console.error("Barcode scan failed:", error);
      return null;
    }
  };

  const value: SaleContextType = {
    currentSale: state.currentSale,
    createSale,
    addItemToSale,
    removeItemFromSale,
    updateItemQuantity,
    updateItemDiscount,
    completeSale,
    cancelSale,
    calculateTotal,
    scanBarcode,
  };

  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
}

export function useSale(): SaleContextType {
  const context = useContext(SaleContext);
  if (context === undefined) {
    throw new Error("useSale must be used within a SaleProvider");
  }
  return context;
}

export { SaleContext };

// Mock data for development
const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    description: "Latest iPhone with A17 Pro chip",
    price: 999,
    category: "smartphones",
    brand: "Apple",
    model: "iPhone 15 Pro",
    barcode: "1234567890123",
    sku: "APL-IP15P-128",
    isAvailable: true,
    stockQuantity: 25,
    minStockLevel: 5,
    warranty: 12,
    specifications: {
      Storage: "128GB",
      Color: "Natural Titanium",
      Display: "6.1-inch Super Retina XDR",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    description: "Flagship Android smartphone",
    price: 799,
    category: "smartphones",
    brand: "Samsung",
    model: "Galaxy S24",
    barcode: "2345678901234",
    sku: "SAM-GS24-256",
    isAvailable: true,
    stockQuantity: 15,
    minStockLevel: 3,
    warranty: 12,
    specifications: {
      Storage: "256GB",
      Color: "Phantom Black",
      Display: "6.2-inch Dynamic AMOLED",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    phone: "+1234567890",
    email: "john@example.com",
    address: "123 Main St, City",
    createdAt: new Date(),
    totalPurchases: 2500,
    lastVisit: new Date(),
  },
  {
    id: "2",
    name: "Jane Smith",
    phone: "+1987654321",
    email: "jane@example.com",
    createdAt: new Date(),
    totalPurchases: 1200,
    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
];
