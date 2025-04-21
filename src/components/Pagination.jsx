import React from "react";

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    // Show start ellipsis if needed
    if (currentPage > 4) {
      pages.push("start-ellipsis");
    }

    // Pages around current page
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Show end ellipsis if needed
    if (currentPage < totalPages - 3) {
      pages.push("end-ellipsis");
    }

    // Always show last page if not already added
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return [...new Set(pages)]; // remove duplicates
  };

  const pagesToDisplay = getPageNumbers();

  return (
    <nav className="d-flex justify-content-end">
      <ul className="pagination pagination-sm">
        {/* Previous */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
        </li>

        {/* Page Numbers with Ellipses */}
        {pagesToDisplay.map((page, index) => {
          if (page === "start-ellipsis" || page === "end-ellipsis") {
            return (
              <li key={page + index} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }

          return (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* Next */}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
