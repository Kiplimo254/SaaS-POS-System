import React, { useState } from "react";
import {
  Search,
  ArrowDownToLine,
  Plus,
  Calendar,
  Layers,
  ShoppingBag,
  MoreVertical,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Purchase } from "@/types/pos";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Purchases = () => {
  const { purchases = [], suppliers, currencySymbol } = useShop() as any; // Temporary cast until purchases added to context
  const [search, setSearch] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Completed</Badge>;
      case 'PENDING': return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Pending</Badge>;
      case 'CANCELLED': return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track inventory replenishment and supplier invoices.
          </p>
        </div>
        <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Record New Purchase
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="pos-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Purchases</p>
            <p className="text-xl font-black text-foreground">{purchases.length}</p>
          </div>
        </div>
        <div className="pos-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ArrowDownToLine size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Stock Inflow</p>
            <p className="text-xl font-black text-foreground">
              {purchases.reduce((acc: number, p: any) => acc + (p.total_amount || 0), 0).toLocaleString()} <span className="text-xs">{currencySymbol}</span>
            </p>
          </div>
        </div>
        <div className="pos-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Pending Orders</p>
            <p className="text-xl font-black text-foreground">
              {purchases.filter((p: any) => p.status === 'PENDING').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by supplier or purchase ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/40 rounded-lg text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
          />
        </div>

        <div className="pos-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/40 bg-zinc-950/20">
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Purchase ID</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Supplier</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground italic font-medium">
                      No purchase records found.
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase: any) => (
                    <tr key={purchase.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary/60" />
                          <span className="text-sm font-medium">{format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-black text-foreground/80">#PUR-{purchase.id.toString().padStart(4, '0')}</td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-primary">{purchase.supplier_name || 'Generic Supplier'}</span>
                      </td>
                      <td className="p-4 font-black text-foreground">
                        {currencySymbol} {parseFloat(purchase.total_amount).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(purchase.status)}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full">
                          <MoreVertical size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases;
