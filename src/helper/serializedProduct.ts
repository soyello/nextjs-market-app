import { Product, SerializedProduct } from './type';

export function serializedProduct(product: Product): SerializedProduct {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
  };
}

export function serializedProducts(products: Product[]): SerializedProduct[] {
  return products.map(serializedProduct);
}
