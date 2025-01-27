import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth/next';
import bcrypt from 'bcryptjs';
import MySQLAdapter from '@/lib/mysqlAdapter';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'ID를 입력하세요.' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn('credentials must be required.');
          return null;
        }

        const user = await MySQLAdapter.getUser(credentials.email);

        if (!user) {
          console.log('회원가입 이력이 없습니다.');
          throw new Error('No user found with this email.');
        }
        const isCorrectPassword = await bcrypt.compare(credentials.password, user?.hashedPassword!);

        if (isCorrectPassword) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
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
