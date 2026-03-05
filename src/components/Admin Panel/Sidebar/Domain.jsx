import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  RefreshCcw, History, Mail, Phone, Calendar, 
  UserCheck, Search, Filter, X, 
  Edit
} from 'lucide-react';
import Pagination from '../Layout/Pagination';
import LoadingScreen from '../Layout/LoadingScreen';
import { confirmToast } from '../../../utils/toastConfirm';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';


const DomainPage = ({ domain, user }) => {
    const getTier = (u) => {
        if (u?.tier) return u.tier;
        if (['Main Admin', 'MD', 'GM'].includes(u?.role)) return 'SUPER_ADMIN';
        if (['TL', 'Coordinator', 'Head'].includes(u?.role)) return 'ADMIN';
        return 'STAFF';
    };
    const isSuperAdmin = getTier(user) === 'SUPER_ADMIN';
    const isAdminTier = getTier(user) === 'ADMIN' || isSuperAdmin;
    const isStaffTier = getTier(user) === 'STAFF';
    const location = useLocation();
    const navigate = useNavigate();
    const hasFocusedLeadRef = useRef(false);
    const focusLeadId = location.state?.focusLeadId || null;
    const [data, setData] = useState({ 
        leads: [], 
        totalPages: 1, 
        page: 1,
        total: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [pendingOnly, setPendingOnly] = useState(false);
    const [todayOnly, setTodayOnly] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [viewMode, setViewMode] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [remarksHistory, setRemarksHistory] = useState([]);
    const [historyCandidate, setHistoryCandidate] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [pageSizeValue, setPageSizeValue] = useState(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [masterData, setMasterData] = useState([]);
const [categoryFilter, setCategoryFilter] = useState('All');
const [interestFilter, setInterestFilter] = useState('All');
const AUTO_REFRESH_MS = 30000;


   const fetchDomainData = useCallback(async (page = 1, limit = pageSize) => {
    setLoading(true);

    try {
        const token = localStorage.getItem('token');

        // ✅ SUPER ADMIN → use URL domain
        // ✅ OTHERS → force their own domain
        const finalDomain = isSuperAdmin
            ? domain
            : user.domain;

        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit)
        });

        if (categoryFilter !== 'All') params.set('category', categoryFilter);
        if (interestFilter !== 'All') params.set('interest', interestFilter);
        if (statusFilter !== 'All') params.set('status', statusFilter);
        if (searchTerm.trim()) params.set('search', searchTerm.trim());

        const url = `${API_BASE_URL_PORTAL}/api/leads/domain/${encodeURIComponent(finalDomain)}?${params.toString()}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 403) {
            console.error("❌ Access denied");
            return;
        }

        const result = await res.json();

        if (res.ok) {
            const pagination = result.pagination || {};

            setData({
                leads: result.leads || [],
                totalPages: pagination.totalPages || 1,
                page: pagination.currentPage || page,
                total: pagination.total || 0
            });
        }

    } catch (err) {
        console.error("Fetch failed:", err);
    } finally {
        setLoading(false);
    }
}, [user, domain, pageSize, categoryFilter, interestFilter, statusFilter, searchTerm]);

useEffect(() => {
    if (!isSuperAdmin) {
        if (domain !== user.domain) {
            navigate(`/portal/domain/${user.domain}`);
        }
    }
}, [domain, user, navigate, isSuperAdmin]);


const fetchStaff = useCallback(async () => {
    if (!isAdminTier) return;
    try {
        const res = await fetch(`${API_BASE_URL_PORTAL}/api/staff-list`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setStaffList(await res.json());
    } catch (err) { 
        console.error(err); 
    }
}, [isAdminTier]);

    useEffect(() => {
        fetchDomainData();
        fetchStaff();
    }, [fetchDomainData, fetchStaff]);

    useEffect(() => {
        const timer = setInterval(() => {
            fetchDomainData(data.page || 1, pageSize);
        }, AUTO_REFRESH_MS);
        return () => clearInterval(timer);
    }, [fetchDomainData, data.page, pageSize]);

const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setInterestFilter('All');
    setPendingOnly(false);
    setTodayOnly(false);
};


    const deleteLead = async (id) => {
        const confirmed = await confirmToast("Delete this lead?", "Delete");
        if (!confirmed) return;

        const tid = toast.loading("Deleting lead...");
        try {
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                toast.success("Lead deleted successfully", { id: tid });
                fetchDomainData(data.page);
            } else {
                const error = await res.json();
                toast.error(error.message || "Delete failed", { id: tid });
            }
        } catch (err) {
            console.error("Delete Error:", err);
            toast.error("Delete failed", { id: tid });
        }
    };

    const handleEditLead = (lead) => {
        setSelectedLead({ ...lead });
        setIsEditModalOpen(true);
    };

    const saveLeadEdit = async () => {
        const tid = toast.loading("Saving lead changes...");
        try {
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${selectedLead.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify(selectedLead)
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                toast.success("Lead updated", { id: tid });
                fetchDomainData(data.page);
            } else {
                const error = await res.json().catch(() => ({}));
                toast.error(error.message || error.msg || "Failed to update lead details", { id: tid });
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update lead details", { id: tid });
        }
    };



    useEffect(() => {
        const qp = new URLSearchParams(location.search);
        const statusQ = qp.get('status');
        const pendingQ = qp.get('pending');
        const todayQ = qp.get('today');
        const viewQ = qp.get('view');

        setStatusFilter(statusQ || 'All');
        setPendingOnly(pendingQ === '1');
        setTodayOnly(todayQ === '1');
        setViewMode((viewQ || 'all').toLowerCase());
    }, [location.search]);

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
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ leadId, status: newStatus })
            });
            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`);
                fetchDomainData(data.page);
            } else {
                toast.error("Failed to update status");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    const assignLead = async (leadId, staffId, staffName) => {
        const tid = toast.loading("Assigning lead...");
        try {
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ leadId, staffId, staffName })
            });
            if (res.ok) {
                toast.success(`Assigned to ${staffName || "staff"}`, { id: tid });
                fetchDomainData(data.page);
            } else {
                const error = await res.json().catch(() => ({}));
                toast.error(error.msg || "Assignment failed", { id: tid });
            }
        } catch {
            toast.error("Assignment failed", { id: tid });
        }
    };

    const fetchLeadHistory = async (leadId, candidateName) => {
        try {
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/history/leads/${leadId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) {
                setRemarksHistory([]);
                toast.error(`History API error (${res.status}). Restart backend and try again.`);
                return;
            }
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                setRemarksHistory([]);
                toast.error('History API did not return JSON. Check backend route.');
                return;
            }
            setRemarksHistory(await res.json());
            setHistoryCandidate(candidateName);
            setShowHistoryModal(true);
        } catch (err) { console.error(err); }
    };

    const filteredLeads = data.leads.filter(lead => {
    const q = searchTerm.toLowerCase();
    const leadStatus = String(lead.status || '').trim().toLowerCase();
    const leadPayment = String(lead.payment_status || '').trim().toLowerCase();

    const matchesSearch =
        lead.student_name.toLowerCase().includes(q) ||
        lead.phone.includes(searchTerm) ||
        (lead.email || '').toLowerCase().includes(q);

    const matchesStatus =
        statusFilter === 'All' || lead.status === statusFilter;

    const matchesCategory =
        categoryFilter === 'All' || lead.category === categoryFilter;

    const matchesInterest =
        interestFilter === 'All' || lead.interested_in === interestFilter;

    const isPendingLead =
        leadStatus !== 'follow up' &&
        leadStatus !== 'enrolled' &&
        leadStatus !== 'closed';

    const matchesPending = !pendingOnly || isPendingLead;

    const matchesToday = !todayOnly || (() => {
        if (!lead.created_at) return false;
        const leadDate = new Date(lead.created_at);
        const now = new Date();
        return (
            leadDate.getFullYear() === now.getFullYear() &&
            leadDate.getMonth() === now.getMonth() &&
            leadDate.getDate() === now.getDate()
        );
    })();

    const matchesViewMode = (() => {
        if (viewMode === 'pending') return isPendingLead;
        if (viewMode === 'invalid') return leadStatus === 'closed';
        if (viewMode === 'payment') {
            return leadPayment === 'paid' || leadPayment === 'partially paid' || leadPayment === 'unpaid';
        }
        return true;
    })();

    return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesInterest &&
        matchesPending &&
        matchesToday &&
        matchesViewMode
    );
});

   

