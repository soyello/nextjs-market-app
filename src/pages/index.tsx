import getProducts, { ProductsParams } from '@/lib/getProducts';
import { GetServerSideProps } from 'next';

interface HomeProps {
  products: any[];
}

export default function Home({ products }: HomeProps) {
  console.log(products);
  return (
    <>
      <h1>누구나 볼 수 있는 페이지입니다.</h1>
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>{product.title}</li>
          ))}
        </ul>
      ) : (
        <p>제품이 없습니다.</p>
      )}
    </>
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
