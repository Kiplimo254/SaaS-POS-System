import { useState, useRef, useEffect, useCallback } from "react";
import { formatSafe } from "@/lib/utils";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  ScanBarcode,
  X,
  CheckCircle,
  Tag,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Product, Sale, Category, CartItem } from "@/types/pos";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import PrintableReceipt from "@/components/pos/PrintableReceipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const POSPage = () => {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartTotal,
    cartTax,
    cartGrandTotal,
    addSale,
    sales,
    currencySymbol,
    categories,
    currentShop,
  } = useShop();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter((p: Product) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory ? p.category === selectedCategory : true;
    return matchSearch && matchCat && p.stock_quantity > 0;
  });

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const product = products.find((p: Product) => p.barcode === barcode);
      if (product) {
        if (product.stock_quantity <= 0) {
          toast.error(`${product.name} is out of stock`);
          return;
        }
        addToCart(product);
        toast.success(`Added ${product.name}`);
      } else {
        toast.error("Product not found");
      }
      setBarcodeInput("");
    },
    [products, addToCart]
  );

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Mpesa' | 'Bank' | 'Split'>('Cash');
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({
    Cash: "",
    Mpesa: "",
    Bank: ""
  });

  const handleBarcodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      handleBarcodeScan(barcodeInput.trim());
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${lastSale?.id || 'New'}`,
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Validate split payments if needed
    let finalPayments: any[] = [];
    if (paymentMethod === 'Split') {
      const totalSplit = Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0);
      if (Math.abs(totalSplit - cartGrandTotal) > 0.01) {
        toast.error(`Split total (${currencySymbol}${formatSafe(totalSplit)}) must equal grand total (${currencySymbol}${formatSafe(cartGrandTotal)})`);
        return;
      }
      finalPayments = Object.entries(splitAmounts)
        .filter(([_, val]) => parseFloat(val) > 0)
        .map(([method, val]) => ({ method, amount: Math.round(parseFloat(val) * 100) / 100 }));
    } else {
      finalPayments = [{ method: paymentMethod, amount: cartGrandTotal }];
    }

    try {
      const saleData: any = {
        total_amount: cartGrandTotal,
        tax_amount: cartTax,
        discount_amount: 0,
        payment_method: paymentMethod === 'Split' ? 'Mixed' : paymentMethod,
        payments: finalPayments,
      };
      
      const result = await addSale(saleData);
      setLastSale(result as any);
      setShowCheckout(false);
      setShowSuccess(true);
      setPaymentMethod('Cash');
      setSplitAmounts({ Cash: "", Mpesa: "", Bank: "" });
    } catch (error) {
      // Error handled by addSale toast
    }
  };

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const totalSplit = Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0);
  const remainingSplit = cartGrandTotal - totalSplit;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in-up">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        {/* Search Bar */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={barcodeRef}
                type="text"
                placeholder="Scan barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                className="w-48 pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 pos-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {categories.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="flex-1 overflow-auto p-4 pos-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-96 flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Current Cart</h2>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-destructive hover:underline">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto pos-scrollbar divide-y divide-border">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Scan a barcode or add products</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="p-3 hover:bg-secondary/30 transition-colors animate-scale-in">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.product.barcode}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                    {currencySymbol}{formatSafe(item.product.selling_price)} each
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                  {currencySymbol}{formatSafe(item.product.selling_price * item.quantity)}
                </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                      className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{currencySymbol}{formatSafe(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{currencySymbol}{formatSafe(cartTax)}</span>
            </div>
            <div className="flex justify-between text-foreground font-bold text-lg pt-1 border-t border-border">
              <span>Total</span>
              <span>{currencySymbol}{formatSafe(cartGrandTotal)}</span>
            </div>
          </div>
          <button
            onClick={() => cart.length > 0 && setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-xl pos-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Finalize Transaction</h3>
              <button onClick={() => setShowCheckout(false)} className="p-1 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Cash', 'Mpesa', 'Bank', 'Split'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m as any)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                        paymentMethod === m 
                          ? "pos-gradient-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "border-border bg-secondary/30 text-muted-foreground hover:border-muted hover:bg-secondary"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Payment Interface */}
              {paymentMethod === 'Split' && (
                <div className="p-4 bg-secondary/30 rounded-2xl border border-border space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-3 gap-3">
                    {['Cash', 'Mpesa', 'Bank'].map(m => (
                      <div key={m} className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">{m}</label>
                        <input
                          type="number"
                          value={splitAmounts[m]}
                          onChange={(e) => setSplitAmounts({ ...splitAmounts, [m]: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="text-xs text-zinc-400">Remaining to allocate:</span>
                    <span className={`text-sm font-bold ${remainingSplit === 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {currencySymbol}{formatSafe(remainingSplit)}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-xl">
                    <span className="text-sm font-bold text-foreground">Grand Total Due</span>
                    <span className="text-2xl font-black text-primary">{currencySymbol}{formatSafe(cartGrandTotal)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={paymentMethod === 'Split' && Math.abs(remainingSplit) > 0.01}
                className="w-full py-4 rounded-2xl pos-gradient-primary text-primary-foreground font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:shadow-none"
              >
                <CheckCircle className="w-5 h-5" />
                COMPLETE TRANSACTION
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success & Receipt Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader className="flex flex-col items-center justify-center pt-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">Transaction Success!</DialogTitle>
            <DialogDescription className="text-zinc-400 text-center">
              The sale has been recorded and inventory updated.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Transaction ID</span>
              <span className="font-bold">#{lastSale?.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Total Charged</span>
              <span className="font-bold text-emerald-400">{currencySymbol}{formatSafe(lastSale?.total_amount)}</span>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowSuccess(false)}
              className="border-zinc-800 hover:bg-zinc-900 text-white"
            >
              New Transaction
            </Button>
            <Button 
              onClick={() => handlePrint()}
              className="pos-gradient-primary text-white font-bold gap-2"
            >
              <ScanBarcode className="w-4 h-4" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Printable Content */}
      <div className="hidden">
        {lastSale && currentShop && (
          <PrintableReceipt 
            ref={receiptRef} 
            shop={currentShop} 
            sale={lastSale} 
          />
        )}
      </div>
    </div>
  );
};

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const { currencySymbol } = useShop();
  const isLowStock = product.stock_quantity < 10;

  return (
    <button
      onClick={() => onAdd(product)}
      className="pos-card-hover p-3 text-left flex flex-col gap-2 group"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{product.category_name}</p>
        </div>
        <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      </div>
      <div className="flex items-end justify-between mt-auto">
        <span className="text-lg font-bold text-foreground">{currencySymbol}{formatSafe(product.selling_price)}</span>
        <div className="flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-muted-foreground" />
          <span className={`text-xs font-medium ${isLowStock ? "text-destructive stock-pulse" : "text-pos-success"}`}>
            {product.stock_quantity}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground font-mono">{product.barcode}</p>
    </button>
  );
}

export default POSPage;
