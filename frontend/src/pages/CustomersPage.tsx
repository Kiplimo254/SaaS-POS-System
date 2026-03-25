import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { Users, Plus, Search, Trash2, Edit2, Mail, Phone, MapPin, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { formatSafe } from "@/lib/utils";

const CustomersPage = () => {
  const { customers, fetchCustomers, currentShop, currencySymbol } = useShop();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editingCustomer) {
        await api.patch(`customers/${editingCustomer.id}/`, formData);
        toast.success("Customer profile updated");
      } else {
        await api.post("customers/", { ...formData, shop: currentShop?.id });
        toast.success("Customer added successfully");
      }
      await fetchCustomers();
      setFormData({ name: "", email: "", phone: "", address: "" });
      setEditingCustomer(null);
      setShowAdd(false);
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`customers/${id}/`);
      toast.success("Customer deleted");
      await fetchCustomers();
    } catch (e) {
      toast.error("Failed to delete customer");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Customer CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customer relationships and loyalty data.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      <div className="pos-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-primary">Points</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="inline-flex items-center px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 font-bold text-xs">
                    {customer.points} PTS
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-foreground">{customer.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {customer.address || "No address"}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                       <Mail className="w-3 h-3" /> {customer.email || "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                       <Phone className="w-3 h-3" /> {customer.phone || "N/A"}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-bold text-foreground">
                    {currencySymbol}{formatSafe(customer.balance)}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setFormData({
                          name: customer.name,
                          email: customer.email || "",
                          phone: customer.phone || "",
                          address: customer.address || ""
                        });
                        setShowAdd(true);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(customer.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={(open) => {
        if (!open) { setEditingCustomer(null); setFormData({ name: "", email: "", phone: "", address: "" }); }
        setShowAdd(open);
      }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Refine Customer Data" : "Register New Customer"}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Capturing detailed customer information enables personalized marketing and rewards.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cust-name">Full Name</Label>
              <Input
                id="cust-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cust-email">Email Address</Label>
                <Input
                  id="cust-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-zinc-900 border-zinc-800 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-phone">Phone Number</Label>
                <Input
                  id="cust-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+254..."
                  className="bg-zinc-900 border-zinc-800 text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-addr">Physical Address</Label>
              <Input
                id="cust-addr"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Nairobi, Kenya"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={handleSave} className="pos-gradient-primary">
              {editingCustomer ? "Seal Profiles" : "Enlist Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersPage;
