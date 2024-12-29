import { AdapterSession, AdapterUser } from 'next-auth/adapters';
import { ProductRow, ProductWithUserRow, SessionRow, UserRow } from './row';
import { Product } from './type';

export function mapToAdapterUser(row: UserRow): AdapterUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image ?? null,
    emailVerified: null,
    role: row.user_type,
    favoriteIds: row.favorite_ids,
  };
}

export function mapToAdapterSession(row: SessionRow): AdapterSession {
  return {
    sessionToken: row.session_token,
    userId: row.user_id,
    expires: new Date(row.expires),
  };
}

export function mapToProduct(row: ProductRow): Product {
  console.log('Row data:', row);
  return {
    id: row.id.toString(),
    title: row.title,
    description: row.description,
    imageSrc: row.imageSrc,
    category: row.category,
    latitude: row.latitude,
    longitude: row.longitude,
    price: row.price,
    userId: row.userId,
    createdAt: new Date(row.createdAt),
  };
}

export function mapToProducts(rows: ProductRow[]): Product[] {
  return rows.map(mapToProduct);
}

export function mapProductWithUser(row: ProductWithUserRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageSrc: row.imageSrc,
    category: row.category,
    latitude: row.latitude,
    longitude: row.longitude,
    price: row.price,
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    user: {
      id: row.userId,
      name: row.userName ?? null,
      email: row.userEmail,
      image: row.userImage ?? null,
      role: row.userType,
    },
  };
}
