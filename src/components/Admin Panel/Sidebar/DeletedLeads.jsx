import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Trash2, RefreshCcw, Search, Loader2, Calendar, User,
  History, RotateCcw, ChevronUp, ChevronDown
} from "lucide-react";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";
import Pagination from "../Layout/Pagination";
import { confirmToast } from "../../../utils/toastConfirm";

const DeletedLeads = ({ user }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("deleted_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchDeletedLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/admin/deleted-leads`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        setLeads(await res.json());
      } else {
        toast.error("Failed to fetch deleted enquiries");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedLeads();
  }, [fetchDeletedLeads]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleRestore = async (id, name) => {
    const confirmed = await confirmToast(`Restore enquiry for ${name}?`, "Restore");
    if (!confirmed) return;

    const loadToast = toast.loading("Restoring enquiry...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        toast.success("Enquiry restored successfully", { id: loadToast });
        fetchDeletedLeads();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to restore", { id: loadToast });
      }
    } catch (err) {
      toast.error("Server error", { id: loadToast });
    }
  };

  const filteredLeads = leads.filter(l => 
    l.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.lead_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.deleted_by?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const aVal = a[sortBy] || "";
    const bVal = b[sortBy] || "";
    
    if (sortBy === "deleted_at") {
      const aTime = new Date(aVal).getTime();
      const bTime = new Date(bVal).getTime();
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
    if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ label, sortKey, className = "" }) => {
    const isActive = sortBy === sortKey;
    return (
      <th 
        className={`px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors ${className}`}
        onClick={() => {
          if (isActive) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          } else {
            setSortBy(sortKey);
            setSortOrder("desc");
          }
        }}
      >
        <div className="flex items-center gap-1.5 justify-start">
          {label}
          <div className="flex flex-col -gap-1">
            <ChevronUp size={10} className={isActive && sortOrder === "asc" ? "text-blue-600" : "text-slate-300"} />
            <ChevronDown size={10} className={isActive && sortOrder === "desc" ? "text-blue-600" : "text-slate-300"} />
          </div>
        </div>
      </th>
    );
  };

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const currentItems = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Retrieving deleted archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl shadow-sm">
            <Trash2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Deleted Enquiries</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Archive Management & Restoration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search archives..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchDeletedLeads}
            className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-slate-600"
            title="Refresh List"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl">
            <History size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Total Archived</p>
            <p className="text-2xl font-black text-slate-800">{leads.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 md:col-span-2">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <RotateCcw size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Recovery System</p>
              <p className="text-sm font-bold text-slate-600 leading-tight">These records were soft-deleted. Clicking "Restore" will return them to their original active lists with all history preserved.</p>
            </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className={`overflow-x-auto ${currentItems.length > 10 ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <SortHeader label="Enquiry Details" sortKey="student_name" className="px-4 py-4 text-[10px]" />
                <SortHeader label="Domain & Category" sortKey="domain" className="px-4 py-4 text-[10px]" />
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
                <SortHeader label="Deletion Metadata" sortKey="deleted_at" className="px-4 py-4 text-[10px]" />
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.length > 0 ? currentItems.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <p className="font-black text-slate-800 text-[12px] group-hover:text-blue-600 transition-colors uppercase tracking-tight whitespace-normal break-words leading-tight">
                        {lead.student_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">{lead.lead_code || 'N/A'}</span>
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-blue-100 inline-block whitespace-normal break-words leading-tight">
                        {lead.domain}
                      </span>
                      {lead.category && (
                        <p className="text-[11px] text-slate-500 font-bold ml-1 italic whitespace-normal break-words leading-tight">
                          {lead.category}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[11px] text-slate-600 whitespace-normal break-words leading-tight">
                      {lead.remarks || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center gap-1.5 text-red-600">
                        <Calendar size={12} />
                        <span className="text-[11px] font-black uppercase">{new Date(lead.deleted_at).toLocaleString()}</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-slate-500">
                        <User size={12} />
                        <span className="text-[10px] font-bold tracking-tight uppercase">BY: {lead.deleted_by || 'SYSTEM'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleRestore(lead.id, lead.student_name)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:scale-105 transition-all shadow-md active:scale-95 whitespace-nowrap"
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                        <Trash2 size={40} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No deleted enquiries found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredLeads.length > itemsPerPage && (
          <div className="bg-slate-50/50 border-t border-slate-100">
            <Pagination
              stats={{ currentPage, totalPages }}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <div className="bg-blue-600 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <History size={24} />
          </div>
          <div>
            <p className="font-black text-xl leading-tight">Database integrity is maintained.</p>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mt-1 opacity-80">Soft-delete records are stored for audit and disaster recovery</p>
          </div>
        </div>
        <button 
          onClick={fetchDeletedLeads}
          className="px-8 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-blue-50 transition-all active:scale-95"
        >
          Synchronize Archive
        </button>
      </div>
    </div>
  );
};

export default DeletedLeads;
