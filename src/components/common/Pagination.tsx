import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  isLoading = false,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Prevent rendering if there's only one page
  if (totalPages <= 1) return null;

  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  const Button = ({ 
    onClick, 
    disabled, 
    children, 
    active = false 
  }: { 
    onClick: () => void; 
    disabled?: boolean; 
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        flex items-center justify-center min-w-11 h-11 rounded-xl font-mono text-[11px] font-black tracking-widest transition-all border
        ${active 
          ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20" 
          : "bg-[#0a0a0a] border-white/5 text-gray-500 hover:border-white/20 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-2 border-t border-white/5">
      {/* Telemetry Info */}
      <div className="flex flex-col items-center sm:items-start gap-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
          Data Stream Range
        </p>
        <p className="text-xs font-mono text-gray-400">
          Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
          <span className="text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
          <span className="text-blue-500">{totalItems}</span> entries
        </p>
      </div>

      {/* Control Cluster */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
          <Button onClick={() => onPageChange(1)} disabled={!canGoBack}>
            <ChevronsLeft size={16} />
          </Button>
          <Button onClick={() => onPageChange(currentPage - 1)} disabled={!canGoBack}>
            <ChevronLeft size={16} />
          </Button>
        </div>

        {/* Dynamic Page Numbers (Simple version) */}
        <div className="hidden md:flex items-center gap-1 bg-white/20 p-1 rounded-2xl border border-white/5">
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            // logic to show dots if totalPages is huge could be added here
            return (
              <Button 
                key={pageNum} 
                active={currentPage === pageNum} 
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum.toString().padStart(2, '0')}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button onClick={() => onPageChange(currentPage + 1)} disabled={!canGoForward}>
            <ChevronRight size={16} />
          </Button>
          <Button onClick={() => onPageChange(totalPages)} disabled={!canGoForward}>
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;