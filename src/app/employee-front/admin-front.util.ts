import { Category, Variant } from '@/app/global-utils';

export const ADMIN_FRONT_AUTHENTICATION = '';
export const ADMIN_FRONT_DASHBOARD = 'dashboard';

export interface UpdateProduct {
  category_id: number;
  product_id: string;
  name: string;
  desc: string;
  currency: string;
  price: number;
  category: string;
  weight: number;
}

export interface ProductResponse {
  category: string;
  product_id: string;
  name: string;
  desc: string;
  price: number;
  currency: string;
  image: string;
  weight: number;
  weight_type: string;
}

export interface ProductDetailResponse {
  colour: string;
  is_visible: boolean;
  urls: string[];
  variants: Variant[];
}

export interface CategoryRequest {
  name: string;
  parent_id: number | undefined;
  visible: boolean;
}

export interface WorkerCategoryResponse {
  table: CategoryResponse[];
  hierarchy: Category[];
}

export interface CategoryResponse {
  category_id: number;
  parent_id: number;
  name: string;
  visible: boolean;
  children: CategoryResponse[];
}

export interface UpdateCategory {
  category_id: number;
  name: string;
  visible: boolean;
  parent_id: number | undefined;
}

export interface TableContent<T> {
  key: string;
  data: T;
}

export interface PageChange {
  page: number;
  size: number;
}

export interface SizeInventory {
  size: string;
  qty: number;
}
