import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  RefreshCcw, History, Mail, Phone, Calendar, 
  UserCheck, Search, Filter, X, 
  Edit
} from 'lucide-react';
import Pagination from '../Layout/Pagination';
import LoadingScreen from '../Layout/LoadingScreen';


const DomainPage = ({ domain, user }) => {
    const location = useLocation();
    const hasFocusedLeadRef = useRef(false);
    const focusLeadId = location.state?.focusLeadId;
    const [data, setData] = useState({ 
        leads: [], 
        totalPages: 1, 
        page: 1,
        total: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRemarks, setEditingRemarks] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [remarksHistory, setRemarksHistory] = useState([]);
    const [historyCandidate, setHistoryCandidate] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [pageSizeValue, setPageSizeValue] = useState(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const canEditPayments = ['TL', 'MD', 'GM', 'Main Admin'].includes(user.role);

    const fetchDomainData = useCallback(async (page = 1, limit = pageSize) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `http://localhost:5005/api/leads?domain=${encodeURIComponent(domain)}&page=${page}&limit=${limit}`;
            
            if (user.role === 'Staff') {
                url += `&assignedTo=${user.id}`; 
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            
            if (res.ok) {
                const leads = user.role === 'Staff' 
                    ? (result.leads || []).filter(l => l.assigned_to === user.id)
                    : (result.leads || []);

                setData({
                    leads: leads,
                    totalPages: result.totalPages || 1,
                    page: result.page || page,
                    total: user.role === 'Staff' ? leads.length : (result.total || 0)
                });
            }
        } catch (err) {
            console.error("Fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [domain, pageSize, user.role, user.id]);

    const deleteLead = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
        try {
            const res = await fetch(`http://localhost:5005/api/leads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                fetchDomainData(data.page);
            } else {
                const error = await res.json();
                alert(error.message || "Delete failed");
            }
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const handleEditLead = (lead) => {
        setSelectedLead({ ...lead });
        setIsEditModalOpen(true);
    };

    const saveLeadEdit = async () => {
        try {
            const res = await fetch(`http://localhost:5005/api/leads/${selectedLead.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify(selectedLead)
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                fetchDomainData(data.page);
            } else {
                alert("Failed to update lead details");
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    const fetchStaff = useCallback(async () => {
        if (!['TL', 'MD', 'GM', 'Main Admin'].includes(user.role)) return;
        try {
            const res = await fetch('http://localhost:5005/api/staff-list', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setStaffList(await res.json());
        } catch (err) { console.error(err); }
    }, [user.role]);

    useEffect(() => {
        fetchDomainData();
        fetchStaff();
    }, [fetchDomainData, fetchStaff]);

    useEffect(() => {
        if (!focusLeadId || hasFocusedLeadRef.current || data.leads.length === 0) return;
        const match = data.leads.find((lead) => lead.id === focusLeadId);
        if (match) {
            hasFocusedLeadRef.current = true;
            const el = document.getElementById(`lead-row-${focusLeadId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [focusLeadId, data.leads]);

    const updateStatus = async (leadId, newStatus) => {
        try {
            const res = await fetch(`http://localhost:5005/api/leads/${leadId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ leadId, status: newStatus })
            });
            if (res.ok) fetchDomainData(data.page);
        } catch (err) { console.error(err); }
    };

    const updateRemarks = async (id, remarks) => {
        try {
            const response = await fetch('http://localhost:5005/api/leads/remarks', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ leadId: id, remarks })
            });
            if (response.ok) {
                setData(prev => ({
                    ...prev,
                    leads: prev.leads.map(l => l.id === id ? { ...l, remarks } : l)
                }));
                setEditingRemarks(null);
            }
        } catch (err) { alert("Save failed"); }
    };

    const assignLead = async (leadId, staffId, staffName) => {
        await fetch('http://localhost:5005/api/leads/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ leadId, staffId, staffName })
        });
        fetchDomainData(data.page);
    };

    const fetchLeadHistory = async (leadId, candidateName) => {
        try {
            const res = await fetch(`http://localhost:5005/api/history/leads/${leadId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) {
                setRemarksHistory([]);
                alert(`History API error (${res.status}). Restart backend and try again.`);
                return;
            }
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                setRemarksHistory([]);
                alert('History API did not return JSON. Check backend route.');
                return;
            }
            setRemarksHistory(await res.json());
            setHistoryCandidate(candidateName);
            setShowHistoryModal(true);
        } catch (err) { console.error(err); }
    };

    const updatePayment = async (leadId, updates) => {
        try {
            const res = await fetch(`http://localhost:5005/api/leads/${leadId}/payment`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                fetchDomainData(data.page);
            } else {
                const result = await res.json().catch(() => ({}));
                alert(result.msg || result.error || 'Payment update failed');
            }
        } catch (err) {
            console.error(err);
            alert('Payment update failed');
        }
    };

    const filteredLeads = data.leads.filter(lead => {
        const matchesSearch = 
            lead.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const enableTableScroll =
        (pageSizeValue === 'all' && filteredLeads.length > 10) ||
        (pageSizeValue !== 'all' && Number(pageSizeValue) > 10);

    const handlePageSizeChange = (value) => {
        if (value === 'all') {
            const allLimit = Math.max(data.total || 0, 1);
            setPageSizeValue('all');
            setPageSize(allLimit);
            fetchDomainData(1, allLimit);
            return;
        }
        const numeric = Number(value);
        setPageSizeValue(numeric);
        setPageSize(numeric);
        fetchDomainData(1, numeric);
    };

    if (loading && data.leads.length === 0) {
        return <LoadingScreen message={`Loading ${domain} leads...`} fullPage={false} />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="font-black text-slate-800 uppercase tracking-tighter text-2xl leading-none">{domain}</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Lead Management Console</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search current page..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <Filter size={14} className="text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="New">New</option>
                            <option value="Follow Up">Follow Up</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => fetchDomainData(data.page)} 
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Show</span>
                    <select 
                        value={pageSizeValue}
                        onChange={(e) => handlePageSizeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:ring-2 ring-blue-500/20 cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value="all">Show All</option>
                    </select>
                    <span>Entries per page</span>
                </div>
                <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    TOTAL: {data.total || 0} LEADS
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className={`overflow-x-auto ${enableTableScroll ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                <th className="p-4 border-r border-slate-100">Candidate</th>
                                <th className="p-4 border-r border-slate-100">Email</th>
                                <th className="p-4 border-r border-slate-100">Phone</th>
                                <th className="p-4 border-r border-slate-100">Course</th>
                                <th className="p-4 border-r border-slate-100">Source</th>
                                <th className="p-4 border-r border-slate-100">
                                    {user.role === 'Staff' ? 'Assigned By' : 'Assigned To'}
                                </th>
                                <th className="p-4 border-r border-slate-100">Date</th>
                                <th className="p-4 border-r border-slate-100">Status</th>
                                <th className="p-4 border-r border-slate-100">Payment</th>
                                <th className="p-4 border-r border-slate-100">Total Fees</th>
                                <th className="p-4 border-r border-slate-100">Paid Amount</th>
                                <th className="p-4 border-r border-slate-100">Remarks</th>
                                <th className="p-4 border-r border-slate-100 text-center">History</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeads.map(lead => (
                                <tr
                                    id={`lead-row-${lead.id}`}
                                    key={lead.id}
                                    className={`hover:bg-blue-50/30 transition-colors whitespace-nowrap ${
                                        focusLeadId === lead.id ? 'bg-blue-50/50 ring-1 ring-blue-200' : ''
                                    }`}
                                >
                                    <td className="p-4 font-bold text-slate-800 border-r border-slate-50">{lead.student_name}</td>
                                    <td className="p-4 text-slate-600 border-r border-slate-50 text-xs">{lead.email || 'N/A'}</td>
                                    <td className="p-4 font-medium text-slate-600 border-r border-slate-50 text-xs">{lead.phone}</td>
                                    <td className="p-4 border-r border-slate-50">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black uppercase text-slate-600">
                                            {lead.interested_in || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4 border-r border-slate-50">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase">{lead.source || 'Direct'}</span>
                                    </td>

                                    <td className="p-4 border-r border-slate-50">
                                        {user.role === 'Staff' ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                <span className="text-xs font-bold text-slate-700">{lead.assigned_by_name || "System"}</span>
                                            </div>
                                        ) : (
                                            <select 
                                                className="text-[11px] font-bold bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:ring-2 ring-blue-500/20"
                                                value={lead.assigned_to || ""}
                                                onChange={(e) => {
                                                    const selectedStaff = staffList.find(s => s.id === parseInt(e.target.value));
                                                    assignLead(lead.id, e.target.value, selectedStaff?.name);
                                                }}
                                            >
                                                <option value="">Select Staff</option>
                                                {staffList.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>

                                    <td className="p-4 text-slate-500 text-[11px] font-bold border-r border-slate-50">
                                        {new Date(lead.created_at).toLocaleDateString('en-GB')}
                                    </td>

                                    <td className="p-4 border-r border-slate-50">
                                        <select 
                                            value={lead.status}
                                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                                            className={`text-[10px] font-black uppercase px-2 py-1 rounded border border-transparent outline-none cursor-pointer ${getStatusStyle(lead.status)}`}
                                        >
                                            <option value="New">New</option>
                                            <option value="Follow Up">Follow Up</option>
                                            <option value="Enrolled">Enrolled</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>

                                    <td className="p-4 border-r border-slate-50">
                                        <select
                                            value={lead.payment_status || 'Unpaid'}
                                            disabled={!canEditPayments}
                                            onChange={(e) => updatePayment(lead.id, { payment_status: e.target.value })}
                                            className={`text-[10px] font-black uppercase px-2 py-1 rounded border outline-none ${canEditPayments ? 'cursor-pointer bg-indigo-50 text-indigo-700 border-indigo-100' : 'cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200'}`}
                                        >
                                            <option value="Paid">Paid</option>
                                            <option value="Unpaid">Unpaid</option>
                                            <option value="Partially Paid">Partially Paid</option>
                                        </select>
                                    </td>

                                    <td className="p-4 border-r border-slate-50">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            defaultValue={lead.total_fees ?? 0}
                                            disabled={!canEditPayments}
                                            onBlur={(e) => updatePayment(lead.id, { total_fees: e.target.value })}
                                            className={`w-24 text-xs px-2 py-1 rounded border outline-none ${canEditPayments ? 'bg-white border-slate-200 focus:ring-2 ring-blue-500/20' : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'}`}
                                        />
                                    </td>

                                    <td className="p-4 border-r border-slate-50">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            defaultValue={lead.paid_amount ?? 0}
                                            disabled={!canEditPayments}
                                            onBlur={(e) => updatePayment(lead.id, { paid_amount: e.target.value })}
                                            className={`w-24 text-xs px-2 py-1 rounded border outline-none ${canEditPayments ? 'bg-white border-slate-200 focus:ring-2 ring-blue-500/20' : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'}`}
                                        />
                                    </td>

                                    <td className="p-4 min-w-[200px] max-w-sm">
                                        {editingRemarks?.id === lead.id ? (
                                            <div className="flex flex-col gap-2">
                                                <textarea
                                                    autoFocus
                                                    className="w-full p-2 text-xs border border-blue-300 rounded-lg outline-none ring-4 ring-blue-50"
                                                    value={editingRemarks.remarks || ''}
                                                    onChange={(e) => setEditingRemarks({ ...editingRemarks, remarks: e.target.value })}
                                                />
                                                <div className="flex gap-1">
                                                    <button 
                                                        onClick={() => updateRemarks(lead.id, editingRemarks.remarks)}
                                                        className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded font-black hover:bg-blue-700 transition-all"
                                                    >
                                                        SAVE
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingRemarks(null)}
                                                        className="bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded font-black hover:bg-slate-200 transition-all"
                                                    >
                                                        CANCEL
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={() => setEditingRemarks(lead)}
                                                className="cursor-pointer min-h-[30px] flex flex-col justify-center"
                                            >
                                                <p className="text-xs text-slate-600 truncate max-w-[200px]">
                                                    {lead.remarks || <span className="text-slate-300 font-bold italic">+ Add Remark</span>}
                                                </p>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-4 border-r border-slate-50 text-center">
                                        <button
                                            onClick={() => fetchLeadHistory(lead.id, lead.student_name)}
                                            className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                        >
                                            <History size={10} /> VIEW
                                        </button>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleEditLead(lead)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Edit Lead"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteLead(lead.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete Lead"
                                            >
                                                <X size={16} className="stroke-[3]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    stats={{ 
                        currentPage: data.page, 
                        totalPages: data.totalPages 
                    }} 
                    onPageChange={(newPage) => fetchDomainData(newPage, pageSize)} 
                    pageSize={pageSize}
                    pageSizeValue={pageSizeValue}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[10, 20, 50, 100, 'all']}
                />
            </div>

            {/* MODALS MOVED OUTSIDE THE TABLE LOOP FOR CORRECT RENDERING */}
            {isEditModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">Edit Lead Details</h3>
                            <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase">Student Name</label>
                                <input 
                                    className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 ring-blue-500/20"
                                    value={selectedLead.student_name}
                                    onChange={(e) => setSelectedLead({...selectedLead, student_name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Email</label>
                                    <input 
                                        className="w-full p-2 border rounded-lg text-sm"
                                        value={selectedLead.email}
                                        onChange={(e) => setSelectedLead({...selectedLead, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Phone</label>
                                    <input 
                                        className="w-full p-2 border rounded-lg text-sm"
                                        value={selectedLead.phone}
                                        onChange={(e) => setSelectedLead({...selectedLead, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase">Interested Course</label>
                                <input 
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={selectedLead.interested_in}
                                    onChange={(e) => setSelectedLead({...selectedLead, interested_in: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t flex gap-3">
                            <button 
                                onClick={saveLeadEdit}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                            >
                                SAVE CHANGES
                            </button>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 bg-white border border-slate-200 py-2 rounded-xl font-bold text-slate-600"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showHistoryModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-black text-slate-800 text-lg">LEAD EDIT HISTORY</h3>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{historyCandidate}</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-full transition-colors">
                                <X size={20} className="text-slate-600" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {remarksHistory.length > 0 ? remarksHistory.map((h, i) => (
                                <div key={i} className="border-l-4 border-blue-500 pl-4 py-1 bg-slate-50/50 p-3 rounded-r-xl">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                                        <span className="text-blue-600">{h.action_type || 'UPDATE'} by: {h.changed_by}</span>
                                        <span>{new Date(h.changed_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{h.field_name || 'details'}</p>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        <span className="text-slate-400">From:</span> {h.old_value || '-'}
                                    </p>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        <span className="text-slate-400">To:</span> {h.new_value || '-'}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-center text-slate-400 text-sm italic py-10">No history found for this lead.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'New': return 'bg-blue-100 text-blue-700';
        case 'Follow Up': return 'bg-orange-100 text-orange-700';
        case 'Enrolled': return 'bg-green-100 text-green-700';
        case 'Closed': return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

export default DomainPage;
