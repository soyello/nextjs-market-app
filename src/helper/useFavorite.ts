import axios from 'axios';
import { AdapterUser } from 'next-auth/adapters';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface UserFavorite {
  productId: string;
  currentUser?: AdapterUser | null;
  setCurrentUser: (user: AdapterUser) => void;
}

const useFavorite = ({ productId, currentUser, setCurrentUser }: UserFavorite) => {
  const router = useRouter();
  const [hasFavorite, setHasFavorite] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const isFavorite = currentUser.favoriteIds?.includes(productId) || false;
      setHasFavorite(isFavorite);
    }
  }, [currentUser, productId]);

  const toggleFavorite = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.warn('먼저 로그인해주세요.');
      router.push('/auth/login');
      return;
    }

    console.log('Toggling favorite status:', { productId, hasFavorite });

    try {
      if (hasFavorite) {
        await axios.delete(`/api/favorites/${productId}`);
      } else {
        await axios.post(`/api/favorites/${productId}`);
      }
      const response = await axios.get('/api/currentUser');
      const updatedUser = response.data;

      setHasFavorite(updatedUser.favoriteIds.includes(productId));
      setCurrentUser(updatedUser);
      toast.success('성공했습니다.');
    } catch (err) {
      toast.error('실패했습니다.');
    }
  };
  return {
    hasFavorite,
    toggleFavorite,
  };
};

export default useFavorite;
