import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '../../../lib/db';
import { RowDataPacket } from 'mysql2';
import NextAuth from 'next-auth/next';
import MySQLAdapter from '@/lib/mysqlAdapter';
import bcrypt from 'bcryptjs';

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  hashedPassword?: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MySQLAdapter,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'ID를 입력하세요' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await MySQLAdapter.getUserByEmailWithPassword(credentials.email);

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashed_password!);
        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        if (user && isCorrectPassword) {
          return {
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            role: user.user_type,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('token', token);
      console.log('user', user);
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('@', session, token);
      if (token) {
        session.user = {
          ...(session.user || {}),
          id: token.id as string,
          role: token.id as string,
        };
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
