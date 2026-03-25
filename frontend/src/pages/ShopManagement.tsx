import { useState, useEffect } from "react";
import { Plus, Store, User, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/context/ShopContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Shop } from "@/types/pos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const ShopManagement = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_number: "",
    email: "",
    currency: "Ksh",
    tax_rate: "0.16",
  });

  const fetchShops = async () => {
    try {
      const res = await api.get("shops/");
      setShops(res.data);
    } catch (error) {
      toast.error("Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("shops/", formData);
      toast.success("Shop created successfully");
      setIsAddDialogOpen(false);
      fetchShops();
      setFormData({
        name: "",
        address: "",
        contact_number: "",
        email: "",
        currency: "Ksh",
        tax_rate: "0.16",
      });
    } catch (error) {
      toast.error("Failed to create shop");
    }
  };

  const handleToggleShopStatus = async (shop: Shop) => {
    try {
      await api.patch(`shops/${shop.id}/`, { is_active: !shop.is_active });
      toast.success(`Shop ${shop.is_active ? 'suspended' : 'activated'} successfully`);
      fetchShops();
    } catch (error) {
      toast.error("Failed to update shop status");
    }
  };

  const handleDeleteShop = async (shop: Shop) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to PERMANENTLY delete ${shop.name}? All associated data will be lost.`)) return;
    
    try {
      await api.delete(`shops/${shop.id}/`);
      toast.success("Shop deleted successfully");
      fetchShops();
    } catch (error) {
      toast.error("Failed to delete shop");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Shop Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview and provisioning of all enterprise shop entities.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Provision New Shop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <div key={shop.id} className="pos-card p-6 group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Store size={80} />
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Store size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{shop.name}</h3>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-tighter">ID: SHOP-{shop.id.toString().padStart(3, '0')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={14} className="text-primary/60" />
                <span>{shop.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={14} className="text-primary/60" />
                <span>{shop.contact_number}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin size={14} className="text-primary/60" />
                <span>{shop.address}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {shop.is_active ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 px-2 py-0.5 text-[10px] font-bold">
                      <ShieldCheck size={10} /> ACTIVE
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 px-2 py-0.5 text-[10px] font-bold uppercase">
                      Suspended
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 hover:text-primary font-bold uppercase transition-colors">
                  Dashboard <ExternalLink size={10} />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleShopStatus(shop)}
                  className={`flex-1 text-[10px] font-black uppercase h-8 ${shop.is_active ? 'hover:bg-red-500/10 hover:text-red-500' : 'hover:bg-emerald-500/10 hover:text-emerald-500'}`}
                >
                  {shop.is_active ? "Suspend Operation" : "Restore Access"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteShop(shop)}
                  className="h-8 w-8 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-muted-foreground transition-all"
                >
                  <ShieldCheck size={14} className="rotate-45" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {shops.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-card/30 rounded-3xl border border-dashed border-border">
            <Store className="mx-auto w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground">No shops provisioned</h3>
            <p className="text-sm text-muted-foreground">Start by creating your first shop entity.</p>
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Provision New Shop</DialogTitle>
            <DialogDescription className="text-zinc-500">Enter the core details to initialize a new shop entity in the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateShop} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-400">Shop Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-400">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-zinc-400">Phone</Label>
                <Input
                  id="phone"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-zinc-400">Physical Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency" className="text-zinc-400">Currency Code</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tax" className="text-zinc-400">Tax Rate (e.g. 0.16)</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button type="submit" className="w-full pos-gradient-primary shadow-lg shadow-primary/20">
                Confirm Provisioning
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopManagement;
