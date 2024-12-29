import { AdapterUser } from 'next-auth/adapters';
import React from 'react';
import { IconType } from 'react-icons';
import Avatar from '../Avatar';
import { FormatTime } from '@/helper/dayjs';
import ProductCategory from './ProductCategory';

interface ProductInfoProps {
  user: { id: string; name: string; image: string };
  description: string;
  createdAt: Date;
  category:
    | {
        icon: IconType;
        label: string;
        description: string;
      }
    | undefined;
}

const ProductInfo = ({ user, category, createdAt, description }: ProductInfoProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2 text-xl font-semibold'>
          <Avatar src={user?.image!} />
          <p>{user?.name}</p>
        </div>
        <div>{FormatTime(createdAt)}</div>
      </div>
      <hr />
      {category && <ProductCategory icon={category.icon} label={category.label} description={category.description} />}
      <hr />
      <div>{description}</div>
    </div>
  );
};

export default ProductInfo;
