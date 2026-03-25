import { useState, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import { RotateCcw, Search, Calendar, User, Package, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatSafe } from "@/lib/utils";

const ReturnsPage = ({ type }: { type: 'sale' | 'purchase' }) => {
  const { currentShop, currencySymbol, fetchProducts } = useShop();
  const [returns, setReturns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [targetData, setTargetData] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [reason, setReason] = useState("");

  const fetchReturns = async () => {
    try {
      const res = await api.get("returns/");
      setReturns(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchReturns();
  }, [type]);

  const handleLookup = async () => {
    if (!targetId) return;
    try {
      const endpoint = type === 'sale' ? `sales/${targetId}/` : `purchases/${targetId}/`;
      const res = await api.get(endpoint);
      setTargetData(res.data);
      setReturnItems(res.data.items.map((item: any) => ({ ...item, return_qty: 0 })));
    } catch (e) {
      toast.error(`${type.toUpperCase()} ID not found`);
    }
  };

  const handleSaveReturn = async () => {
    const itemsToReturn = returnItems.filter(i => i.return_qty > 0);
    if (itemsToReturn.length === 0 || !reason) return;

    try {
       for (const item of itemsToReturn) {
          await api.post("returns/", {
             sale: type === 'sale' ? targetData.id : null,
             purchase: type === 'purchase' ? targetData.id : null,
             product: item.product,
             quantity: item.return_qty,
             amount_refunded: item.unit_price * item.return_qty || item.unit_cost * item.return_qty,
             reason: reason
          });
       }
       toast.success("Return processed and stock updated");
       await fetchReturns();
       await fetchProducts();
       setShowAdd(false);
       setTargetData(null);
       setReturnItems([]);
       setReason("");
       setTargetId("");
    } catch (e) {
       toast.error("Process failed");
    }
  };

  const filteredReturns = returns.filter(r => 
    r.reason?.toLowerCase().includes(search.toLowerCase()) ||
    r.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-primary" />
            {type === 'sale' ? 'Sales Returns' : 'Purchase Returns'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Process reversals and restock items for {type === 'sale' ? 'customer returns' : 'supplier returns'}.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
          <RotateCcw className="w-4 h-4" />
          Process Return
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Refund</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredReturns.map((ret) => (
              <tr key={ret.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4 text-sm text-muted-foreground">
                   {format(new Date(ret.date), "dd MMM yyyy")}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-foreground">
                  {ret.product_name}
                </td>
                <td className="px-5 py-4 text-sm font-black">
                  {ret.quantity}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-emerald-500">
                  {currencySymbol}{formatSafe(ret.amount_refunded)}
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground italic">
                  {ret.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reverse Transaction Items</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Identify the original {type} ID to fetch items for reversal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 flex gap-2">
            <Input 
               placeholder={`Enter ${type.toUpperCase()} ID...`}
               value={targetId}
               onChange={(e) => setTargetId(e.target.value)}
               className="bg-zinc-900 border-zinc-800"
            />
            <Button onClick={handleLookup} variant="secondary">Identify</Button>
          </div>

          {targetData && (
            <div className="py-4 space-y-4">
               <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 flex justify-between items-center text-xs">
                  <div>
                     <span className="text-zinc-400">Date:</span> {format(new Date(targetData.timestamp || targetData.purchase_date), "dd/MM/yyyy")}
                  </div>
                  <div>
                     <span className="text-zinc-400">Total:</span> {currencySymbol}{targetData.total_amount}
                  </div>
               </div>

               <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {returnItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-zinc-900 rounded border border-transparent hover:border-zinc-800">
                       <span className="text-sm">{item.product_name} <span className="text-xs text-muted-foreground">(Sold: {item.quantity})</span></span>
                       <Input 
                          type="number" 
                          max={item.quantity}
                          min={0}
                          value={item.return_qty}
                          onChange={(e) => {
                             const val = parseInt(e.target.value);
                             setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, return_qty: isNaN(val) ? 0 : Math.min(val, it.quantity) } : it));
                          }}
                          className="w-20 h-8 bg-zinc-950 text-center"
                       />
                    </div>
                  ))}
               </div>

               <div className="space-y-2">
                  <Label>Discrepancy Reason</Label>
                  <Input 
                    placeholder="e.g. Broken seal, expired, wrong size..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-zinc-900 border-zinc-800"
                  />
               </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={handleSaveReturn} disabled={!targetData} className="pos-gradient-primary">
              Authorize Reversal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReturnsPage;
