import type { LucideIcon } from 'lucide-react';

export type UserRole = 'administrador' | 'gerente' | 'operador' | 'financeiro' | 'visualizador';

export interface Marketplace {
  id: string;
  name: string;
  slug: string;
  color: string;
  status: string;
  external_id: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  cost_price: number;
  sale_price: number;
  image_url: string | null;
  status: string;
  created_at: string;
  category?: Category;
}

export type ProductWithCategory = Product & { category?: Category };

export interface ProductFormData {
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  cost_price: number;
  sale_price: number;
  status: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  min_quantity: number;
  product?: Product;
  warehouse?: Warehouse;
}

export interface InventoryAggregate {
  product: Product;
  total: number;
  locations: { warehouse: string; qty: number; min: number }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  number: string;
  marketplace_id: string | null;
  customer_id: string | null;
  status: string;
  total: number;
  items_count: number;
  created_at: string;
  marketplace?: Marketplace;
  customer?: Customer;
  order_items?: OrderItem[];
}

export type OrderWithRelations = Order & {
  marketplace?: Marketplace;
  customer?: Customer;
};

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  number: string;
  supplier_id: string | null;
  status: string;
  total: number;
  items_count: number;
  expected_date: string | null;
  created_at: string;
  supplier?: Supplier;
  purchase_items?: PurchaseItem[];
}

export type PurchaseWithSupplier = Purchase & { supplier?: Supplier };

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  order_id: string | null;
  marketplace_id: string | null;
  marketplace?: Marketplace;
  created_at: string;
}

export type TransactionWithMarketplace = Transaction & { marketplace?: Marketplace };

export interface StockCheck {
  id: string;
  number: string;
  warehouse_id: string;
  status: string;
  auditor: string;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  warehouse?: Warehouse;
  stock_check_items?: StockCheckItem[];
}

export type StockCheckWithWarehouse = StockCheck & { warehouse?: Warehouse };

export interface StockCheckItem {
  id: string;
  stock_check_id: string;
  product_id: string;
  product_name: string;
  expected_quantity: number;
  counted_quantity: number | null;
  difference: number;
}

export interface StockCheckFormData {
  warehouse_id: string;
  auditor: string;
  notes: string | null;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar_url: string | null;
  last_access: string | null;
  created_at: string;
}

export interface SystemUserFormData {
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  label: string | null;
  category: string;
  updated_at: string;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  page: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface DashboardData {
  faturamentoHoje: number;
  faturamentoOntem: number;
  faturamentoMensal: number;
  lucroMensal: number;
  totalPedidos: number;
  ticketMedio: number;
  pedidosHoje: number;
  topProdutos: { name: string; quantity: number; total: number }[];
  estoqueBaixo: Inventory[];
  revenueChart: { date: string; label: string; receita: number; despesa: number }[];
  marketplaceData: { name: string; value: number; color: string }[];
  marketplaceBarData: { label: string; value: number }[];
  recentOrders: OrderWithRelations[];
}

export interface FinanceSummary {
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface FinanceChartData {
  date: string;
  label: string;
  receita: number;
  despesa: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface RelatoriosData {
  totalRevenue: number;
  totalCost: number;
  avgMargin: number;
  totalStockValue: number;
  revenueByDay: { label: string; value: number }[];
  mpBarData: { label: string; value: number }[];
  donutData: { name: string; value: number; color: string }[];
  productMargins: { name: string; margin: number }[];
}
