import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, PhoneCall, GraduationCap, Clock, 
  AlertCircle, ChevronLeft, ChevronRight, 
  Calendar, Filter 
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import LoadingScreen from '../Layout/LoadingScreen';



const Dashboard = ({ user }) => {
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalEnquiry: 0, totalFollowup: 0, totalAdmission: 0,
        todayEnquiry: 0, todayFollowup: 0, todayAdmission: 0
    });
    const [todayLeads, setTodayLeads] = useState([]);
    const [statusLeads, setStatusLeads] = useState([]);
    const [domains, setDomains] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination States
    const [todayPage, setTodayPage] = useState(1);
    const [todayLimit, setTodayLimit] = useState(5);
    
    const [statusPage, setStatusPage] = useState(1);
    const [statusLimit, setStatusLimit] = useState(5);

    const isSuperAdmin = ['Main Admin', 'MD', 'GM'].includes(user.role);

    const getSlug = (name = '') => {
        const mapping = {
            'IAS Academy': 'ias',
            'Techpark': 'techpark',
            'Overseas': 'overseas',
            'Placements': 'placements',
            'Language Hub': 'languages',
            'Elite Sports': 'sports',
            'Preschool': 'preschool',
            'Startup': 'startup',
        };
        return mapping[name] || name.toLowerCase().replace(/\s+/g, '-');
    };

    const handleLeadClick = (lead) => {
        navigate(`/domain/${getSlug(lead.domain)}`, {
            state: { focusLeadId: lead.id },
        });
    };

   

    const fetchListLeads = useCallback(async (type, domain) => {
        try {
            const res = await fetch(`http://localhost:5005/api/dashboard/leads-filter?filterType=${type}&domain=${domain}`, {
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
            fetch('http://localhost:5005/api/master/full-structure', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => res.json()).then(setDomains).catch(console.error);
        }
    }, [isSuperAdmin]);

    const fetchMetric = useCallback(async (timeframe, type, domain) => {
        try {
            const res = await fetch(`http://localhost:5005/api/dashboard/stats/${timeframe}/${type}?domain=${domain}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await res.json();
            return result.count || 0;
        } catch { return 0; }
    }, []);

    useEffect(() => {
        const loadInitialStats = async () => {
            setIsLoading(true);
            const domain = isSuperAdmin ? globalFilter : user.domain;
            try {
                const [
                    totalEnquiry,
                    totalFollowup,
                    totalAdmission,
                    todayEnquiry,
                    todayFollowup,
                    todayAdmission,
                ] = await Promise.all([
                    fetchMetric('total', 'enquiry', domain),
                    fetchMetric('total', 'followup', domain),
                    fetchMetric('total', 'admission', domain),
                    fetchMetric('today', 'enquiry', domain),
                    fetchMetric('today', 'followup', domain),
                    fetchMetric('today', 'admission', domain),
                ]);

                setStats({
                    totalEnquiry,
                    totalFollowup,
                    totalAdmission,
                    todayEnquiry,
                    todayFollowup,
                    todayAdmission,
                });

                await Promise.all([
                    fetchListLeads('today', domain),
                    fetchListLeads('updated', domain),
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialStats();
    }, [globalFilter, fetchMetric, fetchListLeads, isSuperAdmin, user.domain]);

    if (isLoading) {
        return <LoadingScreen message="Loading dashboard data..." fullPage={false} />;
    }

    const MiniStatCard = ({ title, value, label, color, bgColor }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
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
    </div>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Enquiry" value={stats.totalEnquiry} icon={<Users />} color="bg-blue-600" />
        <StatCard title="Total Followup" value={stats.totalFollowup} icon={<PhoneCall />} color="bg-orange-500" />
        <StatCard title="Total Admission" value={stats.totalAdmission} icon={<GraduationCap />} color="bg-green-600" />
    </div>

    {/* Tier 2: Today's Snapshot (Compact) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniStatCard 
            title="Today's Enquiries" 
            value={stats.todayEnquiry} 
            color="text-blue-600" 
            bgColor="bg-blue-100" 
        />
        <MiniStatCard 
            title="Today's Followups" 
            value={stats.todayFollowup} 
            color="text-orange-600" 
            bgColor="bg-orange-100" 
        />
        <MiniStatCard 
            title="Today's Admissions" 
            value={stats.todayAdmission} 
            color="text-green-600" 
            bgColor="bg-green-100" 
        />
    </div>
</div>

            {/* Main Content Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeadList 
                    title="Today's Enquiry" data={todayLeads} icon={<Calendar className="text-blue-600"/>} color="bg-blue-50" badgeColor="bg-blue-600"
                    currentPage={todayPage} setCurrentPage={setTodayPage} pageSize={todayLimit} setPageSize={setTodayLimit} userRole={user.role}
                    onLeadClick={handleLeadClick}
                />
                <LeadList 
                    title="Leads Status" data={statusLeads} icon={<AlertCircle className="text-orange-600"/>} color="bg-orange-50" badgeColor="bg-orange-600"
                    currentPage={statusPage} setCurrentPage={setStatusPage} pageSize={statusLimit} setPageSize={setStatusLimit} userRole={user.role}
                    showRemarks={true}
                    onLeadClick={handleLeadClick}
                />
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, icon, color }) => (
    <div className={`${color} rounded-2xl p-6 shadow-lg text-white flex justify-between items-center transition-transform hover:scale-[1.02]`}>
        <div>
            <p className="text-[10px] font-bold uppercase opacity-80">{title}</p>
            <h3 className="text-3xl font-black">{value}</h3>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
    </div>
);

const LeadList = ({ title, data, icon, color, badgeColor, currentPage, setCurrentPage, pageSize, setPageSize, userRole, showRemarks = false, onLeadClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllRows, setShowAllRows] = useState(false);

    const safeData = Array.isArray(data) ? data : [];
    const filteredData = safeData.filter(lead => 
        lead.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.phone.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = showAllRows
        ? filteredData
        : filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const enableVerticalScroll =
        (showAllRows && filteredData.length > 5) ||
        (!showAllRows && pageSize > 5 && paginatedData.length > 5);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
            {/* Header & Search */}
            <div className={`${color} p-4 border-b space-y-3`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        {icon} {title}
                    </h3>
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
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
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
                                    <p className="text-[8px] text-blue-600 font-bold uppercase leading-none mt-0.5">{lead.domain}</p>
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
                                        {userRole === 'Staff' ? 'From' : 'To'}
                                    </p>
                                    <p className="text-[10px] text-slate-600 font-black truncate max-w-[100px] ml-auto">
                                        {userRole === 'Staff' ? (lead.assigned_by_name || 'System') : (lead.assigned_to_name || 'Unassigned')}
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

            {/* Pagination Footer */}
            <div className="p-3 bg-slate-50 border-t flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Show</span>
                    <select 
                        value={pageSize} 
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                            setShowAllRows(false);
                        }}
                        className="bg-white border border-slate-200 text-[10px] font-bold py-1 px-1 rounded outline-none"
                    >
                        {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                        {showAllRows ? `All ${filteredData.length}` : `Page ${currentPage} / ${totalPages || 1}`}
                    </span>
                    <div className="flex gap-1">
                        <button
                            disabled={showAllRows || currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:bg-slate-100 shadow-sm transition-all"
                        >
                            <ChevronLeft size={14} strokeWidth={3}/>
                        </button>
                        <button
                            disabled={showAllRows || currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-1.5 rounded-lg border bg-white disabled:opacity-30 hover:bg-slate-100 shadow-sm transition-all"
                        >
                            <ChevronRight size={14} strokeWidth={3}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
