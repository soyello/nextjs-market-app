import getCurrentUser from '@/lib/getCurrentUser';
import MySQLAdapter from '@/lib/mysqlAdapter';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const currentUser = await getCurrentUser(req, res);

  if (!currentUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { productId } = req.query;

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ error: 'Invalid Id' });
  }

  try {
    if (req.method === 'POST') {
      // POST 메서드: 즐겨찾기 추가
      const favorite_ids = Array.from(new Set([...(currentUser.favoriteIds || []), productId]));
      const updatedUser = await MySQLAdapter.updateUser({
        id: currentUser.id,
        favoriteIds: favorite_ids,
        email: currentUser.email,
      });
      return res.status(200).json(updatedUser);
    } else if (req.method === 'DELETE') {
      // DELETE 메서드: 즐겨찾기 제거
      const favorite_ids = (currentUser.favoriteIds || []).filter((id) => id !== productId);
      const updatedUser = await MySQLAdapter.updateUser({
        id: currentUser.id,
        favoriteIds: favorite_ids,
        email: currentUser.email,
      });
      return res.status(200).json(updatedUser);
    } else {
      // 허용되지 않은 메서드
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
