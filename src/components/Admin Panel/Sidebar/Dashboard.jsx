import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, PhoneCall, GraduationCap, XCircle,
    AlertCircle,
    Calendar, Filter, RefreshCcw,
    ChevronUp, ChevronDown, BarChart3, TrendingUp
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import LoadingScreen from '../Layout/LoadingScreen';
import Pagination from '../Layout/Pagination';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';

const Dashboard = ({ user }) => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalEnquiry: 0, totalFollowup: 0, totalEnrolled: 0,
        totalPending: 0,
        totalInvalid: 0,
        todayEnquiry: 0, todayFollowup: 0, todayEnrolled: 0,
        todayPending: 0,
        todayInvalid: 0
    });
    const [todayLeads, setTodayLeads] = useState([]);
    const [statusLeads, setStatusLeads] = useState([]);
    const [domains, setDomains] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('All');
    const [appliedGlobalFilter, setAppliedGlobalFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
    const [allStaff, setAllStaff] = useState([]);
    const [selectedStaffId, setSelectedStaffId] = useState('All');

    // Helper to get today's date in IST (YYYY-MM-DD)
    const getISTDateStr = () => {
        try {
            return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        } catch (e) {
            // Fallback for older browsers
            return new Date().toISOString().split('T')[0];
        }
    };

    const istToday = getISTDateStr();

    const [trendRange, setTrendRange] = useState('day');
    const [trendData, setTrendData] = useState([]);
    const [isTrendLoading, setIsTrendLoading] = useState(false);
    const [trendStartDate, setTrendStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    });
    const [trendEndDate, setTrendEndDate] = useState(istToday);
    const [trendHistoryDate, setTrendHistoryDate] = useState(istToday);
    const [trendStatus, setTrendStatus] = useState('All');

    // --- Applied States (The actual filters sent to API) ---
    const [appliedTrendRange, setAppliedTrendRange] = useState('day');
    const [appliedTrendHistoryDate, setAppliedTrendHistoryDate] = useState(istToday);
    const [appliedTrendStartDate, setAppliedTrendStartDate] = useState(trendStartDate);
    const [appliedTrendEndDate, setAppliedTrendEndDate] = useState(istToday);
    const [appliedStaffId, setAppliedStaffId] = useState('All');
    // Global filter already has appliedGlobalFilter state

    // Pagination States
    const [todayPage, setTodayPage] = useState(1);
    const [todayLimit, setTodayLimit] = useState(5);

    const [statusPage, setStatusPage] = useState(1);
    const [statusLimit, setStatusLimit] = useState(5);
    const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust

    // Visibility States
    const [isStatsExpanded, setIsStatsExpanded] = useState(true);
    const [isGraphExpanded, setIsGraphExpanded] = useState(false);
    const [isTablesExpanded, setIsTablesExpanded] = useState(true);

    const getTier = (u) => {
        if (u?.tier) return u.tier;
        const r = u?.role || '';
        if (['Main Admin', 'MD', 'GM', 'Super Admin'].includes(r)) return 'SUPER_ADMIN';
        if (['TL', 'Coordinator', 'Head', 'Admin'].includes(r)) return 'ADMIN';
        return 'STAFF';
    };
    const isSuperAdmin = getTier(user) === 'SUPER_ADMIN';
    const isAdminTier = getTier(user) === 'ADMIN' || isSuperAdmin;
    const isStaffUser = getTier(user) === 'STAFF';

    const getUserDomains = (domainStr) => {
        if (!domainStr) return [];
        return domainStr.split(',').map(d => d.trim()).filter(Boolean);
    };
    const userDomainsList = getUserDomains(user?.domain);
    const hasMultipleDomains = userDomainsList.length > 1;

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
        if (!lead?.id) return;
        const slug = getSlug(leadDomain);
        const status = String(lead.status || '').trim().toLowerCase();
        let viewQuery = '?view=all';
        if (status === 'follow up') viewQuery = '?view=lead-status';
        else if (status.includes('waiting')) viewQuery = '?view=waiting';
        else if (status === 'invalid') viewQuery = '?view=invalid';
        else if (status === 'dropped') viewQuery = '?view=dropped';
        else if (status === 'enrolled') viewQuery = `?view=lead-status&status=${encodeURIComponent('Enrolled')}`;

        navigate(`/portal/domain/${slug}${viewQuery}`, {
            state: { 
                focusLeadId: lead.id,
                focusLeadCode: lead.lead_code || lead.id 
            },
        });
    };

    const handleCardClick = (cardType, isPeriodPerformance = false) => {
        // 1. Determine if we use the Global BGI route or the Local Domain route
        const useGlobalBgi = isSuperAdmin || (isAdminTier && hasMultipleDomains) || (isStaffUser && userDomainsList.length > 1);
        const slug = getSlug(user.domain);

        // 2. Build common query params (Domain/Staff filters)
        // Use applied filters to match dashboard data
        const domainParam = (isSuperAdmin || (isAdminTier && hasMultipleDomains)) && appliedGlobalFilter !== 'All'
            ? `domain=${encodeURIComponent(appliedGlobalFilter)}`
            : '';
        const staffParam = appliedStaffId && appliedStaffId !== 'All'
            ? `assignedTo=${encodeURIComponent(appliedStaffId)}`
            : '';

        // 3. Add Period Filters
        let periodParams = '';
        if (isPeriodPerformance) {
            if (appliedTrendRange === 'day') {
                if (appliedTrendHistoryDate === istToday) {
                    periodParams = 'today=1';
                } else {
                    periodParams = `date=${appliedTrendHistoryDate}`;
                }
            } else if (appliedTrendRange === 'custom') {
                periodParams = `startDate=${appliedTrendStartDate}&endDate=${appliedTrendEndDate}`;
            } else {
                // For week, month, year - dashboard handles these as ranges ending today
                // We'll calculate the relative start date or pass a range
                const today = new Date(istToday);
                let start = new Date(istToday);
                if (appliedTrendRange === 'week') start.setDate(today.getDate() - 7);
                else if (appliedTrendRange === 'month') start.setDate(today.getDate() - 30);
                else if (appliedTrendRange === 'year') start.setDate(today.getDate() - 365);
                
                const startStr = start.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                periodParams = `startDate=${startStr}&endDate=${istToday}`;
            }
        }

        const buildQuery = (existingParams = []) => {
            const all = [...existingParams, domainParam, staffParam, periodParams].filter(Boolean).join('&');
            return all ? `?${all}` : '';
        };

        // 4. Navigate based on Route Type
        if (useGlobalBgi) {
            if (cardType === 'totalEnquiry') navigate(`/portal/bgi/all-enquiry${buildQuery()}`);
            else if (cardType === 'totalFollowup') navigate(`/portal/bgi/lead-status${buildQuery()}`);
            else if (cardType === 'totalEnrolled') navigate(`/portal/bgi/payment-status${buildQuery()}`);
            else if (cardType === 'totalPending') navigate(`/portal/bgi/waiting-confirmation${buildQuery()}`);
            else if (cardType === 'totalInvalid') navigate(`/portal/bgi/invalid-enquiries${buildQuery()}`);
        } else {
            // Single Domain Staff Route
            let view = 'all';
            let extra = [];
            if (cardType === 'totalFollowup') view = 'lead-status';
            else if (cardType === 'totalEnrolled') { view = 'payment'; }
            else if (cardType === 'totalPending') view = 'waiting';
            else if (cardType === 'totalInvalid') view = 'invalid';

            navigate(`/portal/domain/${slug}${buildQuery(['view=' + view, ...extra])}`);
        }
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

    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/full-structure`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const json = await res.json();
                const domainNames = Array.isArray(json)
                    ? json
                        .map((d) => (typeof d === 'string' ? d : d?.name))
                        .filter(Boolean)
                    : [];

                if (isSuperAdmin) {
                    setDomains(domainNames);
                } else if (hasMultipleDomains) {
                    const filtered = domainNames.filter(d => userDomainsList.includes(d));
                    setDomains(filtered);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchDomains();
    }, [isSuperAdmin, isAdminTier, hasMultipleDomains, user.domain]);

    useEffect(() => {
        const fetchStaffList = async () => {
            if (!user) return; 
            try {
                // For non-super admins, the backend already handles filtering by their authorized domains.
                // We pass the currently selected domain filter if available.
                const domainParam = (isSuperAdmin || hasMultipleDomains) ? appliedGlobalFilter : (user.domain || 'All');
                const res = await fetch(`${API_BASE_URL_PORTAL}/api/dashboard/staff-list?domain=${encodeURIComponent(domainParam)}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                setAllStaff(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Staff fetch error:", err);
            }
        };
        fetchStaffList();
    }, [isSuperAdmin, appliedGlobalFilter, user, hasMultipleDomains]);

    const fetchMetric = useCallback(async (timeframe, type, domain, staffId, date, startDate, endDate) => {
        try {
            let url = `${API_BASE_URL_PORTAL}/api/dashboard/stats/${timeframe}/${type}?domain=${domain}`;
            if (staffId && staffId !== 'All') url += `&userId=${staffId}`;
            if (timeframe === 'history' && date) url += `&date=${date}`;
            if (timeframe === 'custom' && startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await res.json();
            return result.count || 0;
        } catch { return 0; }
    }, []);

    const fetchAllEnquiries = useCallback(async (domain, staffId) => {
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
            if (staffId && staffId !== 'All') params.append('assignedTo', staffId);

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

    const refreshDashboardData = useCallback(async (manualTrigger = false) => {
        if (!hasInitialLoaded || manualTrigger) {
            if (!hasInitialLoaded) setIsLoading(true);
            else setIsRefreshing(true);
        }
        const domain = (isSuperAdmin || hasMultipleDomains) ? appliedGlobalFilter : user.domain;

        try {
            const dashboardTimeframe = appliedTrendRange === 'day'
                ? (appliedTrendHistoryDate === istToday ? 'today' : 'history')
                : appliedTrendRange;

            const statsParams = new URLSearchParams({
                domain: domain,
                userId: appliedStaffId,
                timeframe: dashboardTimeframe,
                date: appliedTrendHistoryDate,
                startDate: appliedTrendStartDate,
                endDate: appliedTrendEndDate
            });

            const statsRes = await fetch(`${API_BASE_URL_PORTAL}/api/dashboard/stats-bulk?${statsParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const statsData = await statsRes.json();

            setStats({
                totalEnquiry: statsData.totals.enquiry,
                totalFollowup: statsData.totals.followup,
                totalEnrolled: statsData.totals.enrolled,
                totalPending: statsData.totals.pending,
                totalInvalid: statsData.totals.invalid,
                todayEnquiry: statsData.periods.enquiry,
                todayFollowup: statsData.periods.followup,
                todayEnrolled: statsData.periods.enrolled,
                todayPending: statsData.periods.pending,
                todayInvalid: statsData.periods.invalid,
            });

            const listParams = new URLSearchParams({
                filterType: 'today',
                domain: domain,
                timeframe: dashboardTimeframe,
                date: appliedTrendHistoryDate,
                startDate: appliedTrendStartDate,
                endDate: appliedTrendEndDate
            });
            if (appliedStaffId && appliedStaffId !== 'All') listParams.append('userId', appliedStaffId);

            const listRes = await fetch(`${API_BASE_URL_PORTAL}/api/dashboard/leads-filter?${listParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const listData = await listRes.json();
            setTodayLeads(Array.isArray(listData) ? listData : []);

            const statusParams = new URLSearchParams({
                filterType: 'updated',
                domain: domain,
                timeframe: dashboardTimeframe,
                date: appliedTrendHistoryDate,
                startDate: appliedTrendStartDate,
                endDate: appliedTrendEndDate
            });
            if (appliedStaffId && appliedStaffId !== 'All') statusParams.append('userId', appliedStaffId);

            const statusRes = await fetch(`${API_BASE_URL_PORTAL}/api/dashboard/leads-filter?${statusParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const statusData = await statusRes.json();
            setStatusLeads(Array.isArray(statusData) ? statusData : []);
        } catch (err) {
            console.error("Dashboard refresh error:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setHasInitialLoaded(true);
        }
    }, [appliedGlobalFilter, fetchAllEnquiries, isSuperAdmin, hasMultipleDomains, user.domain, appliedStaffId, appliedTrendRange, appliedTrendHistoryDate, appliedTrendStartDate, appliedTrendEndDate]);

    const fetchTrendData = useCallback(async () => {
        setIsTrendLoading(true);
        const domain = (isSuperAdmin || hasMultipleDomains) ? appliedGlobalFilter : user.domain;
        try {
            const tzOffset = new Date().getTimezoneOffset();
            let url = `${API_BASE_URL_PORTAL}/api/dashboard/enquiry-trends?range=${appliedTrendRange}&domain=${domain}&tzOffset=${tzOffset}`;
            if (appliedStaffId && appliedStaffId !== 'All') url += `&userId=${appliedStaffId}`;

            if (appliedTrendRange === 'custom') {
                url += `&startDate=${appliedTrendStartDate}&endDate=${appliedTrendEndDate}`;
            } else if (appliedTrendRange === 'day' && appliedTrendHistoryDate !== istToday) {
                // If it's the 'day' view but a different date is selected, treat as historical day
                url += `&date=${appliedTrendHistoryDate}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTrendData(data);
            }
        } catch (err) {
            console.error("Trend fetch error:", err);
        } finally {
            setIsTrendLoading(false);
        }
    }, [appliedTrendRange, appliedTrendStartDate, appliedTrendEndDate, appliedTrendHistoryDate, appliedGlobalFilter, isSuperAdmin, user.domain, appliedStaffId]);

    useEffect(() => {
        fetchTrendData();
    }, [fetchTrendData]);

    const handleApplyFilters = () => {
        setAppliedTrendRange(trendRange);
        setAppliedTrendHistoryDate(trendHistoryDate);
        setAppliedTrendStartDate(trendStartDate);
        setAppliedTrendEndDate(trendEndDate);
        setAppliedStaffId(selectedStaffId);
        setAppliedGlobalFilter(globalFilter);
    };

    const isFilterDirty =
        trendRange !== appliedTrendRange ||
        trendHistoryDate !== appliedTrendHistoryDate ||
        trendStartDate !== appliedTrendStartDate ||
        trendEndDate !== appliedTrendEndDate ||
        selectedStaffId !== appliedStaffId ||
        globalFilter !== appliedGlobalFilter;

    useEffect(() => {
        // Auto-fetch if NOT in custom range
        if (trendRange !== 'custom') {
            handleApplyFilters();
        }
    }, [trendRange, trendHistoryDate, selectedStaffId, globalFilter]);

    useEffect(() => {
        refreshDashboardData(false);
    }, [refreshDashboardData, appliedGlobalFilter, appliedStaffId, appliedTrendRange, appliedTrendHistoryDate, appliedTrendStartDate, appliedTrendEndDate]);

    useEffect(() => {
        const timer = setInterval(() => {
            refreshDashboardData(false);
        }, AUTO_REFRESH_MS);
        return () => clearInterval(timer);
    }, [refreshDashboardData]);

    if (isLoading) {
        return <LoadingScreen message="Loading dashboard data..." fullPage={false} />;
    }

    const StatCard = ({ title, value, icon, color, onClick, small }) => (
        <div
            onClick={onClick}
            className={`${color} rounded-2xl p-4 shadow-sm border border-white/10 hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden`}
        >
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">{title}</p>
                    <h3 className={`${small ? 'text-lg' : 'text-3xl'} font-black text-white tracking-tighter`}>{value}</h3>
                </div>
                <div className={`p-2 bg-white/20 rounded-lg text-white`}>
                    {icon}
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                {icon}
            </div>
        </div>
    );

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
            <header className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Control</h1>
                        <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">{user.name} • {user.role} • {user.domain}</p>
                    </div>

                    <div className="flex flex-nowrap items-center gap-3">
                        {/* Show Staff Filter for Admins and Super Admins, or if Staff list is explicitly populated (e.g. for team views) */}
                        {!isStaffUser && (
                            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                                <Users size={14} className="text-blue-500" />
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    className="bg-transparent font-black text-[10px] outline-none uppercase tracking-wider min-w-[120px] cursor-pointer"
                                >
                                    <option value="All">All Staff</option>
                                    {allStaff.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {(isSuperAdmin || hasMultipleDomains) && (
                            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                                <Filter size={14} className="text-slate-400" />
                                <select
                                    value={globalFilter}
                                    onChange={(e) => {
                                        const selected = e.target.value;
                                        setGlobalFilter(selected);
                                        setAppliedGlobalFilter(selected);
                                    }}
                                    className="bg-transparent font-bold text-xs outline-none"
                                >
                                    {isSuperAdmin && <option value="All">All Domains</option>}
                                    {!isSuperAdmin && domains.length > 1 && <option value="All">Assigned Domains</option>}
                                    {domains.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}

                        <div
                            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all cursor-pointer group"
                            onClick={() => refreshDashboardData(true)}
                        >
                            <RefreshCcw size={14} className={`text-white ${(isRefreshing || isTrendLoading) ? 'animate-spin' : 'group-hover:rotate-180 transition-all duration-500'}`} />
                            {isRefreshing && <span className="text-[10px] text-white font-black uppercase animate-pulse">Syncing...</span>}
                        </div>
                    </div>
                </div>

                {/* --- GLOBAL TIMEFRAME CONTROLS --- */}
                <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['day', 'week', 'month', 'year', 'custom'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setTrendRange(r)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${trendRange === r
                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                        <Calendar size={14} className="text-blue-500" />
                        <input
                            type="date"
                            value={trendHistoryDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                setTrendHistoryDate(e.target.value);
                                setTrendRange('day');
                            }}
                            className="bg-transparent font-black text-[10px] outline-none uppercase tracking-wider cursor-pointer text-slate-600"
                        />
                    </div>

                    {trendRange === 'custom' && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase">From</span>
                                <input
                                    type="date"
                                    value={trendStartDate}
                                    onChange={(e) => setTrendStartDate(e.target.value)}
                                    className="text-[10px] font-bold text-slate-600 outline-none border-none bg-transparent w-28"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase">To</span>
                                <input
                                    type="date"
                                    value={trendEndDate}
                                    onChange={(e) => setTrendEndDate(e.target.value)}
                                    className="text-[10px] font-bold text-slate-600 outline-none border-none bg-transparent w-28"
                                />
                            </div>
                            <div className="ml-auto flex items-center gap-4">
                                {trendRange === 'custom' && isFilterDirty && (
                                    <button
                                        onClick={handleApplyFilters}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 flex items-center gap-2"
                                    >
                                        <Filter size={12} /> Apply Search
                                    </button>
                                )}

                            </div>
                        </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Showing: <span className="text-blue-600">
                            {appliedTrendRange === 'day' ? `Selected Date (${appliedTrendHistoryDate})` :
                                appliedTrendRange === 'custom' ? `${appliedTrendStartDate} to ${appliedTrendEndDate}` :
                                    `Current ${appliedTrendRange}`}
                        </span>
                    </p>

                </div>
            </header>


            {/* Stat Cards Grid */}
            <div className="space-y-6">
                {/* Header for Stat Cards Section */}
                <div
                    className="flex items-center justify-between group cursor-pointer"
                    onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <BarChart3 size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                            {isStatsExpanded ? "Overview Summary" : "Expand Summary stats"}
                        </h4>
                    </div>
                    <div className="bg-white border border-slate-200 p-1 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm">
                        {isStatsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                </div>

                {isStatsExpanded && (
                    <div className={`space-y-6 animate-in fade-in zoom-in-95 duration-300 ${isRefreshing ? 'opacity-60 pointer-events-none' : ''}`}>
                        {/* Tier 1: Life-time Totals (Large) */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <StatCard title="Total Enquiry" value={stats.totalEnquiry} icon={<Users size={24} />} color="bg-gradient-to-br from-rose-700 to-rose-500" onClick={() => handleCardClick('totalEnquiry')} />
                            <StatCard title="Total Confirmed Leads" value={stats.totalFollowup} icon={<PhoneCall size={24} />} color="bg-gradient-to-br from-orange-600 to-amber-500" onClick={() => handleCardClick('totalFollowup')} />
                            <StatCard title="Total Enrolled" value={stats.totalEnrolled} icon={<GraduationCap size={24} />} color="bg-gradient-to-br from-emerald-700 to-emerald-500" onClick={() => handleCardClick('totalEnrolled')} />
                            <StatCard title="Total Pendings" value={stats.totalPending} icon={<AlertCircle size={24} />} color="bg-gradient-to-br from-slate-800 to-slate-600" onClick={() => handleCardClick('totalPending')} />
                            <StatCard title="Total Invalid" value={stats.totalInvalid} icon={<XCircle size={24} />} color="bg-gradient-to-br from-red-700 to-red-500" onClick={() => handleCardClick('totalInvalid')} />
                        </div>

                        {/* Tier 2: Period Snapshot (Large) */}
                        <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                            <TrendingUp size={16} className="text-blue-500" />
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Period Performance ({trendRange})</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <MiniStatCard
                                title="Enquiries"
                                value={stats.todayEnquiry}
                                color="text-red-600"
                                bgColor="bg-red-100"
                                onClick={() => handleCardClick('totalEnquiry', true)}
                            />
                            <MiniStatCard
                                title="Confirmed Leads"
                                value={stats.todayFollowup}
                                color="text-orange-600"
                                bgColor="bg-orange-100"
                                onClick={() => handleCardClick('totalFollowup', true)}
                            />
                            <MiniStatCard
                                title="Enrolled"
                                value={stats.todayEnrolled}
                                color="text-emerald-600"
                                bgColor="bg-emerald-100"
                                onClick={() => handleCardClick('totalEnrolled', true)}
                            />
                            <MiniStatCard
                                title="Pendings"
                                value={stats.todayPending}
                                color="text-slate-700"
                                bgColor="bg-slate-200"
                                onClick={() => handleCardClick('totalPending', true)}
                            />
                            <MiniStatCard
                                title="Invalid"
                                value={stats.todayInvalid}
                                color="text-rose-700"
                                bgColor="bg-rose-100"
                                onClick={() => handleCardClick('totalInvalid', true)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Trends Graph Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full">
                        <div
                            className="flex items-center gap-2 group cursor-pointer"
                            onClick={() => setIsGraphExpanded(!isGraphExpanded)}
                        >
                            <BarChart3 size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase group-hover:text-blue-600 transition-colors">Performance Chart</h3>
                            <div className="ml-2 text-red-600 group-hover:text-blue-400 transition-colors">
                                {isGraphExpanded ? <ChevronUp size={25} /> : <ChevronDown size={25} />}
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 hidden sm:block">Visualization of {trendRange} trends</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                        <Filter size={12} className="text-slate-400" />
                        <select
                            value={trendStatus}
                            onChange={(e) => setTrendStatus(e.target.value)}
                            className="bg-transparent font-black text-[10px] outline-none uppercase tracking-wider"
                        >
                            <option value="All">All Stats</option>
                            <option value="total">Total Enquiries</option>
                            <option value="followup">Confirmed Leads</option>
                            <option value="enrolled">Enrolled</option>
                        </select>
                    </div>
                </div>

                {isGraphExpanded && (
                    <div className={`h-[350px] w-full pt-4 animate-in fade-in slide-in-from-top-4 duration-500 ${isRefreshing ? 'opacity-60 pointer-events-none' : ''}`}>
                        {isTrendLoading ? (
                            <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <div className="flex flex-col items-center gap-2">
                                    <RefreshCcw size={20} className="text-blue-200 animate-spin" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updating graph...</span>
                                </div>
                            </div>
                        ) : trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350} minWidth={0} debounce={1}>
                                <AreaChart data={trendRange === 'day' ? trendData.filter(d => parseInt(d.label) >= 9 && parseInt(d.label) <= 18) : trendData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorFollow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                                        dy={10}
                                        tickFormatter={(val) => {
                                            if (trendRange === 'day') {
                                                const h = parseInt(val);
                                                const start = h % 12 || 12;
                                                const nh = (h + 1) % 24;
                                                const end = nh % 12 || 12;
                                                return `${start}-${end}`;
                                            }
                                            if (trendRange === 'year') {
                                                const [y, m] = val.split('-');
                                                return new Date(y, m - 1).toLocaleString('default', { month: 'short' });
                                            }
                                            return val;
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontSize: '10px', fontWeight: 900, marginBottom: '8px', color: '#1e293b', textTransform: 'uppercase' }}
                                        itemStyle={{ fontSize: '11px', fontWeight: 700, padding: '2px 0' }}
                                        labelFormatter={(val) => {
                                            if (trendRange === 'day') {
                                                const h = parseInt(val);
                                                const start = h % 12 || 12;
                                                const nh = (h + 1) % 24;
                                                const end = nh % 12 || 12;
                                                const ampm = h >= 12 ? 'PM' : 'AM';
                                                return `${start}-${end} ${ampm}`;
                                            }
                                            return val;
                                        }}
                                    />
                                    {(trendStatus === 'All' || trendStatus === 'total') && (
                                        <Area
                                            name="Total Enquiries"
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                            animationDuration={1500}
                                        />
                                    )}
                                    {(trendStatus === 'All' || trendStatus === 'followup') && (
                                        <Area
                                            name="Confirmed Leads"
                                            type="monotone"
                                            dataKey="followup"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorFollow)"
                                            strokeDasharray="5 5"
                                            animationDuration={1500}
                                        />
                                    )}
                                    {(trendStatus === 'All' || trendStatus === 'enrolled') && (
                                        <Area
                                            name="Enrolled"
                                            type="monotone"
                                            dataKey="enrolled"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorEnrolled)"
                                            animationDuration={1500}
                                        />
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-6">
                                    Not enough data to generate trends for the selected domain/range
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content Lists Section Header */}
            <div className="space-y-6">
                <div
                    className="flex items-center justify-between group cursor-pointer"
                    onClick={() => setIsTablesExpanded(!isTablesExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <Users size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                            {isTablesExpanded ? "Enquiry Tables" : "Expand Enquiry Tables"}
                        </h4>
                    </div>
                    <div className="bg-white border border-slate-200 p-1 rounded-lg text-slate-400 group-hover:text-red-600 group-hover:border-red-200 transition-all shadow-sm">
                        {isTablesExpanded ? <ChevronUp size={25} /> : <ChevronDown size={25} />}
                    </div>
                </div>

                {isTablesExpanded && (
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isRefreshing ? 'opacity-60 pointer-events-none' : ''}`}>
                        <LeadList
                            title={trendHistoryDate === istToday ? "Today's Enquiry" : `Enquiry on ${trendHistoryDate}`}
                            data={todayLeads} icon={<Calendar className="text-red-600" />} color="bg-red-50" badgeColor="bg-red-600"
                            currentPage={todayPage} setCurrentPage={setTodayPage} pageSize={todayLimit} setPageSize={setTodayLimit} userTier={getTier(user)}
                            showRemarks={true}
                            onLeadClick={handleLeadClick}
                            onRefresh={() => refreshDashboardData(false)}
                        />
                        <LeadList
                            title={trendHistoryDate === istToday ? "Today's Enquiry Status" : `Status Update on ${trendHistoryDate}`}
                            data={statusLeads} icon={<AlertCircle className="text-red-600" />} color="bg-red-50" badgeColor="bg-red-600"
                            currentPage={statusPage} setCurrentPage={setStatusPage} pageSize={statusLimit} setPageSize={setStatusLimit} userTier={getTier(user)}
                            showRemarks={true}
                            onLeadClick={handleLeadClick}
                            onRefresh={() => refreshDashboardData(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components
const LeadList = ({ title, data, icon, color, badgeColor, currentPage, setCurrentPage, pageSize, setPageSize, userTier, showRemarks = false, onLeadClick, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllRows, setShowAllRows] = useState(false);

    const safeData = Array.isArray(data) ? data : [];
    const q = searchTerm.trim().toLowerCase();
    const filteredData = safeData.filter((lead) => {
        const searchable = [
            lead?.student_name,
            lead?.email,
            lead?.phone,
            lead?.lead_code,
            lead?.status,
            lead?.domain,
            lead?.assigned_to_name,
            lead?.assigned_by_name
        ]
            .map(v => String(v || "").toLowerCase())
            .join(" ");

        return searchable.includes(q);
    });

    const [sortBy, setSortBy] = useState('student_name');
    const [sortOrder, setSortOrder] = useState('asc');

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            if (sortBy === 'created_at') {
                aVal = new Date(aVal || 0);
                bVal = new Date(bVal || 0);
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortBy, sortOrder]);

    const totalPages = Math.max(Math.ceil(sortedData.length / pageSize), 1);
    const paginatedData = showAllRows
        ? sortedData
        : sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const enableVerticalScroll =
        (showAllRows && sortedData.length > 10) ||
        (!showAllRows && pageSize > 10 && paginatedData.length > 10);

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
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                </div>
            </div>

            {/* Table Body */}
            <div
                className={`flex-grow min-h-[350px] ${enableVerticalScroll ? 'max-h-[350px] overflow-y-auto' : ''}`}
            >
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10">
                            <SortHeader label="Student" sortKey="student_name" sortBy={sortBy} sortOrder={sortOrder} setSortBy={setSortBy} setSortOrder={setSortOrder} />
                            <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                            <SortHeader label="Status" sortKey="status" sortBy={sortBy} sortOrder={sortOrder} setSortBy={setSortBy} setSortOrder={setSortOrder} className="text-center" />
                            {showRemarks && (
                                <SortHeader label="Remarks" sortKey="remarks" sortBy={sortBy} sortOrder={sortOrder} setSortBy={setSortBy} setSortOrder={setSortOrder} />
                            )}
                            <th className="py-3 px-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned</th>
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
                                    <p className="font-bold text-slate-800 text-sm whitespace-normal break-words">{lead.student_name}</p>
                                    <p className="text-[8px] text-red-600 font-bold uppercase leading-tight mt-0.5 whitespace-normal break-words">{lead.domain}</p>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase leading-none mt-1">{lead.lead_code || `#${lead.id}`}</p>
                                </td>

                                {/* Email & Phone Cell */}
                                <td className="py-3 px-4">

                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="text-[11px] font-medium whitespace-normal break-all">{lead.email || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-700">
                                            <span className="text-[11px] font-bold">{lead.phone}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Status Cell */}
                                <td className="py-2 px-3 text-center">
                                    <span className="text-[10px] font-black px-2 py-1 rounded uppercase bg-slate-100 text-slate-600 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                        {lead.status}
                                    </span>
                                </td>
                                {showRemarks && (
                                    <td className="py-2 px-3">
                                        <p className="text-[11.5px] text-slate-600 font-medium whitespace-normal break-words min-w-[100px] leading-tight">
                                            {lead.remarks || '-'}
                                        </p>
                                    </td>
                                )}

                                {/* Assignment Cell */}
                                <td className="py-2 px-3 text-right">
                                    <p className="text-[9.5px] text-slate-400 font-bold uppercase leading-tight">
                                        {userTier === 'STAFF' ? 'From' : 'To'}
                                    </p>
                                    <p className="text-[11px] text-slate-600 font-black whitespace-normal break-words ml-auto max-w-[100px] leading-tight">
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

const SortHeader = ({ label, sortKey, sortBy, sortOrder, setSortBy, setSortOrder, className = "" }) => {
    const isActive = sortBy === sortKey;
    return (
        <th
            className={`py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors ${className}`}
            onClick={() => {
                if (isActive) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                    setSortBy(sortKey);
                    setSortOrder('desc');
                }
            }}
        >
            <div className={`flex items-center gap-1.5 ${className.includes('center') ? 'justify-center' : className.includes('right') ? 'justify-end' : 'justify-start'}`}>
                {label}
                <div className="flex flex-col -gap-1">
                    <ChevronUp size={10} className={isActive && sortOrder === 'asc' ? "text-blue-600" : "text-slate-300"} />
                    <ChevronDown size={10} className={isActive && sortOrder === 'desc' ? "text-blue-600" : "text-slate-300"} />
                </div>
            </div>
        </th>
    );
};

export default Dashboard;
