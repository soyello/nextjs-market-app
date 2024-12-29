import { AdapterUser } from 'next-auth/adapters';
import React, { useState } from 'react';
import Heading from '../Heading';
import Image from 'next/image';
import HeartButton from '../HeartButton';

interface ProductHeadProps {
  title: string;
  imageSrc: string;
  id: string;
  currentUser?: AdapterUser | null;
}

const ProductHead = ({ title, imageSrc, id, currentUser: initialUser }: ProductHeadProps) => {
  const [currentUser, setCurrentUser] = useState(initialUser);
  return (
    <>
      <Heading title={title} />
      <div className='w-full h-[60vh] overflow-hidden rounded-xl relative'>
        <Image src={imageSrc} fill className='object-cover w-full' alt='product' />
        <div className='absolute top-5 right-5'>
          <HeartButton productId={id} currentUser={currentUser} setCurrentUser={setCurrentUser} />
        </div>
      </div>
    </>
  );
};

export default ProductHead;
