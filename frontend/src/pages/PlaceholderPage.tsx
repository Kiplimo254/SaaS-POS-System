import { useLocation } from "react-router-dom";
import {
  Users,
  Contact,
  Tag,
  Layers,
  Ruler,
  ArrowDownToLine,
  RotateCcw,
  ArrowLeftRight,
  ClipboardEdit,
  Receipt,
  BarChart3,
  Mail,
  Settings,
} from "lucide-react";

const pageConfig: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  "/users": { title: "User Management", description: "Manage system users and their access", icon: Users },
  "/users/roles": { title: "Roles & Permissions", description: "Configure user roles and access levels", icon: Users },
  "/contacts/suppliers": { title: "Suppliers", description: "Manage your product suppliers", icon: Contact },
  "/contacts/customers": { title: "Customers", description: "Manage customer records", icon: Contact },
  "/products/categories": { title: "Product Categories", description: "Organize products by category", icon: Tag },
  "/products/brands": { title: "Brands", description: "Manage product brands", icon: Layers },
  "/products/units": { title: "Units of Measure", description: "Define product measurement units", icon: Ruler },
  "/purchases": { title: "Purchases", description: "Track all purchase orders", icon: ArrowDownToLine },
  "/purchases/returns": { title: "Purchase Returns", description: "Manage returned purchases", icon: RotateCcw },
  "/sell/returns": { title: "Sale Returns", description: "Process customer sale returns", icon: RotateCcw },
  "/stock-transfers": { title: "Stock Transfers", description: "Transfer stock between locations", icon: ArrowLeftRight },
  "/stock-adjustments": { title: "Stock Adjustments", description: "Adjust stock levels manually", icon: ClipboardEdit },
  "/expenses": { title: "Expenses", description: "Track business expenses", icon: Receipt },
  "/expenses/categories": { title: "Expense Categories", description: "Categorize your expenses", icon: Tag },
  "/reports/sales": { title: "Sales Report", description: "Analyze sales performance", icon: BarChart3 },
  "/reports/purchases": { title: "Purchase Report", description: "Analyze purchase history", icon: BarChart3 },
  "/reports/stock": { title: "Stock Report", description: "View stock levels and movement", icon: BarChart3 },
  "/reports/expenses": { title: "Expense Report", description: "Review expense breakdowns", icon: BarChart3 },
  "/notifications": { title: "Notification Templates", description: "Configure notification messages", icon: Mail },
  "/settings/tax": { title: "Tax Settings", description: "Configure tax rates and rules", icon: Settings },
};

const PlaceholderPage = () => {
  const location = useLocation();
  const config = pageConfig[location.pathname];

  if (!config) {
    return (
      <div className="p-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-foreground">Page Not Configured</h1>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
      </div>

      <div className="pos-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{config.title}</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          This module is ready for backend integration. Connect your Django API to enable full functionality.
        </p>
        <div className="mt-6 flex gap-3">
          <div className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-muted-foreground">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
