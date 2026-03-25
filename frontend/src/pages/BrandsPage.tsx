import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { Tag, Plus, Search, Trash2, Edit2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";

const BrandsPage = () => {
  const { brands, fetchBrands, currentShop } = useShop();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [brandName, setBrandName] = useState("");

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!brandName.trim()) return;
    try {
      if (editingBrand) {
        await api.patch(`brands/${editingBrand.id}/`, { name: brandName });
        toast.success("Brand updated");
      } else {
        await api.post("brands/", { name: brandName, shop: currentShop?.id });
        toast.success("Brand created");
      }
      await fetchBrands();
      setBrandName("");
      setEditingBrand(null);
      setShowAdd(false);
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await api.delete(`brands/${id}/`);
      toast.success("Brand deleted");
      await fetchBrands();
    } catch (e) {
      toast.error("Failed to delete brand");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" />
            Brand Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Organize your product catalog by manufacturer or brand.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Brand
        </Button>
      </div>

      <div className="pos-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-primary">ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brand Name</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBrands.map((brand) => (
              <tr key={brand.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4 text-sm font-mono text-muted-foreground">#{brand.id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{brand.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingBrand(brand);
                        setBrandName(brand.name);
                        setShowAdd(true);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(brand.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBrands.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                  No brands found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={(open) => {
        if (!open) { setEditingBrand(null); setBrandName(""); }
        setShowAdd(open);
      }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              {editingBrand ? "Modify the existing brand details below." : "Enter the manufacturer or brand name."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Samsung, Nike, Locally Sourced"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={handleSave} className="pos-gradient-primary">
              {editingBrand ? "Preserve Changes" : "Establish Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsPage;
