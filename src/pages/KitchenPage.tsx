import React, { useState, useEffect } from 'react';
import { KitchenOrder, OrderItem } from '../types';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';

interface KitchenOrderCardProps {
  order: KitchenOrder;
  onUpdateStatus: (orderId: string, status: KitchenOrder['status']) => void;
  onUpdatePriority: (orderId: string, priority: KitchenOrder['priority']) => void;
}

function KitchenOrderCard({ order, onUpdateStatus, onUpdatePriority }: KitchenOrderCardProps) {
  const getStatusColor = (status: KitchenOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'ready':
        return 'bg-green-100 border-green-200 text-green-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority: KitchenOrder['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getElapsedTime = () => {
    const now = new Date();
    const created = new Date(order.createdAt);
    const elapsed = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
    return elapsed;
  };

  const getEstimatedTimeRemaining = () => {
    if (order.status === 'ready') return 0;
    
    const elapsed = getElapsedTime();
    const remaining = Math.max(0, order.estimatedTime - elapsed);
    return remaining;
  };

  const isOverdue = () => {
    return getElapsedTime() > order.estimatedTime && order.status !== 'ready';
  };

  return (
    <div className={`card hover:shadow-md transition-shadow ${
      isOverdue() ? 'ring-2 ring-red-300' : ''
    }`}>
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-gray-900">
              Table {order.tableNumber}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
              {order.priority} priority
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOverdue() && (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Timing info */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Elapsed Time</p>
            <p className={`text-sm font-medium ${
              isOverdue() ? 'text-red-600' : 'text-gray-900'
            }`}>
              {getElapsedTime()} min
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Est. Remaining</p>
            <p className="text-sm font-medium text-gray-900">
              {getEstimatedTimeRemaining()} min
            </p>
          </div>
        </div>

        {/* Order items */}
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-gray-700">Items:</h4>
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
              <div>
                <span className="font-medium text-gray-900">{item.menuItem.name}</span>
                {item.specialInstructions && (
                  <p className="text-sm text-gray-600 italic">
                    Note: {item.specialInstructions}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">x{item.quantity}</span>
                <p className="text-xs text-gray-500">{item.menuItem.preparationTime} min</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {order.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'preparing')}
              className="btn btn-primary w-full"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Start Preparing
            </button>
          )}
          
          {order.status === 'preparing' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'ready')}
              className="btn btn-success w-full"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Mark Ready
            </button>
          )}
          
          {order.status === 'ready' && (
            <div className="text-center py-2">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-green-600 font-medium">Ready for Service</p>
            </div>
          )}

          {/* Priority controls */}
          {order.status !== 'ready' && (
            <div className="flex space-x-2">
              <button
                onClick={() => onUpdatePriority(order.id, 'high')}
                disabled={order.priority === 'high'}
                className={`flex-1 btn text-sm py-2 ${
                  order.priority === 'high' ? 'btn-danger' : 'btn-outline'
                }`}
              >
                <FireIcon className="h-4 w-4 mr-1" />
                High Priority
              </button>
              <button
                onClick={() => onUpdatePriority(order.id, 'normal')}
                disabled={order.priority === 'normal'}
                className={`flex-1 btn text-sm py-2 ${
                  order.priority === 'normal' ? 'btn-primary' : 'btn-outline'
                }`}
              >
                Normal
              </button>
            </div>
          )}
        </div>

        {/* Order time */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
          Ordered at: {new Date(order.createdAt).toLocaleTimeString()}
          {order.startedAt && (
            <span className="ml-2">
              • Started: {new Date(order.startedAt).toLocaleTimeString()}
            </span>
          )}
          {order.completedAt && (
            <span className="ml-2">
              • Completed: {new Date(order.completedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | KitchenOrder['status']>('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');
  const { addNotification } = useNotification();

  useEffect(() => {
    // Load kitchen orders
    const loadKitchenOrders = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock kitchen orders
      const mockOrders: KitchenOrder[] = [
        {
          id: 'kitchen-1',
          orderId: 'order-1',
          tableNumber: 5,
          items: [
            {
              id: 'item-1',
              menuItem: {
                id: '2',
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon grilled with herbs',
                price: 26.99,
                category: 'Main Course',
                isAvailable: true,
                preparationTime: 20,
                allergens: ['fish'],
                ingredients: ['salmon', 'herbs', 'lemon']
              },
              quantity: 1,
              status: 'pending',
            },
            {
              id: 'item-2',
              menuItem: {
                id: '1',
                name: 'Caesar Salad',
                description: 'Crisp romaine lettuce with Caesar dressing',
                price: 14.99,
                category: 'Salads',
                isAvailable: true,
                preparationTime: 10,
                allergens: ['dairy', 'gluten'],
                ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'caesar dressing']
              },
              quantity: 2,
              status: 'pending',
            },
          ],
          priority: 'normal',
          estimatedTime: 25,
          status: 'pending',
          createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          updatedAt: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: 'kitchen-2',
          orderId: 'order-2',
          tableNumber: 3,
          items: [
            {
              id: 'item-3',
              menuItem: {
                id: '3',
                name: 'Margherita Pizza',
                description: 'Classic pizza with tomato, mozzarella and basil',
                price: 18.99,
                category: 'Pizza',
                isAvailable: true,
                preparationTime: 15,
                allergens: ['dairy', 'gluten'],
                ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'basil']
              },
              quantity: 1,
              status: 'preparing',
              specialInstructions: 'Extra cheese, no basil',
            },
          ],
          priority: 'high',
          estimatedTime: 18,
          status: 'preparing',
          createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          startedAt: new Date(Date.now() - 8 * 60 * 1000), // Started 8 minutes ago
          updatedAt: new Date(Date.now() - 8 * 60 * 1000)
        },
        {
          id: 'kitchen-3',
          orderId: 'order-3',
          tableNumber: 8,
          items: [
            {
              id: 'item-4',
              menuItem: {
                id: '6',
                name: 'Chicken Wings',
                description: 'Crispy chicken wings with buffalo sauce',
                price: 12.99,
                category: 'Appetizers',
                isAvailable: true,
                preparationTime: 15,
                allergens: ['gluten'],
                ingredients: ['chicken', 'buffalo sauce', 'celery']
              },
              quantity: 1,
              status: 'ready',
            },
          ],
          priority: 'normal',
          estimatedTime: 15,
          status: 'ready',
          createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
          startedAt: new Date(Date.now() - 18 * 60 * 1000),
          completedAt: new Date(Date.now() - 3 * 60 * 1000), // Completed 3 minutes ago
          updatedAt: new Date(Date.now() - 3 * 60 * 1000)
        },
        {
          id: 'kitchen-4',
          orderId: 'order-4',
          tableNumber: 12,
          items: [
            {
              id: 'item-5',
              menuItem: {
                id: '7',
                name: 'Ribeye Steak',
                description: 'Premium ribeye steak grilled to perfection',
                price: 34.99,
                category: 'Main Course',
                isAvailable: true,
                preparationTime: 25,
                allergens: [],
                ingredients: ['ribeye steak', 'herbs', 'garlic']
              },
              quantity: 2,
              status: 'pending',
              specialInstructions: 'Medium rare, no sides',
            },
          ],
          priority: 'low',
          estimatedTime: 12,
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          updatedAt: new Date(Date.now() - 2 * 60 * 1000)
        },
      ];
      
      setKitchenOrders(mockOrders);
      setLoading(false);
    };

    loadKitchenOrders();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadKitchenOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (orderId: string, status: KitchenOrder['status']) => {
    setKitchenOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status };
          
          if (status === 'preparing' && !order.startedAt) {
            updatedOrder.startedAt = new Date();
          } else if (status === 'ready' && !order.completedAt) {
            updatedOrder.completedAt = new Date();
          }
          
          return updatedOrder;
        }
        return order;
      })
    );

    // Show notification
    const order = kitchenOrders.find(o => o.id === orderId);
    if (order) {
      addNotification({
        type: 'success',
        title: 'Order Updated',
        message: `Table ${order.tableNumber} order marked as ${status}`,
        duration: 3000,
      });
    }
  };

  const handleUpdatePriority = (orderId: string, priority: KitchenOrder['priority']) => {
    setKitchenOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, priority } : order
      )
    );

    const order = kitchenOrders.find(o => o.id === orderId);
    if (order) {
      addNotification({
        type: 'info',
        title: 'Priority Updated',
        message: `Table ${order.tableNumber} set to ${priority} priority`,
        duration: 2000,
      });
    }
  };

  // Filter and sort orders
  const filteredOrders = kitchenOrders.filter(order => 
    filter === 'all' || order.status === filter
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
    }
    
    // Secondary sort by time (oldest first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const getStatusCount = (status: KitchenOrder['status']) => 
    kitchenOrders.filter(order => order.status === status).length;

  const getOverdueCount = () => 
    kitchenOrders.filter(order => {
      const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60);
      return elapsed > order.estimatedTime && order.status !== 'ready';
    }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kitchen Orders</h1>
        <p className="text-gray-600">Manage and track order preparation</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{getStatusCount('pending')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Preparing</p>
              <p className="text-2xl font-bold text-blue-900">{getStatusCount('preparing')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Ready</p>
              <p className="text-2xl font-bold text-green-900">{getStatusCount('ready')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{getOverdueCount()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All ({kitchenOrders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pending ({getStatusCount('pending')})
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`btn ${filter === 'preparing' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Preparing ({getStatusCount('preparing')})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`btn ${filter === 'ready' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Ready ({getStatusCount('ready')})
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'time' | 'priority')}
            className="input py-2"
          >
            <option value="time">Order Time</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedOrders.map((order) => (
          <KitchenOrderCard
            key={order.id}
            order={order}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePriority={handleUpdatePriority}
          />
        ))}
      </div>

      {sortedOrders.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'No orders in the kitchen queue.' : `No orders with status "${filter}".`}
          </p>
        </div>
      )}
    </div>
  );
}