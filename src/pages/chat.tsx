import getCurrentUser from '@/lib/getCurrentUser';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { AdapterUser } from 'next-auth/adapters';
import { useEffect, useState } from 'react';

interface ChatClientProps {
  currentUser?: AdapterUser | null;
}

interface ExtendedAdapterUser extends AdapterUser {
  created_at: string;
  updated_at: string;
}

export const getServerSideProps: GetServerSideProps<ChatClientProps> = async (context) => {
  const { req, res } = context;

  const currentUser = await getCurrentUser(req, res);

  if (!currentUser) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      currentUser: { ...currentUser },
    },
  };
};

const ChatPage = ({ currentUser }: ChatClientProps) => {
  const [receiver, setReceiver] = useState<{ receiverId: string; receiverName: string; receiverImage: string }>({
    receiverId: '',
    receiverName: '',
    receiverImage: '',
  });

  const [layout, setLayout] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/chat`)
      .then((res) => {
        console.log('Chat data:', res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch chat data:', err);
      });
  }, []);

  return (
    <main>
      <div className='grid grid-cols-[1fr] md:grid-cols-[300px_1fr]'>
        <section className={`md:${layout ? 'hidden' : 'flex'}`}>Contact Component</section>
        <section className={`md:${layout ? 'hidden' : 'flex'}`}>Chat Component</section>
      </div>
    </main>
  );
};

export default ChatPage;
