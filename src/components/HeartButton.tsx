import useFavorite from '@/helper/useFavorite';
import { AdapterUser } from 'next-auth/adapters';
import React from 'react';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

interface HeartButtonProps {
  productId: string;
  currentUser?: AdapterUser | null;
  setCurrentUser: (user: AdapterUser) => void;
}

const HeartButton = ({ productId, currentUser, setCurrentUser }: HeartButtonProps) => {
  const { hasFavorite, toggleFavorite } = useFavorite({
    productId,
    currentUser,
    setCurrentUser,
  });
  return (
    <div onClick={toggleFavorite} className='relative trnasition cursor-pointer hover:opacity-80'>
      <AiOutlineHeart size={28} className='fill-white absolute -top-[2px] -right-[2px]' />
      <AiFillHeart size={24} className={hasFavorite ? 'fill-rose-500' : 'fill-neutral-500'} />
    </div>
  );
};

export default HeartButton;
