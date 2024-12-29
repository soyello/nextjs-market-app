import Container from '@/components/Container';
import EmptyState from '@/components/EmptyState';
import FloatingButton from '@/components/FloatingButton';
import Pagination from '@/components/Pagination';
import ProductCard from '@/components/ProductCard';
import Categories from '@/components/categories/Categories';
import { PRODUCTS_PER_PAGE } from '@/constants';
import { Product } from '@/helper/type';
import { GetServerSideProps } from 'next';
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
    const { query } = context;

    const page = query.page ? Number(query.page) : 1; // 기본 페이지: 1
    const itemsPerPage = 6; // 한 페이지당 아이템 수
    const skip = (page - 1) * itemsPerPage;

    // 현재 사용자 가져오기
    const userResponse = await fetch('http://localhost:3000/api/currentUser', {
      headers: { cookie: context.req.headers.cookie || '' },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch currentUser');
    }

    const currentUser = await userResponse.json();

    // 상품 데이터 가져오기
    const productResponse = await fetch(
      `http://localhost:3000/api/products?page=${page}&skip=${skip}&itemsPerPage=${itemsPerPage}`
    );

    if (!productResponse.ok) {
      throw new Error(`Failed to fetch products: ${productResponse.statusText}`);
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
        products: { data: [], totalItems: 0 },
        currentUser: null,
        page: 1,
      },
    };
  }
};
