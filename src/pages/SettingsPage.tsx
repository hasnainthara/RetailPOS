import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { AppSettings, User } from '../types';
import {
  CogIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  PaintBrushIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon: Icon, children }: SettingsSectionProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center">
          <Icon className="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

function UserRow({ user, onEdit, onDelete }: UserRowProps) {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`badge ${
          user.role === 'admin' ? 'badge-info' : 'badge-success'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`badge ${
          user.isActive ? 'badge-success' : 'badge-danger'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="p-1 text-primary-600 hover:text-primary-700"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    shopName: 'Electronics Shop',
    currency: 'USD',
    taxRate: 18,
    theme: 'light',
    language: 'en',
    autoLogoutTime: 30,
    receiptFooter: 'Thank you for shopping with us!',
    barcodeScanner: true,
    thermalPrinter: false,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You do not have permission to access this page.',
      });
      return;
    }

    // Load settings and users
    const loadData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load settings from localStorage or use defaults
      const savedSettings = localStorage.getItem('pos_settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Failed to parse settings:', error);
        }
      }
      
      // Mock users data
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@restaurant.com',
          role: 'admin',
          isActive: true,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'John Cashier',
          email: 'cashier@electronicsshop.com',
          role: 'cashier',
          isActive: true,
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '3',
          name: 'Jane Technician',
          email: 'jane@electronicsshop.com',
          role: 'technician',
          isActive: false,
          createdAt: new Date('2024-02-01'),
        },
      ];
      
      setUsers(mockUsers);
      setLoading(false);
    };

    loadData();
  }, [user, addNotification]);

  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('pos_settings', JSON.stringify(settings));
      
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = (user: User) => {
    // In a real app, this would open an edit modal
    addNotification({
      type: 'info',
      title: 'Edit User',
      message: `Edit functionality for ${user.name} would open here.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      addNotification({
        type: 'success',
        title: 'User Deleted',
        message: `${userToDelete.name} has been removed.`,
      });
    }
  };

  const handleAddUser = () => {
    // In a real app, this would open an add user modal
    addNotification({
      type: 'info',
      title: 'Add User',
      message: 'Add user functionality would open here.',
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage restaurant settings and user accounts</p>
      </div>

      {/* Restaurant Settings */}
      <SettingsSection
        title="Restaurant Information"
        description="Basic information about your restaurant"
        icon={BuildingStorefrontIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name
            </label>
            <input
              type="text"
              className="input"
              value={settings.shopName}
              onChange={(e) => setSettings(prev => ({ ...prev, shopName: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              className="input"
              value={settings.currency}
              onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      {/* Financial Settings */}
      <SettingsSection
        title="Financial Settings"
        description="Configure tax rates and service charges"
        icon={CurrencyDollarIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="input"
              value={settings.taxRate}
              onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Footer
            </label>
            <textarea
              className="input"
              rows={3}
              value={settings.receiptFooter}
              onChange={(e) => setSettings(prev => ({ ...prev, receiptFooter: e.target.value }))}
              placeholder="Thank you for shopping with us!"
            />
          </div>
        </div>
      </SettingsSection>

      {/* App Settings */}
      <SettingsSection
        title="Application Settings"
        description="Configure app behavior and appearance"
        icon={PaintBrushIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              className="input"
              value={settings.theme}
              onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              className="input"
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Logout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              className="input"
              value={settings.autoLogoutTime}
              onChange={(e) => setSettings(prev => ({ ...prev, autoLogoutTime: parseInt(e.target.value) || 30 }))}
            />
          </div>
        </div>
      </SettingsSection>

      {/* User Management */}
      <SettingsSection
        title="User Management"
        description="Manage staff accounts and permissions"
        icon={UsersIcon}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Staff Accounts</h4>
            <button
              onClick={handleAddUser}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
              <p className="text-sm text-gray-500">Application details and status</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Version</p>
              <p className="text-lg text-gray-900">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Last Updated</p>
              <p className="text-lg text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-lg text-gray-900">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}