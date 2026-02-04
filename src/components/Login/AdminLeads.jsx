import { useState, useEffect } from 'react';
import { Mail, Phone, ChevronLeft, ChevronRight, UserMinus, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = () => {
    fetch('http://localhost:5000/api/admin/leads')
      .then(res => res.json())
      .then(data => setLeads(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load leads from server"));
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  // --- Confirmation for APPROVAL ---
  const confirmApprove = (lead) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-900">
          Move <b>{lead.name}</b> to Approved Leads?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleApprove(lead);
            }}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700"
          >
            Yes, Approve
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 4000, icon: <CheckCircle className="text-emerald-500" /> });
  };

  // --- Confirmation for REMOVAL ---
  const confirmRemove = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-900">
          Permanently remove this enquiry?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleRemove(id);
            }}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700"
          >
            Yes, Remove
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 4000, icon: <AlertCircle className="text-red-500" /> });
  };

  const handleApprove = async (lead) => {
    const loadingToast = toast.loading(`Processing ${lead.name}...`);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/leads/approve/${lead.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      if (response.ok) {
        setLeads(prev => prev.filter(l => l.id !== lead.id));
        toast.success("Lead approved successfully!", { id: loadingToast });
      } else { throw new Error(); }
    } catch (err) { toast.error("Failed to approve", { id: loadingToast }); }
  };

  const handleRemove = async (id) => {
    const loadingToast = toast.loading("Removing...");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
        toast.success("Enquiry removed", { id: loadingToast });
      }
    } catch (err) { toast.error("Delete failed", { id: loadingToast }); }
  };

  const currentLeads = leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-black text-slate-900">Pending Enquiry</h1>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-[11px] font-black uppercase text-slate-500">Date & Time</th>
              <th className="p-4 text-[11px] font-black uppercase text-slate-500">Name</th>
              <th className="p-4 text-[11px] font-black uppercase text-slate-500">Contact Info</th>
              <th className="p-4 text-[11px] font-black uppercase text-slate-500">Business Focus</th>
              <th className="p-4 text-[11px] font-black uppercase text-slate-500 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentLeads.length > 0 ? (
              currentLeads.map((lead) => {
                const { date, time } = formatDateTime(lead.created_at);
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="text-[11px] font-bold text-slate-900 uppercase">{date}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {time}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{lead.name}</td>
                    <td className="p-4">
                      <div className="text-xs font-medium text-slate-700">{lead.email}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{lead.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded uppercase">
                        {lead.business_focus}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-3">
                      <button 
                        onClick={() => confirmApprove(lead)}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => confirmRemove(lead.id)}
                        className="p-2 border border-slate-200 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                      >
                        <UserMinus size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-400 italic">No pending leads found.</td>
              </tr>
            )}
          </tbody>
        </table>
        
      </div>
      
    </div>
  );
}