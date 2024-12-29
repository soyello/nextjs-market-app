import Button from '@/components/Button';
import ProductHead from '@/components/products/ProductHead';
import ProductInfo from '@/components/products/ProductInfo';
import { serializedProductWithUser } from '@/helper/serializedProduct';
import { Product } from '@/helper/type';
import getCurrentUser from '@/lib/getCurrentUser';
import getProductById from '@/lib/getProductById';
import { AdapterUser } from 'next-auth/adapters';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

interface Params {
  productId?: string;
}

interface ProductClientProps {
  product: Product | null;
  currentUser: AdapterUser | null;
}

const ProductPage = ({ product, currentUser }: ProductClientProps) => {
  const router = useRouter();
  const KakaoMap = dynamic(() => import('../../components/KakaoMap'), {
    ssr: false,
  });
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className='max-w-screen-lg mx-auto'>
      <div className='flex flex-col gap-6'>
        <ProductHead />
        <div className='grid grid-cols-1 mt-6 md:grid-cols-2 md:gap-10'>
          <ProductInfo />
          <div>
            <KakaoMap detailPage latitude={product.latitude} longitude={product.longitude} />
          </div>
        </div>
      </div>
      <div className='mt-10'>
        <Button label='이 유저와 채팅하기' onClick={() => router.push('/chat')} />
      </div>
    </div>
  );
};

export default ProductPage;

export async function getServerSideProps(context: { params: Params; req: any; res: any }) {
  const { params, req, res } = context;

  try {
    const currentUser = await getCurrentUser(req, res);

    if (!currentUser) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }
    const productId = params.productId;

    if (!productId) {
      return {
        notFound: true,
      };
    }

    const product = await getProductById({ productId });
    const serializedProduct = serializedProductWithUser(product);
    return {
      props: {
        product: serializedProduct,
        currentUser,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      notFound: true,
    };
  }
}
