// Product types
export type ApiProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: ApiCategory;
};

export type ApiCategory = {
  id: number;
  name: string;
  image: string;
};

// Auth types
export type ApiUser = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type ProductFilters = {
  title?: string;
  categoryId?: number;
  price_min?: number;
  price_max?: number;
  offset?: number;
  limit?: number;
};