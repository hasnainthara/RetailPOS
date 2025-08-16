import React, { useState } from "react";
import { Sale, Customer } from "../types";
import { PrinterIcon } from "@heroicons/react/24/outline";

interface ReceiptData {
  sale: Sale;
  customer: Customer | null;
  paymentMethod: string;
  cashier: string;
  shopInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst: string;
  };
}

interface ReceiptPrinterProps {
  receiptData: ReceiptData;
  onPrint: () => void;
}

const defaultShopInfo = {
  name: "Electronics Shop POS",
  address: "123 Tech Street, Electronics Market, City - 123456",
  phone: "+91 9876543210",
  email: "info@electronicsshop.com",
  gst: "GST123456789",
};

export function ReceiptPrinter({ receiptData, onPrint }: ReceiptPrinterProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(generateReceiptHTML(receiptData));
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
      onPrint();
    } catch (error) {
      console.error("Print failed:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Receipt Preview */}
      <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
        <ReceiptPreview receiptData={receiptData} />
      </div>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        disabled={isPrinting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <PrinterIcon className="h-4 w-4" />
        {isPrinting ? "Printing..." : "Print Receipt"}
      </button>
    </div>
  );
}

function ReceiptPreview({ receiptData }: { receiptData: ReceiptData }) {
  const { sale, customer, paymentMethod, cashier, shopInfo } = receiptData;
  const subtotal = sale.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = subtotal - sale.total;
  const tax = sale.total * 0.18; // 18% GST
  const finalTotal = sale.total + tax;

  return (
    <div className="font-mono text-sm space-y-2">
      {/* Header */}
      <div className="text-center border-b pb-2">
        <div className="font-bold text-lg">{shopInfo.name}</div>
        <div className="text-xs">{shopInfo.address}</div>
        <div className="text-xs">Phone: {shopInfo.phone}</div>
        <div className="text-xs">Email: {shopInfo.email}</div>
        <div className="text-xs">GST: {shopInfo.gst}</div>
      </div>

      {/* Sale Info */}
      <div className="border-b pb-2">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span>{sale.id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date(sale.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>{cashier}</span>
        </div>
        {customer && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{customer.name}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="border-b pb-2">
        <div className="font-bold mb-1">ITEMS:</div>
        {sale.items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between">
              <span className="truncate">{item.product.name}</span>
              <span>₹{item.product.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                Qty: {item.quantity} x ₹{item.product.price.toLocaleString()}
              </span>
              <span>
                ₹{(item.product.price * item.quantity).toLocaleString()}
              </span>
            </div>
            {(item.discount ?? 0) > 0 && (
              <div className="flex justify-between text-xs text-red-600">
                <span>Discount:</span>
                <span>-₹{(item.discount || 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-b pb-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <span>-₹{discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>GST (18%):</span>
          <span>₹{tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>TOTAL:</span>
          <span>₹{finalTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="border-b pb-2">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="capitalize">{paymentMethod.replace("_", " ")}</span>
        </div>
        <div className="flex justify-between">
          <span>Amount Paid:</span>
          <span>₹{finalTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs pt-2">
        <div>Thank you for shopping with us!</div>
        <div>Visit us again soon!</div>
        <div className="mt-2">*** CUSTOMER COPY ***</div>
      </div>
    </div>
  );
}

function generateReceiptHTML(receiptData: ReceiptData): string {
  const { sale, customer, paymentMethod, cashier, shopInfo } = receiptData;
  const subtotal = sale.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = subtotal - sale.total;
  const tax = sale.total * 0.18;
  const finalTotal = sale.total + tax;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${sale.id}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 20px;
          width: 300px;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
        .flex { display: flex; justify-content: space-between; }
        .item { margin-bottom: 4px; }
        .total { font-size: 14px; font-weight: bold; }
        @media print {
          body { margin: 0; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="center border-bottom">
        <div class="bold" style="font-size: 16px;">${shopInfo.name}</div>
        <div>${shopInfo.address}</div>
        <div>Phone: ${shopInfo.phone}</div>
        <div>Email: ${shopInfo.email}</div>
        <div>GST: ${shopInfo.gst}</div>
      </div>
      
      <div class="border-bottom">
        <div class="flex"><span>Receipt #:</span><span>${sale.id
          .slice(-8)
          .toUpperCase()}</span></div>
        <div class="flex"><span>Date:</span><span>${new Date(
          sale.createdAt
        ).toLocaleString()}</span></div>
        <div class="flex"><span>Cashier:</span><span>${cashier}</span></div>
        ${
          customer
            ? `<div class="flex"><span>Customer:</span><span>${customer.name}</span></div>`
            : ""
        }
      </div>
      
      <div class="border-bottom">
        <div class="bold">ITEMS:</div>
        ${sale.items
          .map(
            (item) => `
          <div class="item">
            <div class="flex">
              <span>${item.product.name}</span>
              <span>₹${item.product.price.toLocaleString()}</span>
            </div>
            <div class="flex" style="font-size: 10px;">
              <span>Qty: ${
                item.quantity
              } x ₹${item.product.price.toLocaleString()}</span>
              <span>₹${(
                item.product.price * item.quantity
              ).toLocaleString()}</span>
            </div>
            ${
              (item.discount ?? 0) > 0
                ? `<div class="flex" style="font-size: 10px; color: #666;"><span>Discount:</span><span>-₹${(
                    item.discount ?? 0
                  ).toLocaleString()}</span></div>`
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
      
      <div class="border-bottom">
        <div class="flex"><span>Subtotal:</span><span>₹${subtotal.toLocaleString()}</span></div>
        ${
          discount > 0
            ? `<div class="flex"><span>Discount:</span><span>-₹${discount.toLocaleString()}</span></div>`
            : ""
        }
        <div class="flex"><span>GST (18%):</span><span>₹${tax.toLocaleString()}</span></div>
        <div class="flex total"><span>TOTAL:</span><span>₹${finalTotal.toLocaleString()}</span></div>
      </div>
      
      <div class="border-bottom">
        <div class="flex"><span>Payment Method:</span><span>${paymentMethod
          .replace("_", " ")
          .toUpperCase()}</span></div>
        <div class="flex"><span>Amount Paid:</span><span>₹${finalTotal.toLocaleString()}</span></div>
      </div>
      
      <div class="center" style="margin-top: 16px;">
        <div>Thank you for shopping with us!</div>
        <div>Visit us again soon!</div>
        <div style="margin-top: 8px;">*** CUSTOMER COPY ***</div>
      </div>
    </body>
    </html>
  `;
}

export default ReceiptPrinter;

// Hook for using receipt printer
export function useReceiptPrinter() {
  const [isVisible, setIsVisible] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const showReceipt = (data: ReceiptData) => {
    setReceiptData(data);
    setIsVisible(true);
  };

  const hideReceipt = () => {
    setIsVisible(false);
    setReceiptData(null);
  };

  const ReceiptModal = () => {
    if (!isVisible || !receiptData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Receipt Preview</h3>
            <button
              onClick={hideReceipt}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <ReceiptPrinter receiptData={receiptData} onPrint={hideReceipt} />
        </div>
      </div>
    );
  };

  return {
    showReceipt,
    hideReceipt,
    ReceiptModal,
  };
}
