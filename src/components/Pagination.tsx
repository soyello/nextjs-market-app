import usePagination from '@lucasmogari/react-pagination';
import React from 'react';
import PaginationLink from './PaginationLink';

interface PaginationProps {
  page: number;
  totalItems: number;
  perPage: number;
}

const Pagination = ({ page, totalItems, perPage }: PaginationProps) => {
  const { fromItem, toItem, getPageItem, totalPages } = usePagination({
    totalItems: totalItems,
    page: page,
    itemsPerPage: perPage,
    maxPageItems: 3,
  });

  const firstPage = 1;
  const nextPage = Math.min(page + 1, totalPages);
  const prevPage = Math.max(page - 1, firstPage);
  const arr = new Array(totalPages + 2);

  return (
    <div className='flex items-center justify-center gap-2 mt-4'>
      {[...arr].map((_, i) => {
        const { page, disabled, current } = getPageItem(i);

        if (page === 'previous') {
          return (
            <PaginationLink disabled={disabled} page={prevPage} key={i}>
              {'<'}
            </PaginationLink>
          );
        }
        if (page === 'next') {
          return (
            <PaginationLink disabled={disabled} page={nextPage} key={i}>
              {'>'}
            </PaginationLink>
          );
        }
        if (page === 'gap') {
          return <span key={i}>...</span>;
        }

        return (
          <PaginationLink active={current} page={page} key={i}>
            {page}
          </PaginationLink>
        );
      })}
    </div>
  );
};

export default Pagination;
