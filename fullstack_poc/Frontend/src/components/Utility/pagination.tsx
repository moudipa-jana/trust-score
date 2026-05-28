import { GoChevronLeft, GoChevronRight } from 'react-icons/go';

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: any) {
  if (totalPages === 1) return null;
  const maxVisiblePages = 6;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {pages.length > 0 && (
        <div className="mt-5 mb-14 overflow-auto pb-6">
          <div className="mx-auto flex w-fit items-center">
            <div
              className={`mx-4 flex h-7 w-7 items-center justify-center rounded-full  border ${
                currentPage === 1
                  ? 'cursor-not-allowed border-gray-800 text-gray-800'
                  : 'cursor-pointer border-primary  text-primary hover:shadow-xl'
              }`}
              onClick={currentPage === 1 ? undefined : handlePrevClick}
            >
              <GoChevronLeft />
            </div>
            <ul className="flex items-center gap-2">
              {pages.map((page) => (
                <li key={page}>
                  <a
                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full p-2 text-base font-bold transition-all duration-200 
                  ${
                    page === currentPage
                      ? 'text-gray-650 bg-gray-250'
                      : 'hover:text-gray-650 text-primary hover:bg-gray-250'
                  }`}
                    onClick={() => {
                      onPageChange(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {page}
                  </a>
                </li>
              ))}
            </ul>
            <div
              className={`mx-4 flex h-7 w-7 items-center justify-center rounded-full  border ${
                currentPage === totalPages
                  ? 'cursor-not-allowed border-gray-800 text-gray-800'
                  : 'cursor-pointer border-primary  text-primary hover:shadow-xl'
              }`}
              onClick={currentPage === totalPages ? undefined : handleNextClick}
            >
              <GoChevronRight />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
