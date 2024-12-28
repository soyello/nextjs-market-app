import { NextResponse } from 'next/server';
import MySQLAdapter from './mysqlAdapter';

export interface ProductsParams {
  latitude?: number;
  longitude?: number;
  category?: string;
}

export default async function getProducts(params: ProductsParams) {
  try {
    const { latitude, longitude, category } = params;
    let query: any = {};
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
      return await MySQLAdapter.getProducts(query);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  } catch (error: any) {
    throw new Error(error);
  }
}
