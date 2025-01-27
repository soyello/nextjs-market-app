import Navbar from '@/components/Navbar';
import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Lato } from 'next/font/google';
import Script from 'next/script';
import { createContext, useEffect, useState } from 'react';

const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700'] });
export const KakaoContext = createContext<{
  isKakaoLoaded: boolean;
}>({ isKakaoLoaded: false });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setIsKakaoLoaded(true);
    }
  });

  return (
    <SessionProvider session={session}>
      <KakaoContext.Provider value={{ isKakaoLoaded }}>
        <div className={lato.className}>
          <Navbar />
          <Component {...pageProps} />
          <Script
            src='//dapi.kakao.com/v2/maps/sdk.js?appkey=9268d3bcf6b80dc4ae2dd0de7e26caab&libraries=services,clusterer&autoload=false'
            strategy='lazyOnload'
            onLoad={() => setIsKakaoLoaded(true)}
          />
        </div>
      </KakaoContext.Provider>
    </SessionProvider>
  );
}
