import { serializedProduct, serializedProductWithUser } from '@/helper/serializedProduct';
import getCurrentUser from '@/lib/getCurrentUser';
import getProductById from '@/lib/getProductById';

interface Params {
  productId?: string;
}

const ProductPage = ({ product, currentUser }: { product: any; currentUser: any }) => {
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>Posted by: {currentUser?.name || 'Guest'}</p>
    </div>
  );
};

export default ProductPage;

export async function getServerSideProps(context: { params: Params; req: any; res: any }) {
  const { params, req, res } = context;

  const productId = params.productId;
  if (!productId) {
    return {
      notFound: true,
    };
  }
  const product = await getProductById({ productId });
  const serializedProduct = serializedProductWithUser(product);
  const currentUser = await getCurrentUser(res, req);

  return {
    props: {
      product: serializedProduct,
      currentUser,
    },
  };
}
