import React, { useState, useEffect } from 'react';
import { Sale, SaleItem, Customer, Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSale } from '../contexts/SaleContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBarcodeScanner } from '../components/BarcodeScanner';
import { useReceiptPrinter } from '../components/ReceiptPrinter';
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserIcon,
  CreditCardIcon,
  PrinterIcon,
  QrCodeIcon,
  XMarkIcon,
  CheckIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

interface SaleItemCardProps {
  item: SaleItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onRemove: (productId: string) => void;
}

function SaleItemCard({ item, onUpdateQuantity, onUpdateDiscount, onRemove }: SaleItemCardProps) {
  const [discountInput, setDiscountInput] = useState((item.discount || 0).toString());

  const handleDiscountChange = (value: string) => {
    setDiscountInput(value);
    const discount = parseFloat(value) || 0;
    if (discount >= 0 && discount <= 100) {
      onUpdateDiscount(item.product.id, discount);
    }
  };

  const itemTotal = (item.product.price * item.quantity) * (1 - (item.discount || 0) / 100);

  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
          <p className="text-sm text-gray-600">{item.product.brand} {item.product.model}</p>
          <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
        </div>
        <button
          onClick={() => onRemove(item.product.id)}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Unit Price:</span>
          <span className="font-medium">₹{item.product.price.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Quantity:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Discount (%):</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={discountInput}
            onChange={(e) => handleDiscountChange(e.target.value)}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="font-medium text-gray-900">Total:</span>
          <span className="font-bold text-lg text-blue-600">₹{itemTotal.toLocaleString()}</span>
        </div>
      </div>
      
      {/* Barcode scanner component would go here */}
    </div>
  );
}

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

function CustomerSelector({ selectedCustomer, onSelectCustomer }: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers] = useState<Customer[]>(mockCustomers);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <UserIcon className="h-5 w-5 text-gray-400" />
        <span className="flex-1 text-left">
          {selectedCustomer ? selectedCustomer.name : 'Select Customer (Optional)'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-hidden">
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={() => {
                onSelectCustomer(null);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Walk-in Customer</div>
              <div className="text-sm text-gray-500">No customer details</div>
            </button>
            {filteredCustomers.map(customer => (
              <button
                key={customer.id}
                onClick={() => {
                  onSelectCustomer(customer);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-t"
              >
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-gray-500">{customer.phone} • {customer.email}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  const { user } = useAuth();
  const {
    currentSale,
    addItemToSale,
    removeItemFromSale,
    updateItemQuantity,
    updateItemDiscount,
    completeSale,
    cancelSale,
    calculateTotal,
    scanBarcode,
  } = useSale();
  const { addNotification } = useNotification();
  const { openScanner, ScannerComponent } = useBarcodeScanner();
  const { showReceipt, ReceiptModal } = useReceiptPrinter();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'bank_transfer'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const total = calculateTotal();
  const hasItems = (currentSale?.items?.length || 0) > 0;

  const handleScanBarcode = async (barcode: string) => {
    try {
      const product = await scanBarcode(barcode);
      if (product) {
        addItemToSale(product, 1);
        addNotification({
          type: 'success',
          title: 'Product Added',
          message: `${product.name} added to sale`,
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

  const handleCompleteSale = async () => {
    if (!hasItems) return;

    setIsProcessing(true);
    try {
      await completeSale(paymentMethod);
      
      addNotification({
        type: 'success',
        title: 'Sale Completed',
        message: `Sale completed successfully. Total: ₹${total.toLocaleString()}`,
      });
      
      // Reset form
      setSelectedCustomer(null);
      setPaymentMethod('cash');
      setShowPayment(false);
      
      // Show receipt for printing
      if (currentSale) {
        showReceipt({
          sale: {
            ...currentSale,
            status: 'completed',
            paymentMethod,
            completedAt: new Date(),
          },
          customer: selectedCustomer,
          paymentMethod,
          cashier: user?.name || 'Cashier',
          shopInfo: {
            name: 'Electronics Shop POS',
            address: '123 Tech Street, Electronics Market, City - 123456',
            phone: '+91 9876543210',
            email: 'info@electronicsshop.com',
            gst: 'GST123456789',
          },
        });
      }
      
      addNotification({
        type: 'success',
        title: 'Sale Completed',
        message: 'Sale completed successfully. Receipt is ready for printing.',
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sale Failed',
        message: 'Failed to complete sale. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSale = () => {
    if (hasItems) {
      const confirmed = window.confirm('Are you sure you want to cancel this sale? All items will be removed.');
      if (confirmed) {
        cancelSale();
        setSelectedCustomer(null);
        setPaymentMethod('cash');
        setShowPayment(false);
        addNotification({
          type: 'info',
          title: 'Sale Cancelled',
          message: 'Sale has been cancelled',
        });
      }
    }
  };

  const paymentIcons = {
    cash: BanknotesIcon,
    card: CreditCardIcon,
    upi: DevicePhoneMobileIcon,
    bank_transfer: CreditCardIcon,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Sale</h1>
          <p className="text-gray-600">Scan products or add them manually</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openScanner(handleScanBarcode)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <QrCodeIcon className="h-5 w-5" />
            Scan Barcode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sale Items</h2>
            
            {hasItems ? (
              <div className="space-y-4">
                {currentSale?.items.map(item => (
                  <SaleItemCard
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateItemQuantity}
                    onUpdateDiscount={updateItemDiscount}
                    onRemove={removeItemFromSale}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 text-lg">No items in sale</div>
                <div className="text-gray-400 text-sm mt-2">
                  Scan a barcode or browse products to add items
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sale Summary */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer</h3>
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
            />
          </div>

          {/* Sale Total */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sale Summary</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Items:</span>
                <span>{currentSale?.items.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{(currentSale?.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-₹{((currentSale?.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0) - total).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {hasItems && (
              <div className="space-y-3">
                {!showPayment ? (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Proceed to Payment
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['cash', 'card', 'upi', 'bank_transfer'] as const).map(method => {
                          const Icon = paymentIcons[method];
                          return (
                            <button
                              key={method}
                              onClick={() => setPaymentMethod(method)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                paymentMethod === method
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm capitalize">
                                {method === 'bank_transfer' ? 'Bank' : method}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPayment(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCompleteSale}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isProcessing ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            Complete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCancelSale}
                  className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Sale
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <PrinterIcon className="h-4 w-4" />
                Print Last Receipt
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <UserIcon className="h-4 w-4" />
                Add New Customer
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ScannerComponent />
      <ReceiptModal />
    </div>
  );
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+91 9876543210',
    address: '123 Main Street, City, State 12345',
    createdAt: new Date(),
    totalPurchases: 5,
    lastVisit: new Date(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+91 9876543211',
    address: '456 Oak Avenue, City, State 12346',
    createdAt: new Date(),
    totalPurchases: 3,
    lastVisit: new Date(),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    phone: '+91 9876543212',
    address: '789 Pine Road, City, State 12347',
    createdAt: new Date(),
    totalPurchases: 8,
    lastVisit: new Date(),
  },
];