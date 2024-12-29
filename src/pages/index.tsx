import Container from '@/components/Container';
import EmptyState from '@/components/EmptyState';
import FloatingButton from '@/components/FloatingButton';
import Pagination from '@/components/Pagination';
import ProductCard from '@/components/ProductCard';
import Categories from '@/components/categories/Categories';
import { PRODUCTS_PER_PAGE } from '@/constants';
import { Product } from '@/helper/type';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';

interface HomeProps {
  products: { data: Product[]; totalItems: number };
  currentUser: any | null;
  page: number;
}

export default function Home({ products, currentUser: initialUser, page }: HomeProps) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  return (
    <Container>
      <Categories />
      {products.data.length === 0 ? (
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
            {products.data.map((product) => (
              <ProductCard currentUser={currentUser} key={product.id} data={product} setCurrentUser={setCurrentUser} />
            ))}
          </div>
        </>
      )}
      <Pagination page={page} totalItems={products.totalItems} perPage={PRODUCTS_PER_PAGE} />
      <FloatingButton href='/products/upload'>+</FloatingButton>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { req, res, query } = context;

    const page = query.page ? Number(query.page) : 1;

    const userResponse = await fetch('http://localhost:3000/api/currentUser', {
      headers: { cookie: req.headers.cookie || '' }, // 세션 유지를 위해 쿠키 전달
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch currentUser');
    }

    const currentUser = await userResponse.json();

    const productResponse = await fetch(
      `http://localhost:3000/api/products?${new URLSearchParams(query as Record<string, string>).toString()}`
    );

    if (!productResponse.ok) {
      throw new Error('Failed to fetch products: ${response.statusText}');
    }
    const products = await productResponse.json();

    return {
      props: {
        products,
        currentUser,
        page,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: [],
        currentUser: null,
        page: 1,
      },
    };
  }
};
