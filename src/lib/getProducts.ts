import { NextResponse } from 'next/server';
import MySQLAdapter from './mysqlAdapter';

export interface ProductsParams {
  latitude?: number;
  longitude?: number;
  category?: string;
  page?: number;
  skip?: number;
}

export default async function getProducts(params: ProductsParams) {
  try {
    const { latitude, longitude, category, page = 1, skip } = params;
    const itemsPerPage = 6;
    let query: Record<string, any> = {};
    if (category) {
      query.category = category;
    }
    if (latitude) {
      query.latitude = {
        min: Number(latitude) - 0.01,
        max: Number(latitude) + 0.01,
      };
    }
    if (longitude) {
      query.longitude = {
        min: Number(longitude) - 0.01,
        max: Number(longitude) + 0.01,
      };
    }
    try {
      const result = await MySQLAdapter.getProducts(query, page, skip || itemsPerPage);
      if (!result || !result.data || typeof result.totalItems !== 'number') {
        return { data: [], totalItems: 0 };
      }
      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  } catch (error: any) {
    throw new Error(error);
  }
}
