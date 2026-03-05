import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, PhoneCall, GraduationCap, XCircle,
  AlertCircle, 
  Calendar, Filter, RefreshCcw
} from 'lucide-react';
import LoadingScreen from '../Layout/LoadingScreen';
import Pagination from '../Layout/Pagination';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';



const Dashboard = ({ user }) => {
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalEnquiry: 0, totalFollowup: 0, totalAdmission: 0,
        totalPending: 0,
        totalInvalid: 0,
        todayEnquiry: 0, todayFollowup: 0, todayAdmission: 0,
        todayPending: 0,
        todayInvalid: 0
    });
    const [todayLeads, setTodayLeads] = useState([]);
    const [statusLeads, setStatusLeads] = useState([]);
    const [domains, setDomains] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('All');
    const [appliedGlobalFilter, setAppliedGlobalFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination States
    const [todayPage, setTodayPage] = useState(1);
    const [todayLimit, setTodayLimit] = useState(5);
    
    const [statusPage, setStatusPage] = useState(1);
    const [statusLimit, setStatusLimit] = useState(5);
    const AUTO_REFRESH_MS = 30000;

    const getTier = (u) => {
        if (u?.tier) return u.tier;
        if (['Main Admin', 'MD', 'GM'].includes(u?.role)) return 'SUPER_ADMIN';
        if (['TL', 'Coordinator', 'Head'].includes(u?.role)) return 'ADMIN';
        return 'STAFF';
    };
    const isSuperAdmin = getTier(user) === 'SUPER_ADMIN';

    const getSlug = (name = '') => {
        const cleanName = String(name || '').trim();
        const normalized = cleanName.toLowerCase().replace(/^bluestone\s+/, '');
        const mapping = {
            'ias academy': 'ias',
            'techpark': 'techpark',
            'overseas': 'overseas',
            'placements': 'placements',
            'language hub': 'languages',
            'elite sports': 'sports',
            'preschool': 'preschool',
            'startup': 'startup',
        };
        return mapping[normalized] || normalized.replace(/\s+/g, '-');
    };

    const handleLeadClick = (lead) => {
        const leadDomain =
            lead?.domain ||
            lead?.domain_name ||
            lead?.domainName ||
            user?.domain ||
            '';
        navigate(`/portal/domain/${getSlug(leadDomain)}`, {
            state: { focusLeadId: lead.id },
        });
    };

    const handleCardClick = (cardType) => {
        const domainQuery = isSuperAdmin && appliedGlobalFilter !== 'All'
            ? `?domain=${encodeURIComponent(appliedGlobalFilter)}`
            : '';

        if (isSuperAdmin) {
            if (cardType === 'totalEnquiry') navigate(`/portal/bgi/all-enquiry${domainQuery}`);
            if (cardType === 'totalFollowup') navigate(`/portal/bgi/all-enquiry?status=${encodeURIComponent('Follow Up')}${domainQuery ? `&${domainQuery.slice(1)}` : ''}`);
            if (cardType === 'totalAdmission') navigate(`/portal/bgi/all-enquiry?status=${encodeURIComponent('Enrolled')}${domainQuery ? `&${domainQuery.slice(1)}` : ''}`);
            if (cardType === 'totalPending') navigate(`/portal/bgi/pendings${domainQuery}`);
            if (cardType === 'totalInvalid') navigate(`/portal/bgi/invalid-enquiries${domainQuery}`);
            if (cardType === 'todayPending') navigate(`/portal/bgi/pendings?today=1${domainQuery ? `&${domainQuery.slice(1)}` : ''}`);
            if (cardType === 'todayInvalid') navigate(`/portal/bgi/invalid-enquiries?today=1${domainQuery ? `&${domainQuery.slice(1)}` : ''}`);
            return;
        }

        // Non-super-admin: open their domain table
        const slug = getSlug(user.domain);
        if (cardType === 'totalFollowup') navigate(`/portal/domain/${slug}?status=${encodeURIComponent('Follow Up')}`);
        else if (cardType === 'totalAdmission') navigate(`/portal/domain/${slug}?status=${encodeURIComponent('Enrolled')}`);
        else if (cardType === 'totalPending') navigate(`/portal/domain/${slug}?pending=1`);
        else if (cardType === 'totalInvalid') navigate(`/portal/domain/${slug}?status=${encodeURIComponent('Closed')}`);
        else if (cardType === 'todayInvalid') navigate(`/portal/domain/${slug}?status=${encodeURIComponent('Closed')}&today=1`);
        else if (cardType === 'todayPending') navigate(`/portal/domain/${slug}?pending=1&today=1`);
        else navigate(`/portal/domain/${slug}`);
    };

    const fetchListLeads = useCallback(async (type, domain) => {
        try {
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/dashboard/leads-filter?filterType=${type}&domain=${domain}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.status === 403) return console.error("Access Denied (403): Check permissions or token.");
            const data = await res.json();
            // Ensure we set an array even if API returns something else
            const leadsArray = Array.isArray(data) ? data : (data.leads || []);
            if (type === 'today') {
                setTodayLeads(leadsArray);
            } else if (type === 'updated') {
                setStatusLeads(leadsArray);
            }
        } catch (err) { console.error("Fetch Error:", err); }
    }, []);

    // ... fetchMetric and Domain useEffect remain the same as your previous version ...
    useEffect(() => {
        if (isSuperAdmin) {
            fetch(`${API_BASE_URL_PORTAL}/api/master/full-structure`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => res.json()).then(setDomains).catch(console.error);
        }
    }, [isSuperAdmin]);

    const fetchMetric = useCallback(async (timeframe, type, domain) => {
        try {
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/dashboard/stats/${timeframe}/${type}?domain=${domain}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await res.json();
            return result.count || 0;
        } catch { return 0; }
    }, []);

    const fetchAllEnquiries = useCallback(async (domain) => {
        try {
            const params = new URLSearchParams({
                view: 'all',
                page: '1',
                limit: '5000',
                search: '',
                domain: domain || 'All',
                status: 'All',
                payment_status: 'All',
                invalid_reason: 'All',
                sort_by: 'created_at',
                sort_order: 'desc',
            });
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/bgi/leads?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) return [];
            const json = await res.json();
            return Array.isArray(json.leads) ? json.leads : [];
        } catch {
            return [];
        }
    }, []);

    const refreshDashboardData = useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true);
        const domain = isSuperAdmin ? appliedGlobalFilter : user.domain;
        try {
            const [
                totalEnquiry,
                totalFollowup,
                totalAdmission,
                todayEnquiry,
                todayFollowup,
                todayAdmission,
                allEnquiries,
            ] = await Promise.all([
                fetchMetric('total', 'enquiry', domain),
                fetchMetric('total', 'followup', domain),
                fetchMetric('total', 'admission', domain),
                fetchMetric('today', 'enquiry', domain),
                fetchMetric('today', 'followup', domain),
                fetchMetric('today', 'admission', domain),
                fetchAllEnquiries(domain),
            ]);

            const pendingRows = allEnquiries.filter((lead) => {
                const st = String(lead.status || '').trim().toLowerCase();
                return st !== 'follow up' && st !== 'enrolled' && st !== 'closed';
            });
            const invalidRows = allEnquiries.filter((lead) => {
                const st = String(lead.status || '').trim().toLowerCase();
                return st === 'closed';
            });
            const totalPending = pendingRows.length;
            const totalInvalid = invalidRows.length;
            const now = new Date();
            const todayPending = pendingRows.filter((lead) => {
                const d = new Date(lead.created_at);
                return (
                    d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate()
                );
            }).length;
            const todayInvalid = invalidRows.filter((lead) => {
                const d = new Date(lead.created_at);
                return (
                    d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate()
                );
            }).length;

            setStats({
                totalEnquiry,
                totalFollowup,
                totalAdmission,
                totalPending,
                totalInvalid,
                todayEnquiry,
                todayFollowup,
                todayAdmission,
                todayPending,
                todayInvalid,
            });

            await Promise.all([
                fetchListLeads('today', domain),
                fetchListLeads('updated', domain),
            ]);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [appliedGlobalFilter, fetchMetric, fetchAllEnquiries, fetchListLeads, isSuperAdmin, user.domain]);

    useEffect(() => {
        refreshDashboardData(true);
    }, [refreshDashboardData]);

    useEffect(() => {
        const timer = setInterval(() => {
            refreshDashboardData(false);
        }, AUTO_REFRESH_MS);
        return () => clearInterval(timer);
    }, [refreshDashboardData]);

    if (isLoading) {
        return <LoadingScreen message="Loading dashboard data..." fullPage={false} />;
    }

    const MiniStatCard = ({ title, value, label, color, bgColor, onClick }) => (
    <button onClick={onClick} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm text-left hover:shadow-md transition-all">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{title}</p>
            <div className="flex items-baseline gap-2">
                <h4 className={`text-2xl font-black ${color}`}>{value}</h4>
                <span className="text-[10px] text-slate-500 font-medium">{label}</span>
            </div>
        </div>
        <div className={`${bgColor} ${color} px-2 py-1 rounded-lg text-[10px] font-black uppercase`}>
            Live
        </div>
    </button>
);

    return (
        <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Welcome, {user.name}</h1>
                    <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">{user.role} • {user.domain}</p>
                </div>
                {isSuperAdmin && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                        <Filter size={14} className="text-slate-400" />
                        <select value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="bg-transparent font-bold text-xs outline-none">
                            <option value="All">All Domains</option>
                            {domains.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>
                )}
            </header>


            {/* Stat Cards Grid */}
<div className="space-y-6">
    {/* Tier 1: Life-time Totals (Large) */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard title="Total Enquiry" value={stats.totalEnquiry} icon={<Users />} color="bg-gradient-to-br from-rose-700 to-rose-500" onClick={() => handleCardClick('totalEnquiry')} />
        <StatCard title="Total Followup" value={stats.totalFollowup} icon={<PhoneCall />} color="bg-gradient-to-br from-orange-600 to-amber-500" onClick={() => handleCardClick('totalFollowup')} />
        <StatCard title="Total Admission" value={stats.totalAdmission} icon={<GraduationCap />} color="bg-gradient-to-br from-emerald-700 to-emerald-500" onClick={() => handleCardClick('totalAdmission')} />
        <StatCard title="Total Pendings" value={stats.totalPending} icon={<AlertCircle />} color="bg-gradient-to-br from-slate-800 to-slate-600" onClick={() => handleCardClick('totalPending')} />
        <StatCard title="Total Invalid Enquiries" value={stats.totalInvalid} icon={<XCircle />} color="bg-gradient-to-br from-red-700 to-red-500" onClick={() => handleCardClick('totalInvalid')} />
    </div>

    {/* Tier 2: Today's Snapshot (Compact) */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MiniStatCard 
            title="Today's Enquiries" 
            value={stats.todayEnquiry} 
            color="text-red-600" 
            bgColor="bg-red-100" 
            onClick={() => handleCardClick('totalEnquiry')}
        />
        <MiniStatCard 
            title="Today's Followups" 
            value={stats.todayFollowup} 
            color="text-orange-600" 
            bgColor="bg-orange-100" 
            onClick={() => handleCardClick('totalFollowup')}
        />
        <MiniStatCard 
            title="Today's Admissions" 
            value={stats.todayAdmission}
            color="text-emerald-600" 
            bgColor="bg-emerald-100" 
            onClick={() => handleCardClick('totalAdmission')}
        />
        <MiniStatCard 
            title="Today's Pendings" 
            value={stats.todayPending} 
            color="text-slate-700" 
            bgColor="bg-slate-200" 
            onClick={() => handleCardClick('todayPending')}
        />
        <MiniStatCard 
            title="Today's Invalid Enquiries" 
            value={stats.todayInvalid} 
            color="text-rose-700" 
            bgColor="bg-rose-100" 
            onClick={() => handleCardClick('todayInvalid')}
        />
    </div>
</div>

            {/* Main Content Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeadList 
                    title="Today's Enquiry" data={todayLeads} icon={<Calendar className="text-red-600"/>} color="bg-red-50" badgeColor="bg-red-600"
                    currentPage={todayPage} setCurrentPage={setTodayPage} pageSize={todayLimit} setPageSize={setTodayLimit} userTier={getTier(user)}
                    onLeadClick={handleLeadClick}
                    onRefresh={() => refreshDashboardData(false)}
                />
                <LeadList 
                    title="Leads Status" data={statusLeads} icon={<AlertCircle className="text-red-600"/>} color="bg-red-50" badgeColor="bg-red-600"
                    currentPage={statusPage} setCurrentPage={setStatusPage} pageSize={statusLimit} setPageSize={setStatusLimit} userTier={getTier(user)}
                    showRemarks={true}
                    onLeadClick={handleLeadClick}
                    onRefresh={() => refreshDashboardData(false)}
                />
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, icon, color, onClick }) => (
    <button onClick={onClick} className={`${color} rounded-2xl p-6 shadow-lg text-white flex justify-between items-center transition-transform hover:scale-[1.02] text-left`}>
        <div>
            <p className="text-[10px] font-bold uppercase opacity-80">{title}</p>
            <h3 className="text-3xl font-black">{value}</h3>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
    </button>
);

const LeadList = ({ title, data, icon, color, badgeColor, currentPage, setCurrentPage, pageSize, setPageSize, userTier, showRemarks = false, onLeadClick, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllRows, setShowAllRows] = useState(false);

    const safeData = Array.isArray(data) ? data : [];
    const q = searchTerm.toLowerCase();
    const filteredData = safeData.filter(lead => 
        lead.student_name.toLowerCase().includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        lead.phone.includes(searchTerm) ||
        String(lead.id || '').includes(searchTerm) ||
        String(lead.lead_code || '').toLowerCase().includes(q)
    );

    const totalPages = Math.max(Math.ceil(filteredData.length / pageSize), 1);
    const paginatedData = showAllRows
        ? filteredData
        : filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const enableVerticalScroll =
        (showAllRows && filteredData.length > 5) ||
        (!showAllRows && pageSize > 5 && paginatedData.length > 5);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages, setCurrentPage]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
            {/* Header & Search */}
            <div className={`${color} p-4 border-b space-y-3`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        {icon} {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onRefresh && onRefresh()}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                            title="Refresh Table"
                        >
                            <RefreshCcw size={12} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAllRows((prev) => !prev);
                                setCurrentPage(1);
                            }}
                            className={`${badgeColor} text-white text-[10px] px-2 py-0.5 rounded-full font-bold hover:opacity-90 transition-opacity`}
                            title={showAllRows ? 'Show paginated rows' : 'Show all rows'}
                        >
                            {filteredData.length}
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                </div>
            </div>
            
            {/* Table Body */}
            <div
                className={`flex-grow overflow-x-auto min-h-[350px] ${enableVerticalScroll ? 'max-h-[350px] overflow-y-auto' : ''}`}
            >
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                            <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</th>
                            <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            {showRemarks && (
                                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
                            )}
                            <th className="text-right py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginatedData.length > 0 ? paginatedData.map(lead => (
                            <tr
                                key={lead.id}
                                onClick={() => onLeadClick && onLeadClick(lead)}
                                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                            >
                                {/* Name Cell */}
                                <td className="py-3 px-4">
                                    <p className="font-bold text-slate-800 text-sm">{lead.student_name}</p>
                                    <p className="text-[8px] text-red-600 font-bold uppercase leading-none mt-0.5">{lead.domain}</p>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase leading-none mt-1">{lead.lead_code || `#${lead.id}`}</p>
                                </td>

                                {/* Email & Phone Cell */}
                                <td className="py-3 px-4">
                                    
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="text-[11px] font-medium truncate max-w-[150px]">{lead.email || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-700">
                                            <span className="text-[11px] font-bold">{lead.phone}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Status Cell */}
                                <td className="py-3 px-4 text-center">
                                    <span className="text-[9px] font-black px-2 py-1 rounded uppercase bg-slate-100 text-slate-600 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                        {lead.status}
                                    </span>
                                </td>
                                {showRemarks && (
                                    <td className="py-3 px-4">
                                        <p className="text-[11px] text-slate-600 truncate max-w-[200px]">
                                            {lead.remarks || '-'}
                                        </p>
                                    </td>
                                )}

                                {/* Assignment Cell */}
                                <td className="py-3 px-4 text-right">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">
                                        {userTier === 'STAFF' ? 'From' : 'To'}
                                    </p>
                                    <p className="text-[10px] text-slate-600 font-black truncate max-w-[100px] ml-auto">
                                        {userTier === 'STAFF' ? (lead.assigned_by_name || 'System') : (lead.assigned_to_name || 'Unassigned')}
                                    </p>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={showRemarks ? 5 : 4} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                                        <AlertCircle size={20} />
                                        <p className="text-xs italic">No matching records found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAllRows ? (
                <div className="p-3 bg-slate-50 border-t flex justify-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase">All {filteredData.length}</span>
                </div>
            ) : (
                <Pagination
                    stats={{ currentPage, totalPages }}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                    pageSizeValue={pageSize}
                    onPageSizeChange={(size) => {
                        setPageSize(Number(size));
                        setCurrentPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20, 50]}
                />
            )}
        </div>
    );
};

export default Dashboard;


