import getCurrentUser from '@/lib/getCurrentUser';
import MySQLAdapter from '@/lib/mysqlAdapter';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const currentUser = await getCurrentUser(req, res);

  if (!currentUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const usersWithConversations = await MySQLAdapter.getUsersWithConversations();
    console.log(usersWithConversations);
    return res.status(200).json(usersWithConversations);
  } catch (error) {
    console.error('Database query failed:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
