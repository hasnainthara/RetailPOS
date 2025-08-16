import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { DashboardStats, Sale, RepairService } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon 
                  className={`h-4 w-4 mr-1 ${
                    trend.isPositive ? 'text-green-500' : 'text-red-500 transform rotate-180'
                  }`} 
                />
                <span className={`text-sm ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [recentRepairs, setRecentRepairs] = useState<RepairService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock dashboard stats
      const mockStats: DashboardStats = {
        todaySales: 28,
        todayRevenue: 125000.00,
        activeSales: 3,
        lowStockItems: 5,
        pendingRepairs: 12,
        completedRepairs: 8,
        popularProducts: [
          { product: { id: '1', name: 'iPhone 15 Pro', price: 99999 } as any, count: 8 },
          { product: { id: '2', name: 'Samsung Galaxy S24', price: 89999 } as any, count: 6 },
          { product: { id: '3', name: 'MacBook Air M3', price: 114900 } as any, count: 4 },
        ],
      };
      
      // Load recent sales and repairs from localStorage
      const storedSales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
      const recentSalesData = storedSales
        .sort((a: Sale, b: Sale) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      const storedRepairs = JSON.parse(localStorage.getItem('pos_repairs') || '[]');
      const recentRepairsData = storedRepairs
        .sort((a: RepairService, b: RepairService) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      setStats(mockStats);
      setRecentSales(recentSalesData);
      setRecentRepairs(recentRepairsData);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your electronics shop overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="bg-green-500"
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatCard
          title="Today's Sales"
          value={stats.todaySales}
          icon={ShoppingCartIcon}
          color="bg-blue-500"
          trend={{ value: 12.1, isPositive: true }}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={ExclamationTriangleIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Pending Repairs"
          value={stats.pendingRepairs}
          icon={WrenchScrewdriverIcon}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
            <Link to="/sales" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="card-body">
            {recentSales.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent sales</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {sale.customer ? sale.customer.name : 'Walk-in Customer'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sale.items.length} items • ₹{sale.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        sale.status === 'completed' ? 'badge-success' :
                        sale.status === 'draft' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {sale.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Popular Products Today</h3>
            <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700">
              View products
            </Link>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {stats.popularProducts.map((item, index) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">₹{item.product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{item.count} sold</p>
                    <p className="text-sm text-gray-500">
                      ₹{(item.count * item.product.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/products"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CubeIcon className="h-8 w-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Products</span>
            </Link>
            <Link
              to="/sales"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCartIcon className="h-8 w-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">New Sale</span>
            </Link>
            <Link
              to="/repairs"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Repair Services</span>
            </Link>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <UsersIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-500">Reports</span>
              <span className="text-xs text-gray-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}