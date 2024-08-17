export const ADMIN_DASHBOARD_STATISTICS = 'statistics';
export const ADMIN_DASHBOARD_PRODUCT = 'product';
export const ADMIN_DASHBOARD_CATEGORY = 'category';
export const ADMIN_DASHBOARD_CUSTOMER = 'customer';
export const ADMIN_DASHBOARD_SETTING = 'setting';

export interface Display {
  title: string;
  array: {
    icon: string;
    name: string;
    route: string;
  }[];
}

export const DASHBOARDLINKS: Display[] = [
  {
    title: 'quick links',
    array: [
      {
        icon: 'insert_chart_outlined',
        name: 'statistics',
        route: 'statistics',
      },
    ],
  },
  {
    title: 'catalog',
    array: [
      {
        icon: 'shopping_basket-hunt',
        name: 'product',
        route: 'product',
      },
      {
        icon: 'flare',
        name: 'category',
        route: 'category',
      },
    ],
  },
  {
    title: 'customer',
    array: [
      {
        icon: 'account_box',
        name: 'customer',
        route: 'customer',
      },
    ],
  },
  {
    title: 'setting',
    array: [
      {
        icon: 'local_shipping',
        name: 'shipping',
        route: 'setting/shipping',
      },
      {
        icon: 'attach_money',
        name: 'tax',
        route: 'setting/tax',
      },
    ],
  },
];
