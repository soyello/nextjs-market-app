import Container from '@/components/Container';
import EmptyState from '@/components/EmptyState';
import FloatingButton from '@/components/FloatingButton';
import ProductCard from '@/components/ProductCard';
import Categories from '@/components/categories/Categories';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';

interface HomeProps {
  products: any[];
  currentUser: any | null;
}

export default function Home({ products, currentUser: initialUser }: HomeProps) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  return (
    <Container>
      <Categories />
      {products.length === 0 ? (
        <EmptyState showReset />
      ) : (
        <>
          <div
            className='
            grid
            grid-cols-1
            gap-8
            pt-12
            sm:grid-cols-1
            md:grid-cols-3
            lg:grid-cols-4
            2xl:grid-cols-6
            '
          >
            {products.map((product) => (
              <ProductCard currentUser={currentUser} key={product.id} data={product} setCurrentUser={setCurrentUser} />
            ))}
          </div>
        </>
      )}
      <FloatingButton href='/products/upload'>+</FloatingButton>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);

    const userResponse = await fetch('http://localhost:3000/api/currentUser', {
      headers: { cookie: context.req.headers.cookie || '' }, // 세션 유지를 위해 쿠키 전달
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch currentUser');
    }

    const currentUser = await userResponse.json();

    const { query } = context;

    const response = await fetch(
      `http://localhost:3000/api/products?${new URLSearchParams(query as Record<string, string>).toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products: ${response.statusText}');
    }
    const products = await response.json();

    return {
      props: {
        products,
        currentUser,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: [],
        currentUser: null,
      },
    };
  }
};
