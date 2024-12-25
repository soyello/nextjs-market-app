import Navbar from '@/components/Navbar';
import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <div className={inter.className}>
        <Navbar />
        <Component {...pageProps} />;
      </div>
    </SessionProvider>
  );
}
