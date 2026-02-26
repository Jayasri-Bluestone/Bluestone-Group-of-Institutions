const LeadList = ({ title, data, icon, color, badgeColor, currentPage, setCurrentPage, pageSize, setPageSize, userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Filter the data based on search term
    const safeData = Array.isArray(data) ? data : [];
    const filteredData = safeData.filter(lead => 
        lead.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Paginate the FILTERED data
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset page to 1 if user starts searching
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
            {/* Header Section */}
            <div className={`${color} p-4 border-b space-y-3`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        {icon} {title}
                    </h3>
                    <span className={`${badgeColor} text-white text-[10px] px-2 py-0.5 rounded-full font-bold`}>
                        {filteredData.length}
                    </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input 
                        type="text"
                        placeholder={`Search ${title.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-9 pr-4 py-1.5 bg-white/60 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm placeholder:text-slate-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                </div>
            </div>
            
            {/* List Body */}
            <div className="p-4 space-y-3 flex-grow min-h-[300px]">
                {paginatedData.length > 0 ? paginatedData.map(lead => (
                    <div key={lead.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all group">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{lead.student_name}</p>
                            
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{lead.domain}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-black px-2 py-1 rounded uppercase bg-slate-100 text-slate-600 group-hover:bg-white transition-colors">{lead.status}</span>
                            <p className="text-[8px] text-slate-400 mt-1 font-bold uppercase">
                                {userRole === 'Staff' ? `By: ${lead.assigned_by_name || 'System'}` : `To: ${lead.assigned_to_name || 'None'}`}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                        <AlertCircle size={24} strokeWidth={1.5} />
                        <p className="text-sm italic">No matching leads found</p>
                    </div>
                )}
            </div>

            {/* Footer Pagination */}
            <div className="p-3 bg-slate-50 border-t flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Show</span>
                    <select 
                        value={pageSize} 
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-white border border-slate-200 text-[10px] font-bold py-1 px-1 rounded outline-none cursor-pointer"
                    >
                        {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <div className="flex gap-1">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft size={14} strokeWidth={3}/></button>
                        <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronRight size={14} strokeWidth={3}/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};