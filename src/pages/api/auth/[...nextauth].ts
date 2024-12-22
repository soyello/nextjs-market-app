import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '../../../lib/db';
import { RowDataPacket } from 'mysql2';
import NextAuth from 'next-auth/next';

declare module 'next-auth' {
  interface Session {
    user: User;
  }
  interface User {
    id: string;
  }
  interface JWT {
    id: string;
  }
}

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  hashedPassword?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'ID를 입력하세요' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const hardcodedUser = {
          id: '정재연 천재',
          name: '부자 정재연',
          email: 'hello@love.com',
          hashedPassword: '12345',
        };
        if (!credentials) return null;

        if (credentials.email === hardcodedUser.email && credentials.password === hardcodedUser.hashedPassword) {
          return hardcodedUser as User;
        }

        const [rows] = await pool.query<UserRow[]>('SELECT id, name, email FROM users WHERE email=?', [
          credentials.email,
        ]);

        const user = rows[0];

        if (user && user.hashedPassword) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          } as User;
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...(session.user || {}),
          id: token.id as string,
        };
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
