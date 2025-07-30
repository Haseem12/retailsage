export const CORRECT_PIN = "1234";

export const PRODUCTS = [
  { id: 1, name: "Fresh Apples", price: 2.5, icon: "Apple", category: "Groceries" },
  { id: 2, name: "Whole Milk", price: 3.0, icon: "Milk", category: "Groceries" },
  { id: 3, name: "Sourdough Bread", price: 4.25, icon: "Sandwich", category: "Groceries" },
  { id: 4, name: "Chicken Breast", price: 8.99, icon: "Drumstick", category: "Groceries" },
  { id: 5, name: "T-Shirt", price: 15.0, icon: "Shirt", category: "Apparel" },
  { id: 6, name: "Jeans", price: 45.5, icon: "PersonStanding", category: "Apparel" },
  { id: 7, name: "Laptop", price: 1200.0, icon: "Laptop", category: "Electronics" },
  { id: 8, name: "Headphones", price: 150.0, icon: "Headphones", category: "Electronics" },
  { id: 9, name: "Regular Unleaded", price: 3.89, icon: "Fuel", category: "Fuel", per: "gallon" },
  { id: 10, name: "Premium Unleaded", price: 4.59, icon: "Fuel", category: "Fuel", per: "gallon" },
  { id: 11, name: "Coffee", price: 2.75, icon: "Coffee", category: "Cafe" },
  { id: 12, name: "Croissant", price: 3.50, icon: "Croissant", category: "Cafe" },
];

export type Product = (typeof PRODUCTS)[0];

export const FUEL_NOZZLES = [
  { id: 1, name: "Nozzle 1", status: "Available", fuelType: "Regular", sales: 1250.75 },
  { id: 2, name: "Nozzle 2", status: "In Use", fuelType: "Regular", sales: 850.20 },
  { id: 3, name: "Nozzle 3", status: "Available", fuelType: "Premium", sales: 2100.45 },
  { id: 4, name: "Nozzle 4", status: "Out of Service", fuelType: "Premium", sales: 1980.90 },
  { id: 5, name: "Nozzle 5", status: "Available", fuelType: "Diesel", sales: 3400.00 },
  { id: 6, name: "Nozzle 6", status: "Available", fuelType: "Diesel", sales: 3150.60 },
];

export type FuelNozzle = (typeof FUEL_NOZZLES)[0];
