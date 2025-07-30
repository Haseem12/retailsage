

export type Product = {
  id: number;
  name: string;
  price: number;
  icon: string;
  category: string;
  stock: number;
  barcode?: string;
  description?: string;
};


export const PRODUCTS: Product[] = [
  { id: 1, name: "Fresh Apples", price: 2.5, icon: "Apple", category: "Groceries", stock: 100, barcode: "123456789012", description: "Crisp and juicy red apples, perfect for a healthy snack." },
  { id: 2, name: "Whole Milk", price: 3.0, icon: "Milk", category: "Groceries", stock: 50, barcode: "234567890123", description: "Fresh whole milk, rich in calcium and vitamins." },
  { id: 3, name: "Sourdough Bread", price: 4.25, icon: "Sandwich", category: "Groceries", stock: 30, barcode: "345678901234", description: "Artisanal sourdough bread with a chewy crust." },
  { id: 4, name: "Chicken Breast", price: 8.99, icon: "Drumstick", category: "Groceries", stock: 40, barcode: "456789012345", description: "Boneless, skinless chicken breast, ideal for grilling or baking." },
  { id: 5, name: "T-Shirt", price: 15.0, icon: "Shirt", category: "Apparel", stock: 80, barcode: "567890123456", description: "Comfortable 100% cotton t-shirt, available in various colors." },
  { id: 6, name: "Jeans", price: 45.5, icon: "PersonStanding", category: "Apparel", stock: 60, barcode: "678901234567", description: "Classic-fit denim jeans for everyday wear." },
  { id: 7, name: "Laptop", price: 1200.0, icon: "Laptop", category: "Electronics", stock: 15, barcode: "789012345678", description: "High-performance laptop with a 15-inch display and 16GB RAM." },
  { id: 8, name: "Headphones", price: 150.0, icon: "Headphones", category: "Electronics", stock: 25, barcode: "890123456789", description: "Noise-cancelling over-ear headphones with Bluetooth connectivity." },
  { id: 9, name: "Regular Unleaded", price: 3.89, icon: "Fuel", category: "Fuel", stock: 10000, barcode: "901234567890", description: "Standard 87 octane gasoline." },
  { id: 10, name: "Premium Unleaded", price: 4.59, icon: "Fuel", category: "Fuel", stock: 5000, barcode: "012345678901", description: "High-performance 93 octane gasoline." },
  { id: 11, name: "Coffee", price: 2.75, icon: "Coffee", category: "Cafe", stock: 200, barcode: "112345678901", description: "Freshly brewed hot coffee." },
  { id: 12, name: "Croissant", price: 3.50, icon: "Croissant", category: "Cafe", stock: 100, barcode: "223456789012", description: "Buttery and flaky croissant, baked fresh daily." },
];


export const FUEL_NOZZLES = [
  { id: 1, name: "Nozzle 1", status: "Available", fuelType: "Regular", sales: 1250.75 },
  { id: 2, name: "In Use", status: "In Use", fuelType: "Regular", sales: 850.20 },
  { id: 3, name: "Nozzle 3", status: "Available", fuelType: "Premium", sales: 2100.45 },
  { id: 4, name: "Nozzle 4", status: "Out of Service", fuelType: "Premium", sales: 1980.90 },
  { id: 5, name: "Nozzle 5", status: "Available", fuelType: "Diesel", sales: 3400.00 },
  { id: 6, name: "Nozzle 6", status: "Available", fuelType: "Diesel", sales: 3150.60 },
];

export type FuelNozzle = (typeof FUEL_NOZZLES)[0];
