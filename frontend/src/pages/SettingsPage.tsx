import { useState, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import { Store, Mail, Phone, MapPin, Save, Receipt, Globe, Percent, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SettingsPage = () => {
  const { currentShop, updateShop } = useShop();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    address: "",
    currency: "Ksh",
    tax_rate: "0.16",
    receipt_header: "",
    receipt_footer: "",
  });

  useEffect(() => {
    if (currentShop) {
      setFormData({
        name: currentShop.name || "",
        email: currentShop.email || "",
        contact_number: currentShop.contact_number || "",
        address: currentShop.address || "",
        currency: currentShop.currency || "Ksh",
        tax_rate: currentShop.tax_rate?.toString() || "0.16",
        receipt_header: currentShop.receipt_header || "",
        receipt_footer: currentShop.receipt_footer || "",
      });
    }
  }, [currentShop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShop(formData);
  };

  if (!currentShop) return null;

  return (
    <div className="p-6 space-y-6 animate-fade-in-up max-w-4xl pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          Enterprise Shop Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your shop identity and customer interaction touchpoints.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Identity */}
        <div className="space-y-6">
          <div className="pos-card p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Core Identity
            </h2>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-400">Shop Legal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-zinc-400">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-zinc-900/50 border-zinc-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-zinc-400">Contact Number</Label>
                  <Input
                    id="phone"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="bg-zinc-900/50 border-zinc-800"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className="text-zinc-400">Physical Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="pos-card p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Regional & Financial
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency" className="text-zinc-400">Currency Symbol</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tax" className="text-zinc-400">Default Tax Rate</Label>
                <div className="relative">
                  <Input
                    id="tax"
                    type="number"
                    step="0.001"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                    className="bg-zinc-900/50 border-zinc-800 pr-8"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Customization */}
        <div className="space-y-6">
          <div className="pos-card p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Receipt Architecture
            </h2>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="header" className="text-zinc-400">Header Branding</Label>
                <Textarea
                  id="header"
                  placeholder="e.g. Welcome to Our Store! | Tax PIN: 12345678"
                  value={formData.receipt_header}
                  onChange={(e) => setFormData({ ...formData, receipt_header: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800 min-h-[120px] font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground italic">Displayed at the top of every printed receipt.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="footer" className="text-zinc-400">Footer Note</Label>
                <Textarea
                  id="footer"
                  placeholder="e.g. Thank you for shopping with us! | Goods once sold are not returnable."
                  value={formData.receipt_footer}
                  onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800 min-h-[120px] font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground italic">Customer service messages shown at the bottom.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="gap-2 px-8 pos-gradient-primary shadow-lg shadow-primary/20 h-12 font-bold text-lg">
              <Save className="w-5 h-5" />
              Preserve Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
