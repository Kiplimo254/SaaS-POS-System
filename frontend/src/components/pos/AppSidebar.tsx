import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Users,
  Contact,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardEdit,
  Receipt,
  BarChart3,
  Mail,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  children?: { title: string; url: string }[];
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "System Management",
    icon: Store,
    roles: [UserRole.SUPER_ADMIN],
    children: [
      { title: "Manage Shops", url: "/system/shops" },
      { title: "Global Users", url: "/system/users" },
    ],
  },
  { title: "Home", url: "/", icon: LayoutDashboard },
  {
    title: "User Management",
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { title: "All Users", url: "/users" },
      { title: "Roles & Permissions", url: "/users/roles" },
    ],
  },
  {
    title: "Contacts",
    icon: Contact,
    children: [
      { title: "Suppliers", url: "/contacts/suppliers" },
      { title: "Customers", url: "/contacts/customers" },
    ],
  },
  {
    title: "Products",
    icon: Package,
    children: [
      { title: "All Products", url: "/inventory" },
      { title: "Categories", url: "/products/categories" },
      { title: "Brands", url: "/products/brands" },
      { title: "Units", url: "/products/units" },
    ],
  },
  {
    title: "Purchases",
    icon: ArrowDownToLine,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { title: "All Purchases", url: "/purchases" },
      { title: "Purchase Returns", url: "/purchases/returns" },
    ],
  },
  {
    title: "Sell",
    icon: ArrowUpFromLine,
    children: [
      { title: "POS", url: "/pos" },
      { title: "All Sales", url: "/sales" },
      { title: "Sale Returns", url: "/sell/returns" },
    ],
  },
  {
    title: "Stock Transfers",
    icon: ArrowLeftRight,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { title: "All Transfers", url: "/stock-transfers" },
    ],
  },
  {
    title: "Stock Adjustment",
    icon: ClipboardEdit,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { title: "Adjustments", url: "/stock-adjustments" },
    ],
  },
  {
    title: "Expenses",
    icon: Receipt,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { title: "All Expenses", url: "/expenses" },
      { title: "Expense Categories", url: "/expenses/categories" },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { title: "Sales Report", url: "/reports/sales" },
      { title: "Purchase Report", url: "/reports/purchases" },
      { title: "Stock Report", url: "/reports/stock" },
      { title: "Expense Report", url: "/reports/expenses" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      { title: "Business Settings", url: "/settings" },
      { title: "Tax Rates", url: "/settings/tax" },
    ],
  },
];

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";
  const { currentShop } = useShop();
  const { user, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isChildActive = (item: NavItem) =>
    item.children?.some((c) => location.pathname === c.url) ?? false;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.profile?.role as UserRole);
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar shadow-xl">
      <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-md">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg pos-gradient-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Store size={20} className="stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-sidebar-accent-foreground truncate leading-tight">
                  {currentShop?.name || 'Loading...'}
                </h2>
                <p className="text-[10px] text-sidebar-foreground/60 truncate font-black uppercase tracking-widest mt-0.5">
                  {user?.profile?.role || 'POS'} Session
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarContent className="flex-1 py-2 px-2 overflow-y-auto pos-scrollbar">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {filteredNavItems.map((item) => {
                  const hasChildren = !!item.children?.length;
                  const active = item.url ? location.pathname === item.url : isChildActive(item);
                  const open = openGroups[item.title] ?? active;

                  return (
                    <SidebarMenuItem key={item.title}>
                      {hasChildren ? (
                        <div className="space-y-0.5">
                          <SidebarMenuButton
                            onClick={() => toggleGroup(item.title)}
                            tooltip={item.title}
                            className={`w-full group hover:bg-white/5 active:scale-[0.98] transition-all duration-200 ${
                              active ? "text-primary font-bold" : "text-sidebar-foreground/80"
                            }`}
                          >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-primary transition-colors"}`} />
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-sm tracking-wide ml-2">{item.title}</span>
                                {open ? <ChevronDown className="w-3.5 h-3.5 opacity-40" /> : <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                              </>
                            )}
                          </SidebarMenuButton>

                          {!collapsed && open && (
                            <div className="ml-8 flex flex-col gap-0.5 border-l border-sidebar-border/30 pl-2 animate-in slide-in-from-top-1 duration-200">
                              {item.children?.map((child) => (
                                <NavLink
                                  key={child.url}
                                  to={child.url}
                                  onClick={() => setOpenMobile(false)}
                                  className="text-xs py-2 px-3 rounded-md transition-all duration-200 block text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5"
                                  activeClassName="text-primary font-bold bg-primary/10 shadow-sm"
                                >
                                  {child.title}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        item.url && (
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={item.title}
                            className={`group hover:bg-white/5 active:scale-[0.98] transition-all duration-200 ${
                              active ? "bg-primary/10 text-primary" : "text-sidebar-foreground/80"
                            }`}
                          >
                            <NavLink to={item.url} onClick={() => setOpenMobile(false)} className="flex items-center w-full">
                              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-primary transition-colors"}`} />
                              {!collapsed && (
                                <span className="text-sm tracking-wide ml-2">{item.title}</span>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        )
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-sidebar-border/30 bg-sidebar/20">
          <div className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg ring-1 ring-white/10 uppercase">
                {user?.username?.substring(0, 2) || 'U'}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-sidebar-accent-foreground truncate leading-none mb-1">
                    {user?.username}
                  </p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.1em] leading-none opacity-80">
                    {user?.profile?.role}
                  </p>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size={collapsed ? "icon" : "sm"}
              className={`w-full bg-white/5 border-white/5 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all duration-200 group ${collapsed ? 'h-8 w-8' : 'h-9 px-3'}`}
              onClick={handleLogout}
            >
              <LogOut className={`w-3.5 h-3.5 ${collapsed ? '' : 'mr-2'} group-hover:translate-x-0.5 transition-transform`} />
              {!collapsed && <span className="text-xs font-bold">Logout</span>}
            </Button>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
