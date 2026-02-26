import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({
    stats,
    onPageChange,
    pageSize,
    pageSizeValue,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
}) => {
    const { currentPage, totalPages } = stats;

    if (totalPages <= 1) return null;

    // Logic to calculate page numbers to show (e.g., 1 ... 4 5 6 ... 10)
    const getPageNumbers = () => {
        const pages = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            {/* Left Side: Text Info */}
            <div className="hidden md:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Page <span className="text-blue-600">{currentPage}</span> of {totalPages}
                </p>
            </div>

            {/* Center: Controls */}
            <div className="flex items-center gap-1 mx-auto md:mx-0">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronLeft size={16} strokeWidth={3} className="text-slate-600" />
                </button>

                {getPageNumbers().map((p, idx) => (
                    <React.Fragment key={idx}>
                        {p === 'ellipsis' ? (
                            <span className="px-2 text-slate-400">
                                <MoreHorizontal size={14} />
                            </span>
                        ) : (
                            <button
                                onClick={() => onPageChange(p)}
                                className={`min-w-[32px] h-8 text-[11px] font-black rounded-lg transition-all border ${
                                    currentPage === p
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {p}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronRight size={16} strokeWidth={3} className="text-slate-600" />
                </button>
            </div>
            
            {/* Right Side: Page Size */}
            <div className="hidden md:flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show</span>
                <select
                    value={pageSizeValue ?? pageSize}
                    onChange={(e) => {
                        if (!onPageSizeChange) return;
                        const value = e.target.value;
                        onPageSizeChange(value === 'all' ? 'all' : Number(value));
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 ring-blue-500/20 cursor-pointer"
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size === 'all' ? 'Show All' : size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Pagination;
