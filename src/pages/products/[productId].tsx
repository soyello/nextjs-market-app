import Button from '@/components/Button';
import { categories } from '@/components/categories/Categories';
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
  product: {
    id: string;
    title: string;
    description: string;
    imageSrc: string;
    category: string;
    latitude: number;
    longitude: number;
    price: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string;
      image: string;
    };
  };
  currentUser: AdapterUser | null;
}

const ProductPage = ({ product, currentUser }: ProductClientProps) => {
  const router = useRouter();
  const KakaoMap = dynamic(() => import('../../components/KakaoMap'), {
    ssr: false,
  });

  const category = categories.find((item) => item.path === product.category);
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className='max-w-screen-lg mx-auto'>
      <div className='flex flex-col gap-6 mt-10'>
        <ProductHead title={product.title} imageSrc={product.imageSrc} id={product.id} currentUser={currentUser} />
        <div className='grid grid-cols-1 mt-6 md:grid-cols-2 md:gap-10'>
          <ProductInfo
            user={product.user}
            category={category}
            createdAt={product.createdAt}
            description={product.description}
          />
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
