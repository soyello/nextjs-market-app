import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

const NavItem = ({ mobile }: { mobile?: boolean }) => {
  const { data: session, status } = useSession();
  console.log({ session }, status);

  return (
    <ul
      className={`
        text-md
        justify-center
        flex
        gap-4
        w-full
        items-center
        ${mobile && 'flex-col h-full'}`}
    >
      <li className='py-2 text-center border-b-2 border-basic cursor-pointer'>
        <Link href='/admin'>Admin</Link>
      </li>
      <li className='py-2 text-center border-b-2 border-basic cursor-pointer'>
        <Link href='/user'>User</Link>
      </li>
      <li className='py-2 text-center border-b-2 border-basic cursor-pointer'>
        <Link href='/chat'>Chat</Link>
      </li>

      {session?.user ? (
        <li className='py-2 text-center border-b-2 border-basic cursor-pointer'>
          <button onClick={() => signOut()}>SignOut</button>
        </li>
      ) : (
        <li className='py-2 text-center border-b-2 border-basic cursor-pointer'>
          <button onClick={() => signIn()}>SignIn</button>
        </li>
      )}
    </ul>
  );
};

export default NavItem;
