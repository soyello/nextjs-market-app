import getCurrentUser from '@/lib/getCurrentUser';
import MySQLAdapter from '@/lib/mysqlAdapter';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const currentUser = await getCurrentUser(req, res);

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const usersWithConversations = await MySQLAdapter.getUsersWithConversations();

      //console.log('getUsersWithConversations 결과:', JSON.stringify(usersWithConversations, null, 2));
      if (usersWithConversations.length === 0) {
        return res.status(404).json({ error: 'No conversations found' });
      }

      return res.status(200).json(usersWithConversations);
    } catch (error: any) {
      console.error('Database query failed:', error);
      return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
  } else if (req.method === 'POST') {
    const currentUser = await getCurrentUser(req, res);

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body;

    if (!body.senderId || !body.receiverId || !body.text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const conversationId = await MySQLAdapter.findOrCreateConversation(body.senderId, body.receiverId);

      const messageId = await MySQLAdapter.createMessage({
        text: body.text,
        image: body.image || null,
        senderId: body.senderId,
        receiverId: body.receiverId,
        conversationId,
      });

      return res.status(201).json({ messageId, conversationId });
    } catch (error: any) {
      console.error('Error processing conversation or message:', error);
      return res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
