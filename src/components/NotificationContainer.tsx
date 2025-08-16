import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type];
        const colorClass = colorMap[notification.type];
        const iconColorClass = iconColorMap[notification.type];

        return (
          <div
            key={notification.id}
            className={`p-4 border rounded-lg shadow-lg ${colorClass} slide-in`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className={`h-5 w-5 ${iconColorClass}`} />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">{notification.title}</h3>
                {notification.message && (
                  <p className="mt-1 text-sm opacity-90">{notification.message}</p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-600"
                  onClick={() => removeNotification(notification.id)}
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}