import { Button } from "../ui/button";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
}

const Paginator = ({
  currentPage,
  totalPages,
  setCurrentPage,
  handlePreviousPage,
  handleNextPage,
}: PaginatorProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t">
      <div className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronsLeftIcon />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <Button
                key={i}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="icon"
                onClick={() => setCurrentPage(pageNumber)}
                className="w-9"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  );
};

export default Paginator;
