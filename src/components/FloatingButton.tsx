import Link from 'next/link';

interface FloatingButtonProps {
  children: React.ReactNode;
  href: string;
}

const FloatingButton = ({ children, href }: FloatingButtonProps) => {
  return (
    <Link
      href={href}
      className='
        fixed 
        flex 
        bottom-5 
        right-5 
        w-14 
        bg-primary
        text-basic
        items-center
        justify-center
        border-0
        border-transparent
        rounded-full
        shadow-xl
        cursor-pointer
        aspect-square
        hover:bg-secondary
        transition-colors
        '
    >
      {children}
    </Link>
  );
};

export default FloatingButton;
