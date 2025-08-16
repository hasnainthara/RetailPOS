import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CubeIcon,
} from '@heroicons/react/24/outline';

export default function TablesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to products page since tables are not relevant for electronics shop
    navigate('/products', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Redirecting to Products...</p>
      </div>
    </div>
  );
}