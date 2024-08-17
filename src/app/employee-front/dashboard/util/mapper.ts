import { Page } from '@/app/global-utils';
import { ProductResponse } from '@/app/employee-front/admin-front.util';

export interface ProductMapper {
  index: number;
  category: string;
  productId: string;
  name: string;
  desc: string;
  price: number;
  currency: string;
  image: string;
  weight: number;
  type: string;
  delete: string;
}

export const mapper = (page: Page<ProductResponse>): Page<ProductMapper> => ({
  content: page.content.map((obj, index) => ({
    index: index + 1,
    category: obj.category,
    productId: obj.product_id,
    name: obj.name,
    desc: obj.desc,
    price: obj.price,
    currency: obj.currency,
    image: obj.image,
    weight: obj.weight,
    type: obj.weight_type,
    delete: '',
  })),
  pageable: page.pageable,
  last: page.last,
  totalPages: page.totalPages,
  totalElements: page.totalElements,
  size: page.size,
  number: page.number,
  sort: page.sort,
  numberOfElements: page.numberOfElements,
  first: page.first,
  empty: page.empty,
});
