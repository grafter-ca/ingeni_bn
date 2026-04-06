// Product types
export type ApiProduct = {
  id: number | string; // Adjusted to string for merged products
  origin?: "local" | "fake"; // Optional field to track source
  title: string;
  price: number;
  description: string;
  images: string[];
  category: ApiCategory;
};

export type ApiCategory = {
  id: number | string; // Adjusted to string for merged categories
  name: string;
  image: string;
};

// Auth types
export type ApiUser = {
  id: number;
  name: string;
  email: string;
  image: string;
  country?: string;
  phone?: string;
  role?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  image?: string;
};

export interface RegisterPayloadProps extends RegisterPayload {
 country: string;
 phone: string;
 role?: "USER" | "VENDOR" | "ADMIN"; 
 storeName?: string; 
}

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type ProductFilters = {
  title?: string;
  categoryName?: string | undefined;
  price_min?: number;
  price_max?: number;
  offset?: number;
  limit?: number;
};

export type ProductState = {
  // --- STATE ---
  products: ApiProduct[];
  filteredProducts: ApiProduct[];
  categories: ApiCategory[];
  currentProduct: ApiProduct | null;
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  isFetchingMore: boolean; // For infinite scroll or "Load More" button
  fetchMoreProducts: (filters?: ProductFilters) => Promise<void>;


  // --- ACTIONS: FETCHING ---
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProductById: (id: number | string) => Promise<void>;
  fetchCategories: () => Promise<void>;

  // --- ACTIONS: LOOKUPS (For Cart, Details, and Breadcrumbs) ---
  /** Gets a category object from the store without a network call */
  getCategoryById: (id: number | string) => ApiCategory | undefined;
  /** Gets a product from the current list without a network call */
  getLocalProductById: (id: number | string) => ApiProduct | undefined;

  // --- ACTIONS: UI LOGIC ---
  setSearchQuery: (query: string) => void;
  setCategory: (categoryName: string | null, shouldFetch?: boolean) => Promise<void>;
  clearFilters: () => void;
};


export type OrderStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'RETURNED';

export type PaymentStatus = 
  | 'INITIALIZED' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'REFUNDED';

export type PaymentMethod = 
  | 'MOBILE_MONEY' 
  | 'CREDIT_CARD' 
  | 'CASH_ON_DELIVERY' 
  | 'WORKFORCE_WALLET';

// Individual Item in an Order
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: ApiProduct; // Full product details for the UI
  quantity: number;
  priceAtPurchase: number;
}

// The Main Order Object
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  taxAmount: number;
  shippingFees: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  phoneNumber: string;
  createdAt: string; // ISO Date string
  updatedAt: string;
}

// Data Transfer Object for creating an order
export interface CreateOrderDto {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
}