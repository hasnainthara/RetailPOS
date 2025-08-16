import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useNotification } from '../contexts/NotificationContext';
import { MenuItem, MenuCategory } from '../types';
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingCartIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem, quantity: number, instructions?: string) => void;
}

function MenuItemCard({ item, onAddToOrder }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleAddToOrder = () => {
    onAddToOrder(item, quantity, instructions || undefined);
    setQuantity(1);
    setInstructions('');
    setShowInstructions(false);
  };

  if (!item.isAvailable) {
    return (
      <div className="card opacity-50">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-400">${item.price.toFixed(2)}</span>
            <span className="badge badge-danger">Unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="card-body">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-primary-600">${item.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">{item.preparationTime} min</span>
        </div>

        {item.allergens && item.allergens.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Allergens:</p>
            <div className="flex flex-wrap gap-1">
              {item.allergens.map((allergen) => (
                <span key={allergen} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Quantity selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {showInstructions ? 'Hide' : 'Add'} special instructions
            </button>
            {showInstructions && (
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special requests..."
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={2}
              />
            )}
          </div>

          {/* Add to order button */}
          <button
            onClick={handleAddToOrder}
            className="btn btn-primary w-full"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add to Order (${(item.price * quantity).toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
}

interface OrderSummaryProps {
  isOpen: boolean;
  onClose: () => void;
}

function OrderSummary({ isOpen, onClose }: OrderSummaryProps) {
  const { currentOrder, removeItemFromOrder, updateItemQuantity, completeOrder, cancelOrder } = useOrder();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      addNotification({
        type: 'error',
        title: 'Empty Order',
        message: 'Please add items to the order before submitting.',
      });
      return;
    }

    setSubmitting(true);
    try {
      completeOrder();
      addNotification({
        type: 'success',
        title: 'Order Submitted',
        message: `Order for Table ${currentOrder?.table?.number || 'Unknown'} has been sent to the kitchen.`,
      });
      navigate('/tables');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error instanceof Error ? error.message : 'Failed to submit order',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = () => {
    cancelOrder();
    navigate('/tables');
  };

  if (!isOpen || !currentOrder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Order - Table {currentOrder?.table?.number || 'Unknown'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Order items */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentOrder.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No items in order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentOrder.items.map((item: any) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                        <p className="text-sm text-gray-600">${item.unitPrice.toFixed(2)} each</p>
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-500 italic mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItemFromOrder(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-md bg-white hover:bg-gray-100"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-md bg-white hover:bg-gray-100"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order summary */}
          {currentOrder.items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%):</span>
                  <span>${currentOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>${currentOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="btn btn-primary w-full"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Order'
                  )}
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="btn btn-secondary w-full"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const { currentOrder, createOrder, addItemToOrder } = useOrder();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    if (!tableId) {
      navigate('/tables');
      return;
    }

    // Create order if it doesn't exist
    if (!currentOrder) {
      createOrder(tableId);
    }

    // Load menu data (same as MenuPage)
    const loadMenuData = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockCategories: MenuCategory[] = [
        { id: '1', name: 'Appetizers', description: 'Start your meal right', sortOrder: 1, isActive: true },
        { id: '2', name: 'Main Courses', description: 'Hearty and satisfying dishes', sortOrder: 2, isActive: true },
        { id: '3', name: 'Desserts', description: 'Sweet endings', sortOrder: 3, isActive: true },
        { id: '4', name: 'Beverages', description: 'Drinks and refreshments', sortOrder: 4, isActive: true },
      ];
      
      const mockMenuItems: MenuItem[] = [
        {
          id: '1',
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with parmesan cheese, croutons, and our signature Caesar dressing',
          price: 14.99,
          category: 'Appetizers',
          isAvailable: true,
          preparationTime: 10,
          allergens: ['Dairy', 'Gluten'],
          ingredients: [],
        },
        {
          id: '2',
          name: 'Grilled Salmon',
          description: 'Atlantic salmon grilled to perfection, served with seasonal vegetables and lemon butter sauce',
          price: 26.99,
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 20,
          allergens: ['Fish'],
          ingredients: [],
        },
        {
          id: '3',
          name: 'Margherita Pizza',
          description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil leaves',
          price: 18.99,
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 15,
          allergens: ['Dairy', 'Gluten'],
          ingredients: [],
        },
        {
          id: '4',
          name: 'Chocolate Lava Cake',
          description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
          price: 9.99,
          category: 'Desserts',
          isAvailable: false,
          preparationTime: 12,
          allergens: ['Dairy', 'Eggs', 'Gluten'],
          ingredients: [],
        },
        {
          id: '5',
          name: 'Craft Beer',
          description: 'Local craft beer selection - ask your server for today\'s options',
          price: 6.99,
          category: 'Beverages',
          isAvailable: true,
          preparationTime: 2,
          allergens: [],
          ingredients: [],
        },
        {
          id: '6',
          name: 'Chicken Wings',
          description: 'Crispy chicken wings with your choice of buffalo, BBQ, or honey garlic sauce',
          price: 12.99,
          category: 'Appetizers',
          isAvailable: true,
          preparationTime: 15,
          allergens: ['Dairy'],
          ingredients: [],
        },
        {
          id: '7',
          name: 'Ribeye Steak',
          description: '12oz prime ribeye steak cooked to your preference, served with mashed potatoes',
          price: 34.99,
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 25,
          allergens: [],
          ingredients: [],
        },
        {
          id: '8',
          name: 'Fresh Lemonade',
          description: 'House-made lemonade with fresh lemons and mint',
          price: 4.99,
          category: 'Beverages',
          isAvailable: true,
          preparationTime: 3,
          allergens: [],
          ingredients: [],
        },
      ];
      
      setCategories(mockCategories);
      setMenuItems(mockMenuItems);
      setLoading(false);
    };

    loadMenuData();
  }, [tableId, currentOrder, createOrder, navigate]);

  const handleAddToOrder = (item: MenuItem, quantity: number, instructions?: string) => {
    addItemToOrder(item, quantity, instructions);
    addNotification({
      type: 'success',
      title: 'Item Added',
      message: `${quantity}x ${item.name} added to order`,
      duration: 2000,
    });
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order - Table {currentOrder?.table?.number || tableId}
          </h1>
          <p className="text-gray-600">Select items to add to the order</p>
        </div>
        
        <button
          onClick={() => setShowOrderSummary(true)}
          className="btn btn-primary relative"
        >
          <ShoppingCartIcon className="h-5 w-5 mr-2" />
          View Order
          {currentOrder && currentOrder.items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {currentOrder.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category filter */}
            <select
              className="input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onAddToOrder={handleAddToOrder}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Order Summary Sidebar */}
      <OrderSummary
        isOpen={showOrderSummary}
        onClose={() => setShowOrderSummary(false)}
      />
    </div>
  );
}