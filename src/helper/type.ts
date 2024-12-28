export interface CreateProductInput {
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  latitude: number;
  longitude: number;
  price: number;
  userId: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  latitude: number;
  longitude: number;
  price: number;
  userId: string;
  createdAt: Date;
}

type Serialized<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type SerializedProduct = Serialized<Product>;
