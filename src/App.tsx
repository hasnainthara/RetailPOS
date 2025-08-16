import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SaleProvider } from "./contexts/SaleContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import RepairsPage from "./pages/RepairsPage";
import SettingsPage from "./pages/SettingsPage";
import Layout from "./components/Layout";
import NotificationContainer from "./components/NotificationContainer";
import LoadingSpinner from "./components/LoadingSpinner";

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    // Register service worker for PWA functionality
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log("App is online");
      // Trigger sync of offline sales when coming back online
      const syncOfflineSales = async () => {
        try {
          const offlineSales = JSON.parse(
            localStorage.getItem("offline_sales") || "[]"
          );
          for (const offlineSale of offlineSales) {
            if (!offlineSale.synced) {
              // In a real app, this would sync with the backend
              console.log("Syncing offline sale:", offlineSale);
              offlineSale.synced = true;
            }
          }
          localStorage.setItem("offline_sales", JSON.stringify(offlineSales));
        } catch (error) {
          console.error("Failed to sync offline orders:", error);
        }
      };
      syncOfflineSales();
    };

    const handleOffline = () => {
      console.log("App is offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/repairs" element={<RepairsPage />} />
        {user?.role === "admin" && (
          <Route path="/settings" element={<SettingsPage />} />
        )}
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <SaleProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <AppContent />
              <NotificationContainer />
            </div>
          </Router>
        </NotificationProvider>
      </SaleProvider>
    </AuthProvider>
  );
}

export default App;
