import { useShop } from "@/context/ShopContext";
import { format } from "date-fns";
import { Sale } from "@/types/pos";
import { BarChart3, ShoppingBag, Clock, DollarSign, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatSafe } from "@/lib/utils";

const SalesHistory = () => {
  const { sales, currencySymbol, currentShop } = useShop();
  const totalRevenue = sales.reduce((s: number, sale: Sale) => s + sale.total_amount, 0);
  const totalTax = sales.reduce((s: number, sale: Sale) => s + sale.tax_amount, 0);

  const downloadPDFReport = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Date", "Summary", "Tax", "Discount", "Total"];
    const tableRows = sales.map(sale => [
      `#${sale.id}`,
      format(new Date(sale.timestamp), "yyyy-MM-dd HH:mm"),
      sale.items?.map(i => `${(i as any).product_name || 'Item'} x${i.quantity}`).join(", ").substring(0, 30) + (sale.items?.length && sale.items.length > 1 ? "..." : ""),
      `${currencySymbol}${formatSafe(sale.tax_amount)}`,
      sale.discount_amount > 0 ? `${currencySymbol}${formatSafe(sale.discount_amount)}` : "0.00",
      `${currencySymbol}${formatSafe(sale.total_amount)}`
    ]);

    // Header
    doc.setFontSize(22);
    doc.text(currentShop?.name || "Enterprise POS", 14, 20);
    doc.setFontSize(12);
    doc.text("Sales Transaction Report", 14, 30);
    doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 38);
    doc.text(`Total Revenue: ${currencySymbol}${formatSafe(totalRevenue)}`, 14, 46);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Sales_Report_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales History</h1>
          <p className="text-sm text-muted-foreground mt-1">{sales.length} transactions recorded</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="gap-2 border-zinc-800 text-muted-foreground hover:text-white">
            <Printer className="w-4 h-4" />
            Print View
          </Button>
          <Button onClick={downloadPDFReport} className="gap-2 pos-gradient-primary shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `${currencySymbol}${formatSafe(totalRevenue)}`, icon: DollarSign, gradient: "pos-gradient-primary" },
          { label: "Total Tax Collected", value: `${currencySymbol}${formatSafe(totalTax)}`, icon: BarChart3, gradient: "pos-gradient-accent" },
          { label: "Total Transactions", value: sales.length.toString(), icon: ShoppingBag, gradient: "pos-gradient-warning" },
        ].map((stat) => (
          <div key={stat.label} className="pos-stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Table */}
      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">#{sale.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(sale.timestamp), "MMM d, yyyy — h:mm a")}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-foreground">
                    {currencySymbol}{formatSafe(sale.total_amount)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">
                    {currencySymbol}{formatSafe(sale.tax_amount)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">
                    {sale.discount_amount > 0 ? `-${currencySymbol}${formatSafe(sale.discount_amount)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