const fetchMaster = useCallback(async () => {
    try {
        const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/full-structure`);
        const json = await res.json();
        setMasterData(json || []);
    } catch (err) {
        console.error("Master fetch failed", err);
    }
}, []);

useEffect(() => {
    fetchMaster();
}, [fetchMaster]);

const domainMaster = masterData.find(
    d => d.name?.toLowerCase() === domain?.toLowerCase()
);

const categories = domainMaster?.categories || [];

const allValues = categories.flatMap(c => c.values || []);

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

   

    const viewTitleMap = {
        all: 'All Enquiry / Leads',
        'lead-status': 'All Leads Status',
        pending: 'All Pendings',
        payment: 'All Payment Status',
        invalid: 'All Invalid Enquiries',
    };

    const activeViewTitle = viewTitleMap[viewMode] || viewTitleMap.all;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="font-black text-slate-800 uppercase tracking-tighter text-2xl leading-none">{domain}</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{activeViewTitle}</p>
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

                    {/* CATEGORY FILTER */}
<select
    value={categoryFilter}
    onChange={(e) => {
        setCategoryFilter(e.target.value);
        setInterestFilter('All');
    }}
    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold"
>
    <option value="All">All Categories</option>
    {categories.map(cat => (
        <option key={cat.id} value={cat.category_name}>
            {cat.category_name}
        </option>
    ))}
</select>

{/* INTEREST FILTER */}
<select
    value={interestFilter}
    onChange={(e) => setInterestFilter(e.target.value)}
    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold"
>
    <option value="All">All Interests</option>
    {categories
        .filter(c => categoryFilter === 'All' || c.category_name === categoryFilter)
        .flatMap(c => c.values || [])
        .map(val => (
            <option key={val.id} value={val.sub_value}>
                {val.sub_value}
            </option>
        ))}
</select>

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
    onClick={resetFilters}
    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-bold"
>
    Reset
</button>

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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchDomainData(data.page, pageSize)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Refresh Table"
                    >
                        <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        TOTAL: {data.total || 0} LEADS
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className={`overflow-x-auto ${enableTableScroll ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                <th className="p-4 border-r border-slate-100">Candidate</th>
                                <th className="p-4 border-r border-slate-100">Phone</th>
                                <th className="p-4 border-r border-slate-100">Category</th>
                                <th className="p-4 border-r border-slate-100">Interest</th>
                                <th className="p-4 border-r border-slate-100">
                                    {isStaffTier ? 'Assigned By' : 'Assigned To'}
                                </th>
                                <th className="p-4 border-r border-slate-100">Date</th>
                                <th className="p-4 border-r border-slate-100">Status</th>
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
                                    <td className="p-4 border-r border-slate-50">
                                        <p className="font-bold text-slate-800">{lead.student_name}</p>
                                        <p className="text-[10px] text-slate-400">{lead.lead_code || `#${lead.id}`}</p>
                                    </td>
                                    <td className="p-4 font-medium text-slate-600 border-r border-slate-50 text-xs">{lead.phone}</td>

                                    <td className="p-4 text-xs font-bold text-slate-60 border-slate-50 border-r">
    {lead.category || '-'}
</td>

<td className="p-4 text-xs text-blue-600 font-bold border-slate-50 border-r">
    {lead.interested_in || '-'}
</td>

                                    <td className="p-4 border-r border-slate-50">
                                        {isStaffTier ? (
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

                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/portal/domain/${location.pathname.split('/').pop()}/lead/${lead.id}`)}
                                                className="px-2 py-1 text-[9px] font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors uppercase"
                                                title="View Details"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => fetchLeadHistory(lead.id, lead.student_name)}
                                                className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                                title="History"
                                            >
                                                <History size={10} /> VIEW
                                            </button>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Category</label>
                                    <select
                                        className="w-full p-2 border rounded-lg text-sm bg-white"
                                        value={selectedLead.category || ''}
                                        onChange={(e) =>
                                            setSelectedLead({
                                                ...selectedLead,
                                                category: e.target.value,
                                                interested_in: ''
                                            })
                                        }
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.category_name}>
                                                {c.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Interested In</label>
                                    <select
                                        className="w-full p-2 border rounded-lg text-sm bg-white"
                                        value={selectedLead.interested_in || ''}
                                        onChange={(e) => setSelectedLead({...selectedLead, interested_in: e.target.value})}
                                    >
                                        <option value="">Select Interest</option>
                                        {categories
                                            .find(c => c.category_name === selectedLead.category)
                                            ?.values?.map(v => (
                                                <option key={v.id} value={v.sub_value}>
                                                    {v.sub_value}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase">Remarks</label>
                                <input 
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={selectedLead.remarks || ''}
                                    onChange={(e) => setSelectedLead({...selectedLead, remarks: e.target.value})}
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
