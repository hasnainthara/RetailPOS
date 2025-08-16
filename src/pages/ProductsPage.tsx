import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSale } from '../contexts/SaleContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBarcodeScanner } from '../components/BarcodeScanner';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onToggleAvailability?: (productId: string) => void;
  onAddToSale: (product: Product) => void;
}

function ProductCard({ product, onEdit, onToggleAvailability, onAddToSale }: ProductCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isLowStock = product.stockQuantity <= product.minStockLevel;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
      !product.isAvailable ? 'border-red-500 opacity-75' : 
      isLowStock ? 'border-yellow-500' : 'border-green-500'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{product.brand} {product.model}</p>
          <p className="text-xs text-gray-500 mb-2">{product.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>SKU: {product.sku}</span>
            <span>•</span>
            <span>Barcode: {product.barcode}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</div>
          <div className={`text-sm ${
            product.stockQuantity > product.minStockLevel ? 'text-green-600' :
            product.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Stock: {product.stockQuantity}
          </div>
          {isLowStock && (
            <div className="flex items-center text-xs text-yellow-600 mt-1">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Low Stock
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.isAvailable ? 'Available' : 'Unavailable'}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {product.warranty}M Warranty
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => onToggleAvailability?.(product.id)}
                className={`p-2 rounded-lg transition-colors ${
                  product.isAvailable 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={product.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              >
                {product.isAvailable ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => onEdit?.(product)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Product"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onAddToSale(product)}
            disabled={!product.isAvailable || product.stockQuantity === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Add to Sale
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { addItemToSale, scanBarcode } = useSale();
  const { addNotification } = useNotification();
  const { openScanner, ScannerComponent } = useBarcodeScanner();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setCategories(mockCategories);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load products',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToSale = (product: Product) => {
    addItemToSale(product, 1);
    addNotification({
      type: 'success',
      title: 'Added to Sale',
      message: `${product.name} added to current sale`,
    });
  };

  const handleToggleAvailability = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isAvailable: !product.isAvailable }
        : product
    ));
    
    const product = products.find(p => p.id === productId);
    addNotification({
      type: 'info',
      title: 'Product Updated',
      message: `${product?.name} marked as ${product?.isAvailable ? 'unavailable' : 'available'}`,
    });
  };

  const handleEdit = (product: Product) => {
    addNotification({
      type: 'info',
      title: 'Edit Product',
      message: 'Product editing functionality would open here',
    });
  };

  const handleBarcodeSearch = async (barcode: string) => {
    try {
      const product = await scanBarcode(barcode);
      if (product) {
        setSearchTerm(product.name);
        addNotification({
          type: 'success',
          title: 'Product Found',
          message: `Found: ${product.name}`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Product Not Found',
          message: 'No product found with this barcode',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Scan Failed',
        message: 'Failed to scan barcode',
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesAvailability = !showAvailableOnly || product.isAvailable;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const lowStockCount = products.filter(p => p.stockQuantity <= p.minStockLevel).length;
  const unavailableCount = products.filter(p => !p.isAvailable).length;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your electronics inventory</p>
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-5 w-5" />
            Add Product
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{products.filter(p => p.isAvailable).length}</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{unavailableCount}</div>
          <div className="text-sm text-gray-600">Unavailable</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, brands, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => openScanner(handleBarcodeSearch)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <QrCodeIcon className="h-5 w-5" />
            Scan Barcode
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Available only</span>
          </label>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={isAdmin ? handleEdit : undefined}
            onToggleAvailability={isAdmin ? handleToggleAvailability : undefined}
            onAddToSale={handleAddToSale}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No products found</div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your search criteria
          </div>
        </div>
      )}
      
      <ScannerComponent />
    </div>
  );
}

// Mock data
const mockCategories: ProductCategory[] = [
  { id: 'smartphones', name: 'Smartphones', sortOrder: 1, isActive: true },
  { id: 'laptops', name: 'Laptops', sortOrder: 2, isActive: true },
  { id: 'tablets', name: 'Tablets', sortOrder: 3, isActive: true },
  { id: 'accessories', name: 'Accessories', sortOrder: 4, isActive: true },
  { id: 'gaming', name: 'Gaming', sortOrder: 5, isActive: true },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip and titanium design',
    price: 99999,
    category: 'smartphones',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    barcode: '1234567890123',
    sku: 'APL-IP15P-128',
    isAvailable: true,
    stockQuantity: 25,
    minStockLevel: 5,
    warranty: 12,
    specifications: {
      'Storage': '128GB',
      'Color': 'Natural Titanium',
      'Display': '6.1-inch Super Retina XDR',
      'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Flagship Android smartphone with S Pen',
    price: 89999,
    category: 'smartphones',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    barcode: '2345678901234',
    sku: 'SAM-GS24U-256',
    isAvailable: true,
    stockQuantity: 3,
    minStockLevel: 5,
    warranty: 12,
    specifications: {
      'Storage': '256GB',
      'Color': 'Titanium Black',
      'Display': '6.8-inch Dynamic AMOLED 2X',
      'Camera': '200MP Main + 50MP Periscope + 12MP Ultra Wide + 10MP Telephoto'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'MacBook Air M3',
    description: '13-inch laptop with M3 chip',
    price: 114900,
    category: 'laptops',
    brand: 'Apple',
    model: 'MacBook Air M3',
    barcode: '3456789012345',
    sku: 'APL-MBA-M3-256',
    isAvailable: true,
    stockQuantity: 12,
    minStockLevel: 3,
    warranty: 12,
    specifications: {
      'Processor': 'Apple M3',
      'RAM': '8GB',
      'Storage': '256GB SSD',
      'Display': '13.6-inch Liquid Retina'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'AirPods Pro (3rd Gen)',
    description: 'Wireless earbuds with active noise cancellation',
    price: 24900,
    category: 'accessories',
    brand: 'Apple',
    model: 'AirPods Pro 3rd Gen',
    barcode: '4567890123456',
    sku: 'APL-APP3-WHT',
    isAvailable: false,
    stockQuantity: 0,
    minStockLevel: 10,
    warranty: 12,
    specifications: {
      'Type': 'In-ear',
      'Connectivity': 'Bluetooth 5.3',
      'Battery': 'Up to 6 hours',
      'Features': 'Active Noise Cancellation, Spatial Audio'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'PlayStation 5',
    description: 'Next-gen gaming console',
    price: 54990,
    category: 'gaming',
    brand: 'Sony',
    model: 'PlayStation 5',
    barcode: '5678901234567',
    sku: 'SNY-PS5-825',
    isAvailable: true,
    stockQuantity: 8,
    minStockLevel: 2,
    warranty: 12,
    specifications: {
      'Storage': '825GB SSD',
      'CPU': 'AMD Zen 2',
      'GPU': 'AMD RDNA 2',
      'RAM': '16GB GDDR6'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];