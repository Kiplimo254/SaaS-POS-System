import { useState, useRef } from "react";
import {
  Search,
  Package,
  ArrowUpDown,
  Filter,
  Plus,
  Upload,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Product, Category } from "@/types/pos";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "@/components/pos/AddProductDialog";
import { formatSafe } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

type SortKey = "name" | "buying_price" | "selling_price" | "stock_quantity";

const Inventory = () => {
  const { products, categories, currencySymbol, fetchProducts } = useShop();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      await api.post("products/bulk_upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Products imported successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to import products. Check CSV format.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filtered = products
    .filter((p: Product) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter ? p.category === categoryFilter : true;
      return matchSearch && matchCat;
    })
    .sort((a: Product, b: Product) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      const cmp = typeof valA === "string" ? valA.localeCompare(valB as string) : (valA as number) - (valB as number);
      return sortAsc ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getStockBadge = (qty: number) => {
    if (qty <= 3) return { text: "Critical", className: "bg-destructive/10 text-destructive stock-pulse" };
    if (qty < 10) return { text: "Low", className: "bg-pos-warning/10 text-pos-warning" };
    return { text: "In Stock", className: "bg-pos-success/10 text-pos-success" };
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} products • {products.reduce((s: number, p: Product) => s + p.stock_quantity, 0)} total units
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBulkUpload}
            className="hidden"
            accept=".csv"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Bulk Import"}
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={categoryFilter ?? ""}
            onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
            className="pl-10 pr-8 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Categories</option>
            {categories.map((c: Category) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {(
                  [
                    { key: "name" as SortKey, label: "Product" },
                    { key: "buying_price" as SortKey, label: "Buying" },
                    { key: "selling_price" as SortKey, label: "Selling" },
                    { key: "stock_quantity" as SortKey, label: "Stock" },
                  ] as const
                ).map(({ key, label }) => (
                  <th key={key} className="text-left px-5 py-3">
                    <button
                      onClick={() => toggleSort(key)}
                      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                    >
                      {label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                ))}
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Barcode
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => {
                const badge = getStockBadge(product.stock_quantity);
                return (
                  <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-muted-foreground">
                        {currencySymbol}{formatSafe(product.buying_price)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-foreground">
                        {currencySymbol}{formatSafe(product.selling_price)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-bold ${product.stock_quantity < 10 ? "text-destructive" : "text-foreground"}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-muted-foreground">{product.category_name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {product.barcode}
                      </code>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}>
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No products found</p>
          </div>
        )}
      </div>

      <AddProductDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default Inventory;
