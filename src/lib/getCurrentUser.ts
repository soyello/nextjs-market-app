import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import MySQLAdapter from './mysqlAdapter';

export default async function getCurrentUser(req: any, res: any) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return null;
    }
    const currentUser = await MySQLAdapter.getUserByEmail(session.user.email);

    if (!currentUser) {
      return null;
    }
    return currentUser;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}
