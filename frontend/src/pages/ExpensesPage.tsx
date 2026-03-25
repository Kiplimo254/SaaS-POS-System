import { useState } from "react";
import { useShop } from "@/context/ShopContext";
import { Receipt, Plus, Search, Trash2, Edit2, Calendar, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";
import { formatSafe } from "@/lib/utils";
import { format } from "date-fns";

const ExpensesPage = () => {
  const { expenses, fetchExpenses, currentShop, currencySymbol } = useShop();
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd")
  });

  // Fetch expense categories on mount
  useState(() => {
    api.get("expense-categories/").then(res => setExpenseCategories(res.data));
  });

  const filteredExpenses = expenses.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.category || !formData.amount || !formData.description) return;
    try {
      if (editingExpense) {
        await api.patch(`expenses/${editingExpense.id}/`, formData);
        toast.success("Expense record updated");
      } else {
        await api.post("expenses/", { ...formData, shop: currentShop?.id });
        toast.success("Expense logged successfully");
      }
      await fetchExpenses();
      setFormData({ 
        category: "", 
        amount: "", 
        description: "", 
        date: format(new Date(), "yyyy-MM-dd") 
      });
      setEditingExpense(null);
      setShowAdd(false);
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      await api.delete(`expenses/${id}/`);
      toast.success("Expense deleted");
      await fetchExpenses();
    } catch (e) {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Expense Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track and monitor business expenditures and overhead costs.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Log Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="pos-card p-4 flex items-center justify-between">
           <div>
              <p className="text-xs text-muted-foreground uppercase font-black tracking-tighter">Total Expenses</p>
              <h3 className="text-2xl font-bold">{currencySymbol}{formatSafe(expenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0))}</h3>
           </div>
           <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <Receipt className="w-5 h-5" />
           </div>
        </div>
      </div>

      <div className="pos-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by description or category..."
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-primary">Amount</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4 text-sm text-muted-foreground">
                   {format(new Date(expense.date), "dd MMM yyyy")}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                    {expense.category_name}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-foreground">
                  {expense.description}
                </td>
                <td className="px-5 py-4 text-sm font-black text-rose-500">
                  {currencySymbol}{formatSafe(expense.amount)}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingExpense(expense);
                        setFormData({
                          category: expense.category.toString(),
                          amount: expense.amount.toString(),
                          description: expense.description,
                          date: expense.date
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
                      onClick={() => handleDelete(expense.id)}
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
        if (!open) { setEditingExpense(null); setFormData({ category: "", amount: "", description: "", date: format(new Date(), "yyyy-MM-dd") }); }
        setShowAdd(open);
      }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Update Expense Claim" : "New Expenditure Entry"}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Accurate expense tracking is vital for calculating net profit and tax liability.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Classification</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-date">Date of Expense</Label>
                <div className="relative">
                  <Input
                    id="exp-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Total Amount</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="bg-zinc-900 border-zinc-800 text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-desc">Expenditure Description</Label>
              <Textarea
                id="exp-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe what this expense was for..."
                className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={handleSave} className="pos-gradient-primary">
              {editingExpense ? "Finalize Updates" : "Commit Expenditure"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
