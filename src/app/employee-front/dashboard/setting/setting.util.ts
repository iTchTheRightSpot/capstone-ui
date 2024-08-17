export const ADMIN_SETTING_SHIPPING = 'shipping';
export const ADMIN_SETTING_TAX = 'tax';

export interface ShippingDto {
  country: string;
  ngn_price: number;
  usd_price: number;
}

export interface ShipSettingMapper extends ShippingDto {
  shipping_id: number;
}

export interface TaxSetting {
  tax_id: number;
  name: string;
  rate: number;
}
