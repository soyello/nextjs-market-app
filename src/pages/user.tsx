import { serializedUser } from '@/helper/serializedUser';
import getCurrentUser from '@/lib/getCurrentUser';
import { GetServerSideProps } from 'next';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    return {
      props: { currentUser: serializedUser(currentUser) },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
};

const UserPage = ({ currentUser }: { currentUser: any }) => {
  return <div>나는 행복한 고구마!</div>;
};

export default UserPage;
