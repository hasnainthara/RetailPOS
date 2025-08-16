import React, { useState, useEffect } from "react";
import { RepairService, Customer, RepairPart } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

interface RepairCardProps {
  repair: RepairService;
  onEdit: (repair: RepairService) => void;
  onUpdateStatus: (repairId: string, status: RepairService["status"]) => void;
}

function RepairCard({ repair, onEdit, onUpdateStatus }: RepairCardProps) {
  const getStatusColor = (status: RepairService["status"]) => {
    switch (status) {
      case "received":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    if (
      deviceType.toLowerCase().includes("phone") ||
      deviceType.toLowerCase().includes("mobile")
    ) {
      return DevicePhoneMobileIcon;
    }
    return ComputerDesktopIcon;
  };

  const DeviceIcon = getDeviceIcon(repair.deviceType);
  const estimatedCompletion = new Date(repair.createdAt);
  estimatedCompletion.setHours(estimatedCompletion.getHours() + repair.estimatedTime);
  const isOverdue =
    estimatedCompletion < new Date() &&
    repair.status !== "completed" &&
    repair.status !== "delivered";

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
        isOverdue
          ? "border-red-500"
          : repair.status === "completed"
          ? "border-green-500"
          : repair.status === "in_progress"
          ? "border-blue-500"
          : "border-yellow-500"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3">
          <DeviceIcon className="h-6 w-6 text-gray-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {repair.brand} {repair.model}
            </h3>
            <p className="text-sm text-gray-600 mb-1">{repair.deviceType}</p>
            <p className="text-xs text-gray-500 mb-2">
              {repair.issue}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {repair.customer.name}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {new Date(repair.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">
            ₹{repair.estimatedCost.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Est. Cost</div>
          {isOverdue && (
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Overdue
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              repair.status
            )}`}
          >
            {repair.status.replace("_", " ").toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            Due: {estimatedCompletion.toLocaleDateString()}
          </span>
        </div>
        {repair.technician && (
          <span className="text-xs text-gray-600">
            Tech: {repair.technician.name}
          </span>
        )}
      </div>

      {repair.parts && repair.parts.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1">Parts Used:</div>       
          <div className="flex flex-wrap gap-1">
            {repair.parts.map((part: any, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {part.name} (₹{part.cost})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {repair.status !== "delivered" && repair.status !== "cancelled" && (
            <select
              value={repair.status}
              onChange={(e) =>
                onUpdateStatus(
                  repair.id,
                  e.target.value as RepairService["status"]
                )
              }
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(repair)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Repair"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface NewRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    repair: Omit<RepairService, "id" | "createdAt" | "updatedAt">
  ) => void;
}

function NewRepairModal({ isOpen, onClose, onSubmit }: NewRepairModalProps) {
  const [formData, setFormData] = useState({
    customerId: "",
    deviceType: "",
    deviceBrand: "",
    deviceModel: "",
    issueDescription: "",
    estimatedCost: "",
    estimatedCompletion: "",
  });
  const [customers] = useState<Customer[]>(mockCustomers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === formData.customerId);
    if (!customer) return;

    onSubmit({
      customer,
      deviceType: formData.deviceType as 'mobile' | 'laptop' | 'tablet' | 'other',
      brand: formData.deviceBrand,
      model: formData.deviceModel,
      issue: formData.issueDescription,
      estimatedCost: parseFloat(formData.estimatedCost),
      estimatedTime: 24,
      priority: 'normal' as const,
      status: "received",
      technician: undefined,
      parts: [],
      notes: "",
      customerId: customer.id,
      technicianId: undefined,
    });

    setFormData({
      customerId: "",
      deviceType: "",
      deviceBrand: "",
      deviceModel: "",
      issueDescription: "",
      estimatedCost: "",
      estimatedCompletion: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            New Repair Service
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                value={formData.customerId}
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Type
              </label>
              <select
                value={formData.deviceType}
                onChange={(e) =>
                  setFormData({ ...formData, deviceType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Device Type</option>
                <option value="Smartphone">Smartphone</option>
                <option value="Tablet">Tablet</option>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Gaming Console">Gaming Console</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.deviceBrand}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceBrand: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Apple, Samsung"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={formData.deviceModel}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceModel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., iPhone 15, Galaxy S24"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Description
              </label>
              <textarea
                value={formData.issueDescription}
                onChange={(e) =>
                  setFormData({ ...formData, issueDescription: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the issue..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost (₹)
                </label>
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedCost: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Completion
                </label>
                <input
                  type="date"
                  value={formData.estimatedCompletion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedCompletion: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Repair
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RepairsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [repairs, setRepairs] = useState<RepairService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewRepairModal, setShowNewRepairModal] = useState(false);

  const isAdmin = user?.role === "admin";
  const isTechnician = user?.role === "technician";

  useEffect(() => {
    loadRepairs();
  }, []);

  const loadRepairs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRepairs(mockRepairs);
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to load repairs",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewRepair = (
    repairData: Omit<RepairService, "id" | "createdAt" | "updatedAt">
  ) => {
    const newRepair: RepairService = {
      ...repairData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setRepairs((prev) => [newRepair, ...prev]);
    addNotification({
      type: "success",
      title: "Repair Created",
      message: `Repair service created for ${newRepair.customer.name}`,
    });
  };

  const handleUpdateStatus = (
    repairId: string,
    status: RepairService["status"]
  ) => {
    setRepairs((prev) =>
      prev.map((repair) =>
        repair.id === repairId
          ? { ...repair, status, updatedAt: new Date() }
          : repair
      )
    );

    const repair = repairs.find((r) => r.id === repairId);
    addNotification({
      type: "info",
      title: "Status Updated",
      message: `${repair?.brand} ${
        repair?.model
      } marked as ${status.replace("_", " ")}`,
    });
  };

  const handleEdit = (repair: RepairService) => {
    addNotification({
      type: "info",
      title: "Edit Repair",
      message: "Repair editing functionality would open here",
    });
  };

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      repair.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || repair.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: repairs.length,
    received: repairs.filter((r) => r.status === "received").length,
    in_progress: repairs.filter((r) => r.status === "in_progress").length,
    completed: repairs.filter((r) => r.status === "completed").length,
    delivered: repairs.filter((r) => r.status === "delivered").length,
  };

  const overdueCount = repairs.filter(
    (r) =>
      r.createdAt < new Date(Date.now() - r.estimatedTime * 60 * 60 * 1000) &&
      r.status !== "completed" &&
      r.status !== "delivered"
  ).length;

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
          <h1 className="text-2xl font-bold text-gray-900">Repair Services</h1>
          <p className="text-gray-600">
            Manage device repairs and service requests
          </p>
        </div>
        {(isAdmin || isTechnician) && (
          <button
            onClick={() => setShowNewRepairModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New Repair
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">
            {statusCounts.all}
          </div>
          <div className="text-sm text-gray-600">Total Repairs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {statusCounts.received}
          </div>
          <div className="text-sm text-gray-600">Received</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {statusCounts.in_progress}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {statusCounts.completed}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search repairs, customers, devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Repairs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRepairs.map((repair) => (
          <RepairCard
            key={repair.id}
            repair={repair}
            onEdit={handleEdit}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </div>

      {filteredRepairs.length === 0 && (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 text-lg">No repairs found</div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your search criteria
          </div>
        </div>
      )}

      {/* New Repair Modal */}
      <NewRepairModal
        isOpen={showNewRepairModal}
        onClose={() => setShowNewRepairModal(false)}
        onSubmit={handleNewRepair}
      />
    </div>
  );
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+91 9876543210",
    address: "123 Main Street, City, State 12345",
    createdAt: new Date(),
    totalPurchases: 15000,
    lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+91 9876543211",
    address: "456 Oak Avenue, City, State 12346",
    createdAt: new Date(),
    totalPurchases: 8500,
    lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@email.com",
    phone: "+91 9876543212",
    address: "789 Pine Road, City, State 12347",
    createdAt: new Date(),
    totalPurchases: 22000,
    lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const mockRepairs: RepairService[] = [
  {
    id: "1",
    customerId: "1",
    customer: mockCustomers[0],
    technicianId: "1",
    technician: {
      id: "1",
      name: "Tech A",
      role: "technician",
      email: "tech.a@electronicsshop.com",
      isActive: true,
      createdAt: new Date(),
    },
    deviceType: "mobile",
    brand: "Apple",
    model: "iPhone 14 Pro",
    issue: "Cracked screen and battery draining fast",
    estimatedCost: 8500,
    actualCost: 8500,
    estimatedTime: 48,
    priority: "high",
    status: "in_progress",
    parts: [],
    notes: "Customer reported water damage as well",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "2",
    customerId: "2",
    customer: mockCustomers[1],
    deviceType: "laptop",
    brand: "Dell",
    model: "XPS 13",
    issue: "Keyboard not working, some keys stuck",
    estimatedCost: 3500,
    estimatedTime: 24,
    priority: "normal",
    status: "received",
    parts: [],
    notes: "",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    customerId: "3",
    customer: mockCustomers[2],
    technicianId: "2",
    technician: {
      id: "2",
      name: "Tech B",
      role: "technician",
      email: "tech.b@electronicsshop.com",
      isActive: true,
      createdAt: new Date(),
    },
    deviceType: "mobile",
    brand: "Samsung",
    model: "Galaxy S23",
    issue: "Charging port not working",
    estimatedCost: 2500,
    actualCost: 2200,
    estimatedTime: 12,
    priority: "normal",
    status: "completed",
    parts: [],
    notes: "Repair completed successfully",
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];
