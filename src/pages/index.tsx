import Container from '@/components/Container';
import EmptyState from '@/components/EmptyState';
import FloatingButton from '@/components/FloatingButton';
import ProductCard from '@/components/ProductCard';
import getProducts, { ProductsParams } from '@/lib/getProducts';
import { GetServerSideProps } from 'next';

interface HomeProps {
  products: any[];
  currentUser: any | null;
}

export default function Home({ products, currentUser }: HomeProps) {
  return (
    <Container>
      {products.length === 0 ? (
        <EmptyState />
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
              <ProductCard currentUser={currentUser} key={product.id} data={product} />
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
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: [],
      },
    };
  }
};
