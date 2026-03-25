import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Shop, Product, Category, CartItem, Sale, Supplier, Purchase, Brand, Unit, Customer, Expense } from "@/types/pos";
import api from "@/lib/api";
import { toast } from "sonner";

interface ShopContextType {
  currentShop: Shop | null;
  products: Product[];
  categories: Category[];
  loading: boolean;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  fetchSuppliers: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSales: () => Promise<void>;
  fetchShop: () => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartTax: number;
  cartGrandTotal: number;
  sales: Sale[];
  purchases: Purchase[];
  addSale: (sale: Partial<Sale>) => Promise<void>;
  fetchPurchases: () => Promise<void>;
  currencySymbol: string;
  updateShop: (data: Partial<Shop>) => Promise<void>;
  brands: Brand[];
  units: Unit[];
  customers: Customer[];
  expenses: Expense[];
  fetchBrands: () => Promise<void>;
  fetchUnits: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  createBrand: (name: string) => Promise<void>;
  createUnit: (name: string) => Promise<void>;
  createCustomer: (data: Partial<Customer>) => Promise<void>;
  createExpense: (data: Partial<Expense>) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | null>(null);

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await api.get('purchases/');
      setPurchases(res.data);
    } catch (error) {
      console.error("Failed to fetch purchases", error);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api.get('suppliers/');
      setSuppliers(res.data);
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    }
  }, []);

  const fetchShop = useCallback(async () => {
    try {
      const res = await api.get('shops/');
      if (res.data.length > 0) setCurrentShop(res.data[0]);
    } catch (error) {
      console.error("Failed to fetch shop", error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('products/');
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('categories/');
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  const fetchSales = useCallback(async () => {
    try {
      const res = await api.get('sales/');
      setSales(res.data);
    } catch (error) {
      console.error("Failed to fetch sales", error);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await api.get("brands/");
      setBrands(res.data);
    } catch (e) { console.error("Failed to fetch brands", e); }
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await api.get("units/");
      setUnits(res.data);
    } catch (e) { console.error("Failed to fetch units", e); }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get("customers/");
      setCustomers(res.data);
    } catch (e) { console.error("Failed to fetch customers", e); }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await api.get("expenses/");
      setExpenses(res.data);
    } catch (e) { console.error("Failed to fetch expenses", e); }
  }, []);

  const createBrand = useCallback(async (name: string) => {
    try {
      const res = await api.post("brands/", { name });
      setBrands((prev) => [...prev, res.data]);
      toast.success("Brand created successfully");
    } catch (e) {
      console.error("Failed to create brand", e);
      toast.error("Failed to create brand");
      throw e;
    }
  }, []);

  const createUnit = useCallback(async (name: string) => {
    try {
      const res = await api.post("units/", { name });
      setUnits((prev) => [...prev, res.data]);
      toast.success("Unit created successfully");
    } catch (e) {
      console.error("Failed to create unit", e);
      toast.error("Failed to create unit");
      throw e;
    }
  }, []);

  const createCustomer = useCallback(async (data: Partial<Customer>) => {
    try {
      const res = await api.post("customers/", data);
      setCustomers((prev) => [...prev, res.data]);
      toast.success("Customer created successfully");
    } catch (e) {
      console.error("Failed to create customer", e);
      toast.error("Failed to create customer");
      throw e;
    }
  }, []);

  const createExpense = useCallback(async (data: Partial<Expense>) => {
    try {
      const res = await api.post("expenses/", data);
      setExpenses((prev) => [...prev, res.data]);
      toast.success("Expense created successfully");
    } catch (e) {
      console.error("Failed to create expense", e);
      toast.error("Failed to create expense");
      throw e;
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchShop(),
      fetchProducts(),
      fetchSales(),
      fetchCategories(),
      fetchSuppliers(),
      fetchPurchases(),
      fetchBrands(),
      fetchUnits(),
      fetchCustomers(),
      fetchExpenses(),
    ]);
    setLoading(false);
  }, [fetchShop, fetchProducts, fetchSales, fetchCategories, fetchSuppliers, fetchPurchases, fetchBrands, fetchUnits, fetchCustomers, fetchExpenses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock_quantity);
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { product, quantity: Math.min(qty, product.stock_quantity) }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateCartQty = (productId: number, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.min(qty, i.product.stock_quantity) }
          : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartGrandTotal = Math.round(cart.reduce((sum, i) => sum + i.product.selling_price * i.quantity, 0) * 100) / 100;
  const taxRate = currentShop?.tax_rate ? parseFloat(currentShop.tax_rate.toString()) : 0.16;
  const cartTotal = Math.round((cartGrandTotal / (1 + taxRate)) * 100) / 100;
  const cartTax = Math.round((cartGrandTotal - cartTotal) * 100) / 100;

  const addSale = async (partialSale: Partial<Sale>) => {
    try {
      const saleData = {
        shop: currentShop?.id,
        items: cart.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.selling_price,
          total_price: item.product.selling_price * item.quantity
        })),
        ...partialSale,
      };
      
      const response = await api.post('sales/', saleData);
      setSales((prev) => [response.data, ...prev]);
      
      // Refresh products to get updated stock
      await fetchProducts();
      
      clearCart();
      toast.success("Sale completed successfully");
      return response.data;
    } catch (error: any) {
      console.error("Sale failed", error);
      const detail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || "Unknown error");
      toast.error(`Sale failed: ${detail}`);
      throw error;
    }
  };

  const updateShop = async (data: Partial<Shop>) => {
    try {
      if (!currentShop) return;
      const res = await api.patch(`shops/${currentShop.id}/`, data);
      setCurrentShop(res.data);
      toast.success("Shop settings updated");
    } catch (error) {
      console.error("Failed to update shop", error);
      toast.error("Failed to update shop settings");
    }
  };

  const currencySymbol = currentShop?.currency || "Ksh";

  return (
    <ShopContext.Provider
      value={{
        currentShop,
        products,
        categories,
        loading,
        setProducts,
        suppliers,
        fetchSuppliers,
        fetchProducts,
        fetchCategories,
        fetchSales,
        fetchShop,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        cartTax,
        cartGrandTotal,
        sales,
        purchases,
        addSale,
        fetchPurchases,
        currencySymbol,
        updateShop,
        brands,
        fetchBrands,
        units,
        fetchUnits,
        customers,
        fetchCustomers,
        expenses,
        fetchExpenses,
        createBrand,
        createUnit,
        createCustomer,
        createExpense,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
