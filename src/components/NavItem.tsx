import Link from 'next/link';
import React from 'react';

const NavItem = ({ mobile }: { mobile?: boolean }) => {
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
        <button>SignOut</button>
      </li>
      <li className='py-2 text-center border-b-2 border-basic cursor-pointer'>
        <button>SignIn</button>
      </li>
    </ul>
  );
};

export default NavItem;
