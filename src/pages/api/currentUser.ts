import getCurrentUser from '@/lib/getCurrentUser';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const currentUser = await getCurrentUser(req, res);
    res.status(200).json(currentUser);
  } catch (error) {
    res.status(404).json(error);
  }
}
