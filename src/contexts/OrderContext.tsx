import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MenuItem } from '../types';

interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  status: 'pending' | 'preparing' | 'ready';
}

interface Order {
  id: string;
  customerId?: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  priority: 'low' | 'normal' | 'high';
  estimatedTime: number;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  table?: { number: string };
  createdAt: Date;
  updatedAt: Date;
}

interface OrderContextType {
  currentOrder: Order | null;
  createOrder: (tableId?: string) => void;
  addItemToOrder: (item: MenuItem, quantity: number, instructions?: string) => void;
  removeItemFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  completeOrder: () => void;
  cancelOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const createOrder = (tableId?: string) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      items: [],
      status: 'pending',
      priority: 'normal',
      estimatedTime: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      table: tableId ? { number: tableId } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentOrder(newOrder);
  };

  const addItemToOrder = (item: MenuItem, quantity: number, instructions?: string) => {
    if (!currentOrder) {
      createOrder();
    }

    const orderItem: OrderItem = {
      id: Date.now().toString(),
      menuItem: item,
      quantity,
      specialInstructions: instructions,
      status: 'pending',
    };

    setCurrentOrder(prev => {
      if (!prev) return null;
      const newItems = [...prev.items, orderItem];
      const newSubtotal = newItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      const newTax = newSubtotal * 0.1;
      const newTotal = newSubtotal + newTax;
      return {
        ...prev,
        items: newItems,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
        updatedAt: new Date(),
      };
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    setCurrentOrder(prev => {
      if (!prev) return null;
      const newItems = prev.items.filter(item => item.id !== itemId);
      const newSubtotal = newItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      const newTax = newSubtotal * 0.1;
      const newTotal = newSubtotal + newTax;
      return {
        ...prev,
        items: newItems,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
        updatedAt: new Date(),
      };
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }

    setCurrentOrder(prev => {
      if (!prev) return null;
      const newItems = prev.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      const newSubtotal = newItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      const newTax = newSubtotal * 0.1;
      const newTotal = newSubtotal + newTax;
      return {
        ...prev,
        items: newItems,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
        updatedAt: new Date(),
      };
    });
  };

  const completeOrder = () => {
    setCurrentOrder(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'completed',
        updatedAt: new Date(),
      };
    });
  };

  const cancelOrder = () => {
    setCurrentOrder(null);
  };

  return (
    <OrderContext.Provider value={{
      currentOrder,
      createOrder,
      addItemToOrder,
      removeItemFromOrder,
      updateItemQuantity,
      completeOrder,
      cancelOrder,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}