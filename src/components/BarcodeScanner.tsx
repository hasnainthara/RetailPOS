import React, { useState, useRef, useEffect } from 'react';
import { QrCodeIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export default function BarcodeScanner({ isOpen, onClose, onScan, title = 'Scan Barcode' }: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsScanning(false);
    } catch (err) {
      console.error('Camera access failed:', err);
      setError('Camera access denied or not available. Please use manual input.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setManualInput('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <QrCodeIcon className="h-6 w-6 mr-2" />
                {title}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Camera View */}
            <div className="mb-6">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {error ? (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <CameraIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-white border-dashed rounded-lg w-64 h-32 flex items-center justify-center">
                        <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          {isScanning ? 'Starting camera...' : 'Position barcode here'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Manual Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter barcode manually:
              </label>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter barcode number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Scan
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using barcode scanner
export function useBarcodeScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [onScanCallback, setOnScanCallback] = useState<((barcode: string) => void) | null>(null);

  const openScanner = (onScan: (barcode: string) => void) => {
    setOnScanCallback(() => onScan);
    setIsOpen(true);
  };

  const closeScanner = () => {
    setIsOpen(false);
    setOnScanCallback(null);
  };

  const handleScan = (barcode: string) => {
    if (onScanCallback) {
      onScanCallback(barcode);
    }
    closeScanner();
  };

  const ScannerComponent = () => (
    <BarcodeScanner
      isOpen={isOpen}
      onClose={closeScanner}
      onScan={handleScan}
    />
  );

  return {
    openScanner,
    closeScanner,
    ScannerComponent,
    isOpen
  };
}