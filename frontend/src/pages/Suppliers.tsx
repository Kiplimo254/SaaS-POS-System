import { useState } from "react";
import {
  Search,
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Supplier } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { AddSupplierDialog } from "@/components/pos/AddSupplierDialog";

const Suppliers = () => {
  const { suppliers, fetchSuppliers } = useShop();
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filtered = suppliers.filter((s: Supplier) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your network of {suppliers.length} active vendors and business partners.
          </p>
        </div>
        <Button 
          size="sm" 
          className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Connect New Supplier
        </Button>
      </div>

      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search by business name, contact person, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
          />
        </div>
      </div>

      {/* Suppliers Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((supplier) => (
          <div 
            key={supplier.id} 
            className="pos-card p-5 group hover:border-primary/30 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-card to-card/50"
          >
            {/* Visual accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors duration-500"></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                <Users size={20} />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full">
                <ExternalLink size={14} />
              </Button>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="font-bold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">
                {supplier.name}
              </h3>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest opacity-80">
                {supplier.contact_person}
              </p>
            </div>

            <div className="mt-6 space-y-3 pt-4 border-t border-border/40">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-muted-foreground/70" />
                </div>
                <span className="truncate flex-1">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-muted-foreground/70" />
                </div>
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground pb-1">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-muted-foreground/70" />
                </div>
                <span className="truncate">{supplier.address || 'No address provided'}</span>
              </div>
            </div>
            
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1 text-xs font-bold h-9 border-border/40 bg-zinc-950/20 hover:bg-zinc-950/40">
                History
              </Button>
              <Button variant="outline" className="flex-1 text-xs font-bold h-9 border-border/40 bg-zinc-950/20 hover:bg-zinc-950/40">
                Edit
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-card/30 rounded-2xl border border-dashed border-border/60">
            <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground">
              <Users size={32} className="opacity-20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground/70">No suppliers found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or add a new vendor.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(true)}
              className="mt-4 border-primary/20 hover:bg-primary/5 text-primary font-bold"
            >
              Add Your First Supplier
            </Button>
          </div>
        )}
      </div>

      <AddSupplierDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSuccess={fetchSuppliers}
      />
    </div>
  );
};

export default Suppliers;
