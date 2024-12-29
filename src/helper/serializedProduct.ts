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

export function serializedProductWithUser(product: any): any {
  if (!product) {
    return null;
  }

  return {
    ...product,
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    user: {
      ...product.user,
    },
  };
}
