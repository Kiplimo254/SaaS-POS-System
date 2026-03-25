import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { MoveHorizontal, Plus, Search, Trash2, Calendar, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const StockAdjustmentPage = () => {
  const { products, fetchProducts, currentShop } = useShop();
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    adjustment_type: "Addition",
    reason: ""
  });

  // Fetch adjustments on mount
  useState(() => {
    api.get("stock-adjustments/").then(res => setAdjustments(res.data));
  });

  const handleSave = async () => {
    if (!formData.product || !formData.quantity || !formData.reason) return;
    try {
      await api.post("stock-adjustments/", { ...formData, shop: currentShop?.id });
      toast.success("Stock adjusted successfully");
      
      // Refresh adjustments and products (for stock quantity)
      const res = await api.get("stock-adjustments/");
      setAdjustments(res.data);
      await fetchProducts();
      
      setFormData({ product: "", quantity: "", adjustment_type: "Addition", reason: "" });
      setShowAdd(false);
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  const filteredAdjustments = adjustments.filter(adj => 
    adj.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    adj.reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Stock Adjustments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Rectify inventory levels due to wastage, damage, or corrections.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          New Adjustment
        </Button>
      </div>

      <div className="pos-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product or reason..."
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAdjustments.map((adj) => (
              <tr key={adj.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4 text-sm text-muted-foreground">
                   {format(new Date(adj.date), "dd MMM yyyy HH:mm")}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-foreground">
                  {adj.product_name}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    adj.adjustment_type === 'Addition' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {adj.adjustment_type}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-black">
                  {adj.adjustment_type === 'Addition' ? '+' : '-'}{adj.quantity}
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground italic">
                  {adj.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Perform Inventory Correction</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Manually adding or subtracting stock will immediately update the inventory balance.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select
                value={formData.product}
                onValueChange={(val) => setFormData({ ...formData, product: val })}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Choose product..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Stock: {p.stock_quantity})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select
                  value={formData.adjustment_type}
                  onValueChange={(val) => setFormData({ ...formData, adjustment_type: val })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    <SelectItem value="Addition">Addition (+)</SelectItem>
                    <SelectItem value="Subtraction">Subtraction (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adj-qty">Quantity</Label>
                <Input
                  id="adj-qty"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adj-reason">Justification / Reason</Label>
              <Textarea
                id="adj-reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g. Expired items, periodic recount, damaged in transit..."
                className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={handleSave} className="pos-gradient-primary">
              Verify & Adjust Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockAdjustmentPage;
