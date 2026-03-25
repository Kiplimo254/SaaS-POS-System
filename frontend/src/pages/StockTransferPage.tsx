import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { ArrowLeftRight, Plus, Search, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const StockTransferPage = () => {
  const { products, fetchProducts, currentShop } = useShop();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    shop_to: "",
    product: "",
    quantity: ""
  });

  // Fetch transfers and shops on mount
  useState(() => {
    api.get("stock-transfers/").then(res => setTransfers(res.data));
    api.get("shops/").then(res => setShops(res.data));
  });

  const handleSave = async () => {
    if (!formData.shop_to || !formData.product || !formData.quantity) return;
    try {
      await api.post("stock-transfers/", { ...formData, shop_from: currentShop?.id });
      toast.success("Stock transfer initiated");
      
      const res = await api.get("stock-transfers/");
      setTransfers(res.data);
      await fetchProducts();
      
      setFormData({ shop_to: "", product: "", quantity: "" });
      setShowAdd(false);
    } catch (e) {
      toast.error("Transfer failed");
    }
  };

  const filteredTransfers = transfers.filter(t => 
    t.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.shop_to_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
            Inter-Shop Transfers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Move inventory between your different branch locations.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Transfer Stock
        </Button>
      </div>

      <div className="pos-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-zinc-800"
          />
        </div>
      </div>

      <div className="pos-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTransfers.map((t) => (
              <tr key={t.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4 text-sm text-muted-foreground">
                   {format(new Date(t.date), "dd MMM yyyy")}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-foreground text-primary">
                  {t.product_name}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-black tracking-tighter">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {t.shop_to_name}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-black">
                  {t.quantity} Units
                </td>
                <td className="px-5 py-4">
                   <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                     {t.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Initiate Stock Transfer</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Select the destination branch and products to move.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Destination Shop</Label>
              <Select
                value={formData.shop_to}
                onValueChange={(val) => setFormData({ ...formData, shop_to: val })}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select branch..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  {shops.filter(s => s.id !== currentShop?.id).map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select
                value={formData.product}
                onValueChange={(val) => setFormData({ ...formData, product: val })}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Identify product..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.stock_quantity} in stock)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trans-qty">Transfer Quantity</Label>
              <Input
                id="trans-qty"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={handleSave} className="pos-gradient-primary">
              Dispatch Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockTransferPage;
