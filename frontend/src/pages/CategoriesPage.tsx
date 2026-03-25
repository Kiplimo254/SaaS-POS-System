import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { LayoutGrid, Plus, Search, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";

const CategoriesPage = () => {
  const { categories, fetchCategories, currentShop } = useShop();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editingCategory) {
        await api.patch(`categories/${editingCategory.id}/`, formData);
        toast.success("Category updated");
      } else {
        await api.post("categories/", { ...formData, shop: currentShop?.id });
        toast.success("Category created");
      }
      await fetchCategories();
      setFormData({ name: "", description: "" });
      setEditingCategory(null);
      setShowAdd(false);
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`categories/${id}/`);
      toast.success("Category deleted");
      await fetchCategories();
    } catch (e) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary" />
            Inventory Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Classify your products for better organization and reporting.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="pos-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classification</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCategories.map((category) => (
              <tr key={category.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4 text-sm font-mono text-muted-foreground">#{category.id}</td>
                <td className="px-5 py-4">
                  <span className="text-sm font-bold text-foreground">{category.name}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-muted-foreground line-clamp-1">{category.description || "—"}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCategory(category);
                        setFormData({ name: category.name, description: category.description || "" });
                        setShowAdd(true);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
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
        if (!open) { setEditingCategory(null); setFormData({ name: "", description: "" }); }
        setShowAdd(open);
      }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Alter Classification" : "New Infrastructure Category"}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Group products by type for streamlined search and analytics.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Identity</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Electronics, Fresh Produce, Apparel"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Operational Notes (Optional)</Label>
              <Input
                id="cat-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe what this category includes..."
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={handleSave} className="pos-gradient-primary">
              {editingCategory ? "Update Logic" : "Establish Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
