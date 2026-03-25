import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { Ruler, Plus, Search, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
const UnitsPage = () => {
  const { units, fetchUnits, currentShop } = useShop();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", short_name: "" });

  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.short_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.short_name.trim()) return;
    try {
      if (editingUnit) {
        await api.patch(`units/${editingUnit.id}/`, formData);
        toast.success("Unit updated");
      } else {
        await api.post("units/", { ...formData, shop: currentShop?.id });
        toast.success("Unit created");
      }
      await fetchUnits();
      setFormData({ name: "", short_name: "" });
      setEditingUnit(null);
      setShowAdd(false);
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    try {
      await api.delete(`units/${id}/`);
      toast.success("Unit deleted");
      await fetchUnits();
    } catch (e) {
      toast.error("Failed to delete unit");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ruler className="w-6 h-6 text-primary" />
            Unit Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Define measurement units for your inventory.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Unit
        </Button>
      </div>

      <div className="pos-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search units..."
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Short Name</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUnits.map((unit) => (
              <tr key={unit.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4 text-sm font-mono text-muted-foreground">#{unit.id}</td>
                <td className="px-5 py-4">
                  <span className="text-sm font-medium text-foreground">{unit.name}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{unit.short_name}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingUnit(unit);
                        setFormData({ name: unit.name, short_name: unit.short_name });
                        setShowAdd(true);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(unit.id)}
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
        if (!open) { setEditingUnit(null); setFormData({ name: "", short_name: "" }); }
        setShowAdd(open);
      }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingUnit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Define a new measurement unit for your products.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Full Name</Label>
              <Input
                id="unit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Kilograms, Pieces, Liters"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short-name">Short Name</Label>
              <Input
                id="short-name"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                placeholder="e.g. kg, pcs, l"
                className="bg-zinc-900 border-zinc-800 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={handleSave} className="pos-gradient-primary">
              {editingUnit ? "Preserve Changes" : "Define Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitsPage;
