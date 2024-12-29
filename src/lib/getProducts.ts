import MySQLAdapter from './mysqlAdapter';

export interface ProductsParams {
  latitude?: number;
  longitude?: number;
  category?: string;
  page?: number | string;
  itemsPerPage?: number | string;
}

export default async function getProducts(params: ProductsParams) {
  try {
    const { latitude, longitude, category, page = 1, itemsPerPage } = params;

    const numericPage = Number(page);
    const numericItemsPerPage = Number(itemsPerPage) || 6;

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
      const result = await MySQLAdapter.getProducts(query, numericPage, numericItemsPerPage);
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
