import { Shop, Category, Product, Sale } from "@/types/pos";

export const mockShop: Shop = {
  id: 1,
  name: "TechHub Electronics",
  address: "123 Main Street, Downtown",
  contact_number: "+1 (555) 123-4567",
  email: "info@techhub.com",
};

export const mockCategories: Category[] = [
  { id: 1, shop: 1, name: "Smartphones", description: "Mobile phones and accessories" },
  { id: 2, shop: 1, name: "Laptops", description: "Notebooks and ultrabooks" },
  { id: 3, shop: 1, name: "Audio", description: "Headphones, speakers, earbuds" },
  { id: 4, shop: 1, name: "Accessories", description: "Cables, chargers, cases" },
  { id: 5, shop: 1, name: "Wearables", description: "Smartwatches and fitness trackers" },
];

export const mockProducts: Product[] = [
  { id: 1, shop: 1, category: 1, category_name: "Smartphones", name: "iPhone 15 Pro", description: "Latest Apple flagship", price: 999.99, stock_quantity: 25, barcode: "APL15PRO001" },
  { id: 2, shop: 1, category: 1, category_name: "Smartphones", name: "Samsung Galaxy S24", description: "Samsung flagship phone", price: 849.99, stock_quantity: 18, barcode: "SAM24S001" },
  { id: 3, shop: 1, category: 2, category_name: "Laptops", name: 'MacBook Air M3 13"', description: "Ultra-thin Apple laptop", price: 1099.00, stock_quantity: 12, barcode: "APLMBA13M3" },
  { id: 4, shop: 1, category: 2, category_name: "Laptops", name: "Dell XPS 15", description: "Premium Windows laptop", price: 1299.99, stock_quantity: 8, barcode: "DELLXPS15" },
  { id: 5, shop: 1, category: 3, category_name: "Audio", name: "AirPods Pro 2", description: "Active noise cancelling earbuds", price: 249.99, stock_quantity: 45, barcode: "APLAPP2" },
  { id: 6, shop: 1, category: 3, category_name: "Audio", name: "Sony WH-1000XM5", description: "Premium noise cancelling headphones", price: 349.99, stock_quantity: 15, barcode: "SONYXM5" },
  { id: 7, shop: 1, category: 4, category_name: "Accessories", name: "USB-C Hub 7-in-1", description: "Multi-port adapter", price: 49.99, stock_quantity: 60, barcode: "USBC7IN1" },
  { id: 8, shop: 1, category: 4, category_name: "Accessories", name: "MagSafe Charger", description: "Wireless magnetic charger", price: 39.99, stock_quantity: 35, barcode: "APLMAG01" },
  { id: 9, shop: 1, category: 5, category_name: "Wearables", name: "Apple Watch Series 9", description: "Latest Apple smartwatch", price: 399.99, stock_quantity: 20, barcode: "APLWS9" },
  { id: 10, shop: 1, category: 5, category_name: "Wearables", name: "Fitbit Charge 6", description: "Fitness tracker", price: 159.99, stock_quantity: 5, barcode: "FITC6" },
  { id: 11, shop: 1, category: 3, category_name: "Audio", name: "JBL Flip 6", description: "Portable Bluetooth speaker", price: 129.99, stock_quantity: 3, barcode: "JBLFLIP6" },
  { id: 12, shop: 1, category: 1, category_name: "Smartphones", name: "Google Pixel 8", description: "Google flagship phone", price: 699.99, stock_quantity: 7, barcode: "GGLPX8" },
];

export const mockSales: Sale[] = [
  { id: 1, shop: 1, total_amount: 1299.98, tax_amount: 117.00, discount_amount: 0, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, shop: 1, total_amount: 249.99, tax_amount: 22.50, discount_amount: 0, timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, shop: 1, total_amount: 1549.98, tax_amount: 139.50, discount_amount: 50.00, timestamp: new Date(Date.now() - 10800000).toISOString() },
  { id: 4, shop: 1, total_amount: 89.98, tax_amount: 8.10, discount_amount: 0, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, shop: 1, total_amount: 699.99, tax_amount: 63.00, discount_amount: 25.00, timestamp: new Date(Date.now() - 172800000).toISOString() },
];
