import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    RefreshCcw, History, Mail, Phone, Calendar,
    UserCheck, Search, Filter, X,
    Edit, Eye, Trash2,
    Delete,
    DeleteIcon,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import Pagination from '../Layout/Pagination';
import LoadingScreen from '../Layout/LoadingScreen';
import { confirmToast } from '../../../utils/toastConfirm';
import { exportToExcel } from '../../../utils/exportExcel';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';
import { RiDeleteBack2Fill, RiDeleteBin4Fill } from 'react-icons/ri';
import { BiExport } from 'react-icons/bi';
const DomainPage = ({ domain, user }) => {
    const getTier = (u) => {
        if (u?.tier) return u.tier;
        const r = u?.role || '';
        if (['Main Admin', 'MD', 'GM', 'Super Admin'].includes(r)) return 'SUPER_ADMIN';
        if (['TL', 'Coordinator', 'Head', 'Admin'].includes(r)) return 'ADMIN';
        return 'STAFF';
    };
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
    const isSuperAdmin = getTier(user) === 'SUPER_ADMIN';
    const isAdminTier = getTier(user) === 'ADMIN' || isSuperAdmin;
    const isStaffTier = getTier(user) === 'STAFF';
    const location = useLocation();
    const navigate = useNavigate();
    const hasFocusedLeadRef = useRef(false);
    const requestSeqRef = useRef(0);
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
    const [selectedLeadIds, setSelectedLeadIds] = useState([]);
    const [bulkAssignStaff, setBulkAssignStaff] = useState("");
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [interestFilter, setInterestFilter] = useState('All');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust
    const fetchDomainData = useCallback(async (page = 1, limit = pageSize, options = {}) => {
        const { silent = false } = options;
        const requestId = ++requestSeqRef.current;
        if (!silent) setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const getUserDomains = (domainStr) => {
                if (!domainStr) return [];
                return domainStr.split(',').map(d => d.trim()).filter(Boolean);
            };
            const userDomainsList = getUserDomains(user?.domain);
            // Normalize a domain name for comparison (lowercase, strip "Bluestone " prefix)
            // NEW: normalized full-name comparison (case-insensitive, alias-aware)
            const normalizeName = (n = '') => n.toLowerCase().replace(/^bluestone /, '');
            const hasAccess = isSuperAdmin || userDomainsList.some(d =>
                normalizeName(d) === normalizeName(domain) // "overseas" === "overseas" ✅
            );

            const finalDomain = hasAccess
                ? domain
                : (userDomainsList.length > 0 ? userDomainsList[0] : user.domain);
            const isWaitingView = viewMode === 'waiting';
            const isPaymentView = viewMode === 'payment';
            if (isWaitingView || isPaymentView) {
                const params = new URLSearchParams({
                    page: '1',
                    limit: '5000'
                });
                if (categoryFilter !== 'All') params.set('category', categoryFilter);
                if (interestFilter !== 'All') params.set('interest', interestFilter);
                if (searchTerm.trim()) params.set('search', searchTerm.trim());
                const url = `${API_BASE_URL_PORTAL}/api/leads/domain/${encodeURIComponent(finalDomain)}?${params.toString()}`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.status === 403) {
                    console.error("Access denied");
                    return;
                }
                const result = await res.json();
                if (!res.ok) return;
                let rows = Array.isArray(result.leads) ? result.leads : [];
                rows = rows.filter((lead) => {
                    const st = String(lead.status || '').trim().toLowerCase();
                    const ps = String(lead.payment_status || '').trim().toLowerCase();
                    if (isWaitingView) {
                        const knownNonWaiting = ['new', 'follow up', 'enrolled', 'closed'];
                        return st.includes('waiting') || !knownNonWaiting.includes(st);
                    }
                    if (isPaymentView) {
                        return ps === 'paid' || ps === 'partially paid';
                    }
                    return true;
                });

                // Client-side sorting for waiting/payment views
                rows.sort((a, b) => {
                    let aVal = a[sortBy === 'student_name' ? 'student_name' : sortBy];
                    let bVal = b[sortBy === 'student_name' ? 'student_name' : sortBy];

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

                const total = rows.length;
                const safeLimit = Math.max(Number(limit) || 10, 1);
                const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
                const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
                const start = (safePage - 1) * safeLimit;
                const pagedRows = rows.slice(start, start + safeLimit);
                if (requestId !== requestSeqRef.current) return;
                setData({
                    leads: pagedRows,
                    totalPages,
                    page: safePage,
                    total
                });
                return;
            }
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortBy,
                sortOrder
            });
            if (categoryFilter !== 'All') params.set('category', categoryFilter);
            if (interestFilter !== 'All') params.set('interest', interestFilter);
            if (statusFilter !== 'All') {
                params.set('status', statusFilter);
            }
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
                if (requestId !== requestSeqRef.current) return;
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
            if (requestId === requestSeqRef.current) setLoading(false);
        }
    }, [user, domain, pageSize, categoryFilter, interestFilter, statusFilter, searchTerm, viewMode, sortBy, sortOrder]);
    useEffect(() => {
        if (isSuperAdmin) return; // Super admin can access any domain
        const getUserDomains = (domainStr) => {
            if (!domainStr) return [];
            return domainStr.split(',').map(d => d.trim()).filter(Boolean);
        };
        const userDomainsList = getUserDomains(user?.domain);
        if (userDomainsList.length === 0) return;
        // `domain` prop is a full name like "Bluestone Overseas"
        // Compare using normalized names (lowercase, strip "Bluestone " prefix)
        const normalizeName = (n = '') => String(n).toLowerCase().replace(/^bluestone\s+/, '');
        const hasAccess = userDomainsList.some(d => normalizeName(d) === normalizeName(domain));
        if (!hasAccess) {
            // Redirect to the user's first assigned domain
            const fallback = userDomainsList[0];
            const fallbackSlug = getSlug(fallback);
            navigate(`/portal/domain/${fallbackSlug}`, { replace: true });
        }
    }, [domain, user, navigate, isSuperAdmin]);
    const fetchUsers = useCallback(async () => {
        if (!isAdminTier) return;
        try {
            const domainParam = encodeURIComponent(domain || '');
            const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

            const [staffRes, tlRes] = await Promise.all([
                fetch(`${API_BASE_URL_PORTAL}/api/staff-list?domain=${domainParam}`, { headers }),
                fetch(`${API_BASE_URL_PORTAL}/api/tl-list?domain=${domainParam}`, { headers })
            ]);

            let combined = [];
            if (staffRes.ok) {
                const staff = await staffRes.json();
                combined = [...combined, ...staff];
            }
            if (tlRes.ok) {
                const tls = await tlRes.json();
                combined = [...combined, ...tls];
            }

            // Filter out self and ensure unique IDs
            const unique = Array.from(new Map(combined.map(u => [u.id, u])).values())
                .filter(u => u.id !== user.id);

            setStaffList(unique);
        } catch (err) {
            console.error(err);
        }
    }, [isAdminTier, domain, user.id]);
    useEffect(() => {
        fetchDomainData();
        fetchUsers();
    }, [fetchDomainData, fetchUsers]);
    useEffect(() => {
        const timer = setInterval(() => {
            fetchDomainData(data.page || 1, pageSize, { silent: true });
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
        return deleteLeadById(id);
    };

    const deleteLeadById = async (id, options = {}) => {
        const { skipConfirm = false, suppressRefresh = false, suppressToast = false } = options;
        if (!skipConfirm) {
            const confirmed = await confirmToast("Delete this lead?", "Delete");
            if (!confirmed) return false;
        }
        const tid = suppressToast ? null : toast.loading("Deleting lead...");
        try {
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                if (!suppressToast) toast.success("Lead deleted successfully", { id: tid });
                if (!suppressRefresh) fetchDomainData(data.page);
                return true;
            } else {
                const error = await res.json();
                if (!suppressToast) toast.error(error.message || "Delete failed", { id: tid });
                return false;
            }
        } catch (err) {
            console.error("Delete Error:", err);
            if (!suppressToast) toast.error("Delete failed", { id: tid });
            return false;
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

        const normalizedView = (viewQ || 'all').toLowerCase();
        setViewMode(normalizedView === 'pending' ? 'waiting' : normalizedView);

        // If view is 'all' (All Enquiries) and no explicit status is provided, default to 'New'
        if ((!viewQ || normalizedView === 'all') && !statusQ) {
            setStatusFilter('New');
        } else {
            setStatusFilter(statusQ || 'All');
        }

        setPendingOnly(pendingQ === '1');
        setTodayOnly(todayQ === '1');
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
    const updateStatus = async (leadId, newStatus, customSuccessMessage = null, leadName = '') => {
        const confirmed = await confirmToast(
            `Move ${leadName ? `"${leadName}" ` : ''}to ${newStatus}?`,
            "Move"
        );
        if (!confirmed) {
            fetchDomainData(data.page);
            return false;
        }
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
                toast.success(customSuccessMessage || `Status updated to ${newStatus}`);
                fetchDomainData(data.page);
                return true;
            } else {
                toast.error("Failed to update status");
                return false;
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
            return false;
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
        const normalizedStatusFilter = String(statusFilter || 'All').trim().toLowerCase();
        const matchesStatus =
            normalizedStatusFilter === 'all' || leadStatus === normalizedStatusFilter;
        const matchesCategory =
            categoryFilter === 'All' || lead.category === categoryFilter;
        const matchesInterest =
            interestFilter === 'All' || lead.interested_in === interestFilter;
        const hasAssignedStaff = Boolean(lead.assigned_to || lead.assigned_to_name);
        const isPendingLead = !hasAssignedStaff;
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
            if (viewMode === 'all') return leadStatus === 'new';
            if (viewMode === 'lead-status') return leadStatus === 'follow up' || leadStatus === 'enrolled';
            if (viewMode === 'waiting') {
                const knownNonWaiting = ['new', 'follow up', 'enrolled', 'closed'];
                return leadStatus.includes('waiting') || !knownNonWaiting.includes(leadStatus);
            }
            if (viewMode === 'invalid') return leadStatus === 'closed';
            if (viewMode === 'payment') {
                return leadPayment === 'paid' || leadPayment === 'partially paid';
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

    const visibleLeadIds = useMemo(() => filteredLeads.map((lead) => lead.id), [filteredLeads]);
    const visibleLeadIdSet = useMemo(() => new Set(visibleLeadIds), [visibleLeadIds]);
    const selectedLeadSet = useMemo(() => new Set(selectedLeadIds), [selectedLeadIds]);
    const allVisibleSelected =
        visibleLeadIds.length > 0 && visibleLeadIds.every((id) => selectedLeadSet.has(id));

    useEffect(() => {
        setSelectedLeadIds((prev) => {
            const next = prev.filter((id) => visibleLeadIdSet.has(id));
            if (next.length === prev.length && next.every((v, i) => v === prev[i])) {
                return prev;
            }
            return next;
        });
    }, [visibleLeadIdSet]);

    const toggleSelectLead = (id) => {
        setSelectedLeadIds((prev) => (
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        ));
    };

    const toggleSelectAllVisible = () => {
        if (allVisibleSelected) {
            setSelectedLeadIds((prev) => prev.filter((id) => !selectedLeadSet.has(id)));
            return;
        }
        setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...visibleLeadIds])));
    };

    const bulkDeleteLeads = async () => {
        if (selectedLeadIds.length === 0) return;
        const confirmed = await confirmToast(
            `Delete ${selectedLeadIds.length} lead(s)?`,
            "Delete"
        );
        if (!confirmed) return;
        const tid = toast.loading(`Deleting ${selectedLeadIds.length} lead(s)...`);
        const results = await Promise.all(
            selectedLeadIds.map((id) =>
                deleteLeadById(id, { skipConfirm: true, suppressRefresh: true, suppressToast: true })
            )
        );
        const failed = results.filter((ok) => !ok).length;
        if (failed > 0) {
            toast.error(`${failed} lead(s) failed to delete`, { id: tid });
        } else {
            toast.success("Selected leads deleted", { id: tid });
        }
        setSelectedLeadIds([]);
        fetchDomainData(data.page, pageSize);
    };

    const bulkAssignLeads = async () => {
        if (selectedLeadIds.length === 0) return;
        if (!bulkAssignStaff) {
            toast.error("Please select a staff member");
            return;
        }

        const selectedStaff = staffList.find(s => s.id.toString() === bulkAssignStaff) ||
            (bulkAssignStaff === user.id.toString() ? { id: user.id, name: user.name } : null);

        const confirmed = await confirmToast(
            `Assign ${selectedLeadIds.length} lead(s) to ${selectedStaff?.name || "selected staff"}?`,
            "Assign"
        );
        if (!confirmed) return;

        const tid = toast.loading(`Assigning ${selectedLeadIds.length} lead(s)...`);
        try {
            const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/bulk-assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    leadIds: selectedLeadIds,
                    staffId: bulkAssignStaff,
                    staffName: selectedStaff?.name
                })
            });

            if (res.ok) {
                toast.success(`${selectedLeadIds.length} leads assigned`, { id: tid });
                setSelectedLeadIds([]);
                setBulkAssignStaff("");
                fetchDomainData(data.page, pageSize);
            } else {
                const error = await res.json().catch(() => ({}));
                toast.error(error.msg || "Bulk assignment failed", { id: tid });
            }
        } catch {
            toast.error("Bulk assignment failed", { id: tid });
        }
    };

    const exportLeadsExcel = async () => {
        const confirmed = await confirmToast("Export current table to Excel?", "Export");
        if (!confirmed) return;
        const assignedHeader = isStaffTier ? "Assigned By" : "Assigned To";
        const columns = [
            { header: "Lead ID", accessor: (l) => l.id },
            { header: "Lead Code", accessor: (l) => l.lead_code || "" },
            { header: "Candidate", accessor: (l) => l.student_name || "" },
            { header: "Email", accessor: (l) => l.email || "" },
            { header: "Phone", accessor: (l) => l.phone || "" },
            { header: "Category", accessor: (l) => l.category || "" },
            { header: "Interest", accessor: (l) => l.interested_in || "" },
            { header: assignedHeader, accessor: (l) => (isStaffTier ? l.assigned_by_name : l.assigned_to_name) || "" },
            { header: "Date", accessor: (l) => (l.created_at ? new Date(l.created_at).toLocaleDateString("en-GB") : "") },
            { header: "Status", accessor: (l) => l.status || "" },
        ];
        await exportToExcel("domain-leads.xlsx", columns, filteredLeads);
    };
    if (loading && data.leads.length === 0) {
        return <LoadingScreen message={`Loading ${domain} leads...`} fullPage={false} />;
    }

    const viewTitleMap = {
        all: 'All Enquiries',
        'lead-status': 'All Leads Status',
        waiting: 'Waiting for Confirmation',
        payment: 'All Payment Status',
        invalid: 'All Invalid Enquiries',
    };
    const activeViewTitle = viewTitleMap[viewMode] || viewTitleMap.all;

    const SortHeader = ({ label, sortKey, className = "" }) => {
        const isActive = sortBy === sortKey;
        return (
            <th
                className={`p-4 border-r border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors ${className}`}
                onClick={() => {
                    if (isActive) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                        setSortBy(sortKey);
                        setSortOrder('desc');
                    }
                    fetchDomainData(1);
                }}
            >
                <div className="flex items-center gap-1.5">
                    {label}
                    <div className="flex flex-col -gap-1">
                        <ChevronUp size={10} className={isActive && sortOrder === 'asc' ? "text-blue-600" : "text-slate-300"} />
                        <ChevronDown size={10} className={isActive && sortOrder === 'desc' ? "text-blue-600" : "text-slate-300"} />
                    </div>
                </div>
            </th>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="font-black text-red-600 uppercase tracking-tighter text-xl leading-none">{domain}</h2>
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
                            <option value="Waiting for Confirmation">Waiting for Confirmation</option>
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
                        type="button"
                        onClick={bulkDeleteLeads}
                        disabled={selectedLeadIds.length === 0}
                        className="px-1.5 py-1.5 rounded-lg text-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        title="Delete selected leads"
                    >
                        <RiDeleteBin4Fill />
                    </button>

                    {selectedLeadIds.length > 0 && !isStaffTier && (
                        <div className="flex items-center gap-1 bg-blue-50 p-1 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-left-2 duration-200">
                            <select
                                value={bulkAssignStaff}
                                onChange={(e) => setBulkAssignStaff(e.target.value)}
                                className="text-[10px] font-bold bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:ring-2 ring-blue-500/20 w-32"
                            >
                                <option value="">Assign To...</option>
                                <option value={user.id}>{user.name} (Self)</option>
                                {staffList.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={bulkAssignLeads}
                                disabled={!bulkAssignStaff}
                                className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1"
                            >
                                Assign
                            </button>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={exportLeadsExcel}
                        className="p-1.5 rounded-lg text-lg font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        title="Export Excel"
                    >
                        <BiExport />
                    </button>
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
                                <th className="p-4 border-r border-slate-100">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={toggleSelectAllVisible}
                                        aria-label="Select all leads"
                                    />
                                </th>
                                <SortHeader label="Candidate" sortKey="student_name" />
                                <SortHeader label="Phone" sortKey="phone" />
                                <SortHeader label="Category" sortKey="category" />
                                <SortHeader label="Interest" sortKey="interested_in" />
                                <th className="p-4 border-r border-slate-100">
                                    {isStaffTier ? 'Assigned By' : 'Assigned To'}
                                </th>
                                <SortHeader label="Date" sortKey="created_at" />
                                <SortHeader label="Status" sortKey="status" />
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeads.map(lead => (
                                <tr
                                    id={`lead-row-${lead.id}`}
                                    key={lead.id}
                                    className={`hover:bg-blue-50/30 transition-colors whitespace-nowrap ${focusLeadId === lead.id ? 'bg-blue-50/50 ring-1 ring-blue-200' : ''
                                        }`}
                                >
                                    <td className="p-4 border-r border-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeadSet.has(lead.id)}
                                            onChange={() => toggleSelectLead(lead.id)}
                                            aria-label={`Select lead ${lead.student_name}`}
                                        />
                                    </td>
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
                                                <div className={`w-1.5 h-1.5 rounded-full ${lead.assigned_by === user.id ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                                                <span className="text-xs font-bold text-slate-700">
                                                    {lead.assigned_by === user.id ? 'Self' : (lead.assigned_by_name || "System")}
                                                </span>
                                            </div>
                                        ) : (
                                            <select
                                                className="text-[11px] font-bold bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:ring-2 ring-blue-500/20"
                                                value={lead.assigned_to || ""}
                                                onChange={(e) => {
                                                    const selectedStaff = e.target.value === user.id.toString()
                                                        ? { id: user.id, name: user.name }
                                                        : staffList.find(s => s.id.toString() === e.target.value);
                                                    assignLead(lead.id, e.target.value, selectedStaff?.name);
                                                }}
                                            >
                                                <option value="">Select Staff</option>
                                                <option value={user.id}>{user.name} (Self)</option>
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
                                            onChange={(e) => updateStatus(lead.id, e.target.value, null, lead.student_name)}
                                            className={`text-[10px] font-black uppercase px-2 py-1 rounded border border-transparent outline-none cursor-pointer ${getStatusStyle(lead.status)}`}
                                        >
                                            <option value="New">New</option>
                                            <option value="Follow Up">Follow Up</option>
                                            <option value="Waiting for Confirmation">Waiting for Confirmation</option>
                                            <option value="Enrolled">Enrolled</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/portal/domain/${location.pathname.split('/').pop()}/lead/${lead.id}`)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => fetchLeadHistory(lead.id, lead.student_name)}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                                                title="View History"
                                            >
                                                <History size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEditLead(lead)}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                                                title="Edit Lead"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteLead(lead.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                                title="Delete Lead"
                                            >
                                                <Trash2 size={16} />
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
                            <button onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase">Student Name</label>
                                <input
                                    className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 ring-blue-500/20"
                                    value={selectedLead.student_name}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, student_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Email</label>
                                    <input
                                        className="w-full p-2 border rounded-lg text-sm"
                                        value={selectedLead.email}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Phone</label>
                                    <input
                                        className="w-full p-2 border rounded-lg text-sm"
                                        value={selectedLead.phone}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, phone: e.target.value })}
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
                                        onChange={(e) => setSelectedLead({ ...selectedLead, interested_in: e.target.value })}
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
                                    onChange={(e) => setSelectedLead({ ...selectedLead, remarks: e.target.value })}
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
        case 'Waiting for Confirmation': return 'bg-amber-100 text-amber-700';
        case 'Enrolled': return 'bg-green-100 text-green-700';
        case 'Closed': return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};
export default DomainPage;
