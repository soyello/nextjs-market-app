import { DefaultSession } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';

declare module 'next-auth' {
  interface Session {
    user?: { id?: string; role?: string } & DefaultSession['user'];
  }

  interface User {
    role: string;
    favoriteIds: string[];
  }
  interface JWT {
    id: string;
    role: string;
  }
}
