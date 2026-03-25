import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShopProvider, useShop } from "@/context/ShopContext";
import { POSLayout } from "@/components/pos/POSLayout";
import Dashboard from "@/pages/Dashboard";
import POSPage from "@/pages/POSPage";
import Inventory from "@/pages/Inventory";
import SalesHistory from "@/pages/SalesHistory";
import SettingsPage from "@/pages/SettingsPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";
import BrandsPage from "./pages/BrandsPage";
import UnitsPage from "./pages/UnitsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CustomersPage from "./pages/CustomersPage";
import ExpensesPage from "./pages/ExpensesPage";
import StockAdjustmentPage from "./pages/StockAdjustmentPage";
import StockTransferPage from "./pages/StockTransferPage";
import ReturnsPage from "./pages/ReturnsPage";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import Suppliers from "@/pages/Suppliers";
import Purchases from "@/pages/Purchases";
import ShopManagement from "@/pages/ShopManagement";
import UserManagement from "@/pages/UserManagement";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Checking Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { loading: authLoading } = useAuth();
  const { loading: shopLoading } = useShop();

  if (authLoading || shopLoading) {
    const message = authLoading ? "Checking Session..." : "Syncing POS Data...";
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <POSLayout />
            </ProtectedRoute>
          }
        >
          {/* System Management (Super Admin) */}
          <Route path="/system/shops" element={<ShopManagement />} />
          <Route path="/system/users" element={<UserManagement />} />
          
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<SalesHistory />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* User Management */}
          <Route path="/users" element={<UserManagement />} />
          <Route path="/users/roles" element={<PlaceholderPage />} />
          {/* Contacts */}
          <Route path="/contacts/suppliers" element={<Suppliers />} />
          <Route path="/contacts/customers" element={<CustomersPage />} />
          {/* Products sub-pages */}
          <Route path="/products/categories" element={<CategoriesPage />} />
          <Route path="/products/brands" element={<BrandsPage />} />
          <Route path="/products/units" element={<UnitsPage />} />
          {/* Purchases */}
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/returns" element={<ReturnsPage type="purchase" />} />
          {/* Sell */}
          <Route path="/sell/returns" element={<ReturnsPage type="sale" />} />
          {/* Stock */}
          <Route path="/stock-transfers" element={<StockTransferPage />} />
          <Route path="/stock-adjustments" element={<StockAdjustmentPage />} />
          {/* Expenses */}
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/expenses/categories" element={<PlaceholderPage />} />
          {/* Reports */}
          <Route path="/reports/sales" element={<PlaceholderPage />} />
          <Route path="/reports/purchases" element={<PlaceholderPage />} />
          <Route path="/reports/stock" element={<PlaceholderPage />} />
          <Route path="/reports/expenses" element={<PlaceholderPage />} />
          {/* Notifications */}
          <Route path="/notifications" element={<PlaceholderPage />} />
          {/* Settings sub */}
          <Route path="/settings/tax" element={<PlaceholderPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <ShopProvider>
          <AppContent />
        </ShopProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
