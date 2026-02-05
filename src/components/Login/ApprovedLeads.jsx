import { useState, useEffect } from 'react';
import { Mail, Phone, ChevronLeft, ChevronRight, UserMinus, RotateCcw, ShieldCheck, Search, AlertCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export function ApprovedLeads() {
  const [approvedLeads, setApprovedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchApprovedLeads();
  }, []);

  const fetchApprovedLeads = () => {
    setLoading(true);
    fetch('https://bluestoneinternationalpreschool.com/bgoi_api/api/admin/approved-leads')
      .then(res => res.json())
      .then(data => {
        setApprovedLeads(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load approved leads");
        setLoading(false);
      });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  // --- CONFIRMATION: REVOKE (Move to Pending) ---
  const confirmRevoke = (lead) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-900">
          Move <b>{lead.name}</b> back to Pending?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleRevoke(lead);
            }}
            className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
          >
            Yes, Revoke
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000, icon: <RotateCcw className="text-amber-500" /> });
  };

  // --- CONFIRMATION: PERMANENT REMOVE ---
  const confirmRemove = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-900">
          Permanently delete this approved lead?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleRemove(id);
            }}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Yes, Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000, icon: <AlertCircle className="text-red-500" /> });
  };

  const handleRemove = async (id) => {
    const tid = toast.loading("Deleting...");
    try {
      const response = await fetch(`http://localhost:5000/api/admin/approved-leads/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setApprovedLeads(prev => prev.filter(l => l.id !== id));
        toast.success("Lead permanently removed", { id: tid });
      }
    } catch (err) {
      toast.error("Deletion failed", { id: tid });
    }
  };

  const handleRevoke = async (lead) => {
    const tid = toast.loading("Moving back to Pending...");
    try {
      const response = await fetch(`http://localhost:5000/api/admin/approved-leads/revoke/${lead.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      if (response.ok) {
        setApprovedLeads(prev => prev.filter(l => l.id !== lead.id));
        toast.success("Lead moved back to Pending", { id: tid });
      }
    } catch (err) {
      toast.error("Process failed", { id: tid });
    }
  };

  const filteredLeads = approvedLeads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.business_focus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const currentLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Approved Leads</h1>
            <p className="text-slate-500 text-sm">Verified leads ready for business</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Enquiry Date</th>
                <th className="p-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Client Details</th>
                <th className="p-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Contact Info</th>
                <th className="p-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Business Focus</th>
                <th className="p-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentLeads.length > 0 ? currentLeads.map((lead) => {
                const { date, time } = formatDateTime(lead.created_at);
                return (
                  <tr key={lead.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="p-4">
                      <div className="text-[11px] font-bold text-slate-900 uppercase whitespace-nowrap">{date}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock size={10} /> {time}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{lead.name}</div>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <ShieldCheck size={10} /> VERIFIED CLIENT
                      </div>
                    </td>

                    <td className="p-4">
                      <a href={`mailto:${lead.email}`} className="block text-blue-600 text-xs hover:underline font-medium truncate max-w-[150px]">
                        {lead.email}
                      </a>
                      <div className="text-[10px] text-slate-400 font-bold">{lead.phone}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase rounded shadow-sm">
                        {lead.business_focus}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => confirmRevoke(lead)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Move back to Pending"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button 
                          onClick={() => confirmRemove(lead.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Permanently"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                   <td colSpan="5" className="p-10 text-center text-slate-400 italic">No approved leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900 font-bold">{currentLeads.length}</span> of {filteredLeads.length} leads
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}