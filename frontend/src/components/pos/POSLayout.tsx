import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { Bell, User } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export function POSLayout() {
  const { currentShop, cart } = useShop();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold text-foreground">{currentShop?.name || 'Loading...'}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {cart.length} items
                </span>
              )}
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pos-danger rounded-full" />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <User className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto pos-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
