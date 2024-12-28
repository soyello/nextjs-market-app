import { AdapterUser } from 'next-auth/adapters';
import React from 'react';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

interface HeartButtonProps {
  productId: string;
  currentUser?: AdapterUser | null;
}

const HeartButton = ({ productId, currentUser }: HeartButtonProps) => {
  return (
    <div className='relative trnasition cursor-pointer hover:opacity-80'>
      <AiOutlineHeart size={28} className='fill-white absolute -top-[2px] -right-[2px]' />
      <AiFillHeart size={24} className={'fill-rose-500'} />
    </div>
  );
};

export default HeartButton;
