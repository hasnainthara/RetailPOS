import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '../types';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeSlashIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit?: (item: MenuItem) => void;
  onToggleAvailability?: (itemId: string) => void;
}

function MenuItemCard({ item, onEdit, onToggleAvailability }: MenuItemCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className={`card hover:shadow-md transition-shadow ${
      !item.isAvailable ? 'opacity-60' : ''
    }`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              {!item.isAvailable && (
                <span className="badge badge-danger">
                  <EyeSlashIcon className="h-3 w-3 mr-1" />
                  Unavailable
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary-600">
                ${item.price.toFixed(2)}
              </span>
              
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                {item.preparationTime} min
              </div>
            </div>
            
            {item.allergens && item.allergens.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Allergens:</p>
                <div className="flex flex-wrap gap-1">
                  {item.allergens.map((allergen: string) => (
                    <span key={allergen} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {item.image && (
            <div className="ml-4 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
        
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
            <button
              onClick={() => onEdit?.(item)}
              className="btn btn-outline flex-1 text-sm py-2"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => onToggleAvailability?.(item.id)}
              className={`btn flex-1 text-sm py-2 ${
                item.isAvailable ? 'btn-warning' : 'btn-success'
              }`}
            >
              {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnavailable, setShowUnavailable] = useState(true);
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Load menu data
    const loadMenuData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock categories
      const mockCategories: MenuCategory[] = [
        { id: '1', name: 'Appetizers', description: 'Start your meal right', sortOrder: 1, isActive: true },
        { id: '2', name: 'Main Courses', description: 'Hearty and satisfying dishes', sortOrder: 2, isActive: true },
        { id: '3', name: 'Desserts', description: 'Sweet endings', sortOrder: 3, isActive: true },
        { id: '4', name: 'Beverages', description: 'Drinks and refreshments', sortOrder: 4, isActive: true },
      ];
      
      // Mock menu items
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
          ingredients: ['Romaine lettuce', 'Parmesan cheese', 'Croutons', 'Caesar dressing'],
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
          ingredients: ['Atlantic salmon', 'Seasonal vegetables', 'Lemon butter sauce'],
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
          ingredients: ['Mozzarella', 'Tomato sauce', 'Basil', 'Pizza dough'],
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
          ingredients: ['Chocolate', 'Flour', 'Eggs', 'Butter', 'Vanilla ice cream'],
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
          ingredients: ['Craft beer'],
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
          ingredients: ['Chicken wings', 'Buffalo sauce', 'BBQ sauce', 'Honey garlic sauce'],
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
  }, []);

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      )
    );
  };

  const handleEditItem = (item: MenuItem) => {
    // In a real app, this would open an edit modal
    console.log('Edit item:', item);
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesAvailability = showUnavailable || item.isAvailable;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Group items by category
  const groupedItems = categories.reduce((acc, category) => {
    const categoryItems = filteredItems.filter(item => item.category === category.name);
    if (categoryItems.length > 0) {
      acc[category.name] = categoryItems;
    }
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-gray-600">Browse and manage menu items</p>
        </div>
        
        {isAdmin && (
          <button className="btn btn-primary mt-4 sm:mt-0">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            {/* Availability toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showUnavailable}
                onChange={(e) => setShowUnavailable(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Show unavailable items</span>
            </label>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {selectedCategory === 'all' ? (
        // Show items grouped by category
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([categoryName, items]: [string, MenuItem[]]) => (
            <div key={categoryName}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{categoryName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onToggleAvailability={handleToggleAvailability}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show items in grid for specific category
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={handleEditItem}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}