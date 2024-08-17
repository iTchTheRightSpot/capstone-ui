export const STORE_FRONT_HOME = '';
export const EMPLOYEE_FRONT_HOME = 'employee';
export const UNAUTHORIZED = 'unauthorized';

export interface Page<T> {
  page: number;
  size: number;
  total_pages: number;
  total_elements: number;
  number_of_elements: number;
  has_previous_page: boolean;
  has_next_page: boolean;
  data: T[];
  is_empty: boolean;
}

export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  OWNER = 'OWNER',
  DEVELOPER = 'DEVELOPER',
  USER = 'USER',
}

export enum ApiStatus {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}
