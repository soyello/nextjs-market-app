import { serializedProduct, serializedProducts } from '@/helper/serializedProduct';
import getCurrentUser from '@/lib/getCurrentUser';
import getProducts from '@/lib/getProducts';
import MySQLAdapter from '@/lib/mysqlAdapter';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const currentUser = await getCurrentUser(req, res);

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, imageSrc, category, latitude, longitude, price } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      latitude === undefined ||
      longitude === undefined ||
      price === undefined
    ) {
      return res.status(400).json({ error: 'All fields ar required' });
    }
    try {
      const product = await MySQLAdapter.createProduct({
        title,
        description,
        imageSrc,
        category,
        latitude,
        longitude,
        userId: currentUser.id,
        price: Number(price),
      });

      const serialized = serializedProduct(product);
      return res.status(201).json(serialized);
    } catch (error) {
      console.log('Error creatign product:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    const params = req.query;
    console.log('Received query params:', params);
    try {
      const products = await getProducts(params);
      const serialized = serializedProducts(products.data);
      return res.status(200).json({ data: serialized, totalItems: products.totalItems });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
