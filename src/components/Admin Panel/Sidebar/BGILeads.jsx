import React, { useEffect, useMemo, useState, useRef } from "react";
import { formatToLocalDateTime } from '../../../utils/timeUtils';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, RefreshCcw, History, Edit, X, Eye, Trash2, DeleteIcon, ChevronUp, ChevronDown } from "lucide-react";
import Pagination from "../Layout/Pagination";
import LoadingScreen from "../Layout/LoadingScreen";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";
import { confirmToast } from "../../../utils/toastConfirm";
import { exportToExcel } from "../../../utils/exportExcel";
import { RiDeleteBin4Fill } from "react-icons/ri";
import { FaFileExcel } from "react-icons/fa6";
import { BiExport } from "react-icons/bi";

const viewConfig = {
  "all-enquiry": { apiView: "all", title: "All Enquiries", forcedStatus: "New" },
  "lead-status": { apiView: "all", title: "All Confirmed Leads Status", forcedStatus: "Follow Up" },
  "waiting-confirmation": { apiView: "all", title: "Waiting for Confirmation", forcedStatus: "Waiting for Confirmation" },
  pendings: { apiView: "all", title: "Waiting for Confirmation", forcedStatus: "Waiting for Confirmation" },
  "payment-status": { apiView: "payment", title: "All Enrolled Status" },
  "dropped-leads": { apiView: "all", title: "All Dropped Leads", forcedStatus: "Dropped" },
  "invalid-enquiries": { apiView: "invalid", title: "All Invalid Enquiries", forcedStatus: "Invalid" },
};

const BGILeads = ({ user }) => {
  const getTier = (u) => {
    if (u?.tier) return u.tier;
    const r = u?.role || '';
    if (["Main Admin", "MD", "GM", "Super Admin"].includes(r)) return "SUPER_ADMIN";
    if (["TL", "Coordinator", "Head", "Admin"].includes(r)) return "ADMIN";
    return "STAFF";
  };
  const isStaffTier = getTier(user) === "STAFF";

  const { view = "all-enquiry" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [data, setData] = useState({ leads: [], total: 0, page: 1, totalPages: 1 });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [remarksHistory, setRemarksHistory] = useState([]);
  const [historyCandidate, setHistoryCandidate] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkAssignStaff, setBulkAssignStaff] = useState("");
  const hasFocusedLeadRef = useRef(false);

  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [status, setStatus] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [assignedTo, setAssignedTo] = useState("All");
  const [todayOnly, setTodayOnly] = useState(false);
  const [drillDate, setDrillDate] = useState(null);
  const [drillStartDate, setDrillStartDate] = useState(null);
  const [drillEndDate, setDrillEndDate] = useState(null);
  const invalidReason = "All";
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust

  const getDomainSlug = (name = "") => {
    const mapping = {
      "IAS Academy": "ias",
      Techpark: "techpark",
      Overseas: "overseas",
      Placements: "placements",
      "Language Hub": "languages",
      "Elite Sports": "sports",
      Preschool: "preschool",
      Startup: "startup",
    };
    return mapping[name] || name.toLowerCase().replace(/\s+/g, "-");
  };

  const goToLeadDetails = (lead) => {
    const slug = getDomainSlug(lead.domain || "");
    navigate(`/portal/domain/${slug}/lead/${lead.id}`);
  };

  const resolvedView = useMemo(() => viewConfig[view] || viewConfig["all-enquiry"], [view]);

  useEffect(() => {
    if (!viewConfig[view]) navigate("/portal/bgi/all-enquiry", { replace: true });
  }, [view, navigate]);

  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const statusQ = qp.get("status");
    const domainQ = qp.get("domain");
    const todayQ = qp.get("today");
    const staffQ = qp.get("assignedTo");
    const dateQ = qp.get("date");
    const startQ = qp.get("startDate");
    const endQ = qp.get("endDate");

    // Reset filters to defaults when query params are absent.
    setStatus(statusQ || "All");
    setDomain(domainQ || "All");
    setTodayOnly(todayQ === "1");
    setAssignedTo(staffQ || "All");
    setDrillDate(dateQ);
    setDrillStartDate(startQ);
    setDrillEndDate(endQ);

    if (resolvedView.apiView === "pending") setPaymentStatus("All");
  }, [location.search, resolvedView.apiView]);

  useEffect(() => {
    // Keep pending page size numeric; boolean here breaks pagination math.
    setPageSize(resolvedView.apiView === "pending" ? 20 : 10);
  }, [resolvedView.apiView]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/full-structure`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const json = await res.json();
          const allDomains = Array.isArray(json) ? json : [];

          const tier = getTier(user);
          const isSuperAdmin = tier === 'SUPER_ADMIN';
          const isAdminTier = tier === "ADMIN" || isSuperAdmin;
          const userDomainsList = (user?.domain || '').split(',').map(d => d.trim().toLowerCase()).filter(Boolean);

          let filteredMaster = allDomains;
          if (!isSuperAdmin) {
            filteredMaster = allDomains.filter(d =>
              userDomainsList.includes(d.name.toLowerCase())
            );
          }

          setDomains(filteredMaster.map((d) => d.name));
          setMasterData(filteredMaster);

          // If admin has specific domains, default to 'All' to aggregate,
          // or pick first one if they specifically want a single view.
          // The search/filter logic handles 'All' by showing everything in masterData/domains list.
        }
      } catch {
        setDomains([]);
        setMasterData([]);
      }
    };
    fetchDomains();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const domainParam = domain && domain !== 'All'
          ? `?domain=${encodeURIComponent(domain)}`
          : '';
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

        const [staffRes, tlRes] = await Promise.all([
          fetch(`${API_BASE_URL_PORTAL}/api/staff-list${domainParam}`, { headers }),
          fetch(`${API_BASE_URL_PORTAL}/api/tl-list${domainParam}`, { headers })
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
      } catch {
        setStaffList([]);
      }
    };
    fetchUsers();
  }, [domain, user.id]); // re-fetch whenever the domain filter changes

  const fetchLeads = async (page = 1, limit = pageSize) => {
    setLoading(true);
    try {
      const isWaitingView = resolvedView.forcedStatus === "Waiting for Confirmation";
      if (isWaitingView) {
        const params = new URLSearchParams();
        params.set("view", "all");
        params.set("page", "1");
        params.set("limit", "5000");
        params.set("search", "");
        params.set("domain", domain);
        params.set("status", "All");
        params.set("payment_status", "All");
        params.set("invalid_reason", invalidReason);
        params.set("assigned_to", assignedTo);
        params.set("sort_by", sortBy);
        params.set("sort_order", sortOrder);

        if (todayOnly) params.set("today", "1");
        if (drillDate) params.set("date", drillDate);
        if (drillStartDate) params.set("startDate", drillStartDate);
        if (drillEndDate) params.set("endDate", drillEndDate);

        const allRes = await fetch(`${API_BASE_URL_PORTAL}/api/bgi/leads?${params.toString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!allRes.ok) {
          setData({ leads: [], total: 0, page: 1, totalPages: 1 });
          return;
        }

        const allJson = await allRes.json();
        let rows = allJson.leads || [];

        // Filtering for Waiting Status is done on the client as it's a derived state
        rows = rows.filter((lead) => {
          const st = String(lead.status || "").trim().toLowerCase();
          const knownNonWaiting = ["new", "follow up", "enrolled", "invalid", "dropped"];
          return st.includes("waiting") || !knownNonWaiting.includes(st);
        });

        const q = String(search || "").trim().toLowerCase();
        if (q) {
          rows = rows.filter((lead) => {
            const name = String(lead.student_name || "").toLowerCase();
            const email = String(lead.email || "").toLowerCase();
            const phone = String(lead.phone || "");
            const leadCode = String(lead.lead_code || "").toLowerCase();
            const id = String(lead.id || "");
            const leadDomain = String(lead.domain || "").toLowerCase();
            return (
              name.includes(q) ||
              email.includes(q) ||
              phone.includes(q) ||
              leadCode.includes(q) ||
              id.includes(q) ||
              leadDomain.includes(q)
            );
          });
        }

        const toComparable = (lead, key) => {
          if (key === "created_at") return new Date(lead.created_at || 0).getTime();
          if (key === "total_fees" || key === "paid_amount") return Number(lead[key] || 0);
          return String(lead[key] || "").toLowerCase();
        };
        rows = [...rows].sort((a, b) => {
          const av = toComparable(a, sortBy);
          const bv = toComparable(b, sortBy);
          if (av < bv) return sortOrder === "asc" ? -1 : 1;
          if (av > bv) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });

        const total = rows.length;
        const safeLimit = Math.max(Number(limit) || 10, 1);
        const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
        const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
        const start = (safePage - 1) * safeLimit;
        const pagedRows = rows.slice(start, start + safeLimit);

        setData({
          leads: pagedRows,
          total,
          page: safePage,
          totalPages,
        });
        return;
      }

      if (resolvedView.apiView === "pending") {
        const params = new URLSearchParams();
        params.set("view", "all");
        params.set("page", "1");
        params.set("limit", "5000");
        params.set("search", "");
        params.set("domain", domain);
        params.set("status", "All");
        params.set("payment_status", "All");
        params.set("invalid_reason", invalidReason);
        params.set("assigned_to", assignedTo);
        params.set("sort_by", sortBy);
        params.set("sort_order", sortOrder);

        if (todayOnly) params.set("today", "1");
        if (drillDate) params.set("date", drillDate);
        if (drillStartDate) params.set("startDate", drillStartDate);
        if (drillEndDate) params.set("endDate", drillEndDate);

        const allRes = await fetch(`${API_BASE_URL_PORTAL}/api/bgi/leads?${params.toString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!allRes.ok) {
          setData({ leads: [], total: 0, page: 1, totalPages: 1 });
          return;
        }

        const allJson = await allRes.json();
        const allRows = allJson.leads || [];

        // Pending = all enquiries except Follow Up, Enrolled, and Closed.
        let rows = allRows.filter((lead) => {
          const st = String(lead.status || "").trim().toLowerCase();
          return st !== "follow up" && st !== "enrolled" && st !== "invalid" && st !== "dropped";
        });
        const q = String(search || "").trim().toLowerCase();
        if (q) {
          rows = rows.filter((lead) => {
            const name = String(lead.student_name || "").toLowerCase();
            const email = String(lead.email || "").toLowerCase();
            const phone = String(lead.phone || "");
            const leadCode = String(lead.lead_code || "").toLowerCase();
            const id = String(lead.id || "");
            const leadDomain = String(lead.domain || "").toLowerCase();
            return (
              name.includes(q) ||
              email.includes(q) ||
              phone.includes(q) ||
              leadCode.includes(q) ||
              id.includes(q) ||
              leadDomain.includes(q)
            );
          });
        }

        const toComparable = (lead, key) => {
          if (key === "created_at") return new Date(lead.created_at || 0).getTime();
          if (key === "total_fees" || key === "paid_amount") return Number(lead[key] || 0);
          return String(lead[key] || "").toLowerCase();
        };
        rows = [...rows].sort((a, b) => {
          const av = toComparable(a, sortBy);
          const bv = toComparable(b, sortBy);
          if (av < bv) return sortOrder === "asc" ? -1 : 1;
          if (av > bv) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });

        const total = rows.length;
        const safeLimit = Math.max(Number(limit) || 10, 1);
        const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
        const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
        const start = (safePage - 1) * safeLimit;
        const pagedRows = rows.slice(start, start + safeLimit);

        setData({
          leads: pagedRows,
          total,
          page: safePage,
          totalPages,
        });
        return;
      }

      const effectivePaymentStatus =
        resolvedView.apiView === "payment" && paymentStatus === "Pending payment" ? "All" : paymentStatus;
      const effectiveStatus = resolvedView.forcedStatus || status;

      const params = new URLSearchParams();
      params.set("view", resolvedView.apiView);
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("search", search || "");
      params.set("domain", domain || "All");
      params.set("status", effectiveStatus || "All");
      params.set("payment_status", effectivePaymentStatus || "All");
      params.set("invalid_reason", invalidReason || "All");
      params.set("assigned_to", assignedTo || "All");
      params.set("source", resolvedView.source || "All");
      params.set("sort_by", sortBy);
      params.set("sort_order", sortOrder);

      if (todayOnly) params.set("today", "1");
      if (drillDate) params.set("date", drillDate);
      if (drillStartDate) params.set("startDate", drillStartDate);
      if (drillEndDate) params.set("endDate", drillEndDate);

      const res = await fetch(`${API_BASE_URL_PORTAL}/api/bgi/leads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        setData({ leads: [], total: 0, page: 1, totalPages: 1 });
        return;
      }
      const json = await res.json();
      setData({
        leads: json.leads || [],
        total: json.total || 0,
        page: json.page || page,
        totalPages: json.totalPages || 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (leadId, newStatus, leadName = "") => {
    const confirmed = await confirmToast(
      `Move ${leadName ? `"${leadName}" ` : ""}to ${newStatus}?`,
      "Move"
    );
    if (!confirmed) return;

    const tid = toast.loading("Updating status...");
    try {
      if (newStatus === "Enrolled") {
        const lead = data.leads.find(l => l.id === leadId);
        const ps = (lead?.payment_status || "").toLowerCase();
        if (ps === "pending payment" || ps === "") {
          toast.error("Update payment status", { id: tid });
          return;
        }
      }

      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      if (!res.ok) {
        toast.error("Failed to update status", { id: tid });
        return;
      }
      toast.success(`Moved to ${newStatus}`, { id: tid });
      fetchLeads(data.page || 1, pageSize);
    } catch {
      toast.error("Failed to update status", { id: tid });
    }
  };

  const assignLead = async (leadId, staffId, staffName) => {
    const tid = toast.loading("Assigning lead...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ leadId, staffId, staffName }),
      });
      if (!res.ok) {
        toast.error("Assignment failed", { id: tid });
        return;
      }
      toast.success(`Assigned to ${staffName || "staff"}`, { id: tid });
      fetchLeads(data.page || 1, pageSize);
    } catch {
      toast.error("Assignment failed", { id: tid });
    }
  };

  const bulkAssignLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!bulkAssignStaff) {
      toast.error("Please select a staff member");
      return;
    }

    const selectedStaff = staffList.find((s) => s.id.toString() === bulkAssignStaff) ||
      (bulkAssignStaff === user.id.toString() ? { id: user.id, name: user.name } : null);

    const confirmed = await confirmToast(
      `Assign ${selectedLeadIds.length} lead(s) to ${selectedStaff?.name || "selected staff"}?`,
      "Assign"
    );
    if (!confirmed) return;

    const tid = toast.loading(`Assigning ${selectedLeadIds.length} lead(s)...`);
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/bulk-assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          staffId: bulkAssignStaff,
          staffName: selectedStaff?.name,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.msg || "Bulk assignment failed", { id: tid });
        return;
      }

      toast.success(`${selectedLeadIds.length} leads assigned`, { id: tid });
      setSelectedLeadIds([]);
      setBulkAssignStaff("");
      fetchLeads(data.page || 1, pageSize);
    } catch {
      toast.error("Bulk assignment failed", { id: tid });
    }
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
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (!suppressToast) toast.error(err.message || err.msg || "Delete failed", { id: tid });
        return false;
      }
      if (!suppressToast) toast.success("Lead deleted successfully", { id: tid });
      if (!suppressRefresh) fetchLeads(data.page || 1, pageSize);
      return true;
    } catch {
      if (!suppressToast) toast.error("Delete failed", { id: tid });
      return false;
    }
  };

  const fetchLeadHistory = async (leadId, candidateName) => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/history/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        setRemarksHistory([]);
        toast.error(`History API error (${res.status})`);
        return;
      }
      setRemarksHistory(await res.json());
      setHistoryCandidate(candidateName);
      setShowHistoryModal(true);
    } catch {
      toast.error("Failed to load history");
    }
  };

  const handleEditLead = (lead) => {
    setSelectedLead({ ...lead });
    setIsEditModalOpen(true);
  };

  const saveLeadEdit = async () => {
    if (!selectedLead?.id) return;
    const tid = toast.loading("Saving lead changes...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(selectedLead),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || err.msg || "Failed to update lead details", { id: tid });
        return;
      }

      toast.success("Lead updated", { id: tid });
      setIsEditModalOpen(false);
      fetchLeads(data.page || 1, pageSize);
    } catch {
      toast.error("Failed to update lead details", { id: tid });
    }
  };

  useEffect(() => {
    fetchLeads(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedView.apiView, pageSize, assignedTo, domain, status, paymentStatus, todayOnly, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchLeads(data.page || 1, pageSize);
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.page, pageSize, resolvedView.apiView]);

  useEffect(() => {
    const flid = location.state?.focusLeadId;
    if (!flid || hasFocusedLeadRef.current || data.leads.length === 0) return;

    const match = data.leads.find((l) => Number(l.id) === Number(flid));
    if (match) {
      hasFocusedLeadRef.current = true;
      setTimeout(() => {
        const el = document.getElementById(`lead-row-${flid}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [data.leads, location.state?.focusLeadId]);

  const visibleLeadIds = useMemo(() => data.leads.map((lead) => lead.id), [data.leads]);
  const selectedLeadSet = useMemo(() => new Set(selectedLeadIds), [selectedLeadIds]);
  const allVisibleSelected =
    visibleLeadIds.length > 0 && visibleLeadIds.every((id) => selectedLeadSet.has(id));

  useEffect(() => {
    setSelectedLeadIds((prev) => prev.filter((id) => visibleLeadIds.includes(id)));
  }, [visibleLeadIds]);

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
    fetchLeads(data.page || 1, pageSize);
  };

  const exportLeadsExcel = async () => {
    const confirmed = await confirmToast("Export current table to Excel?", "Export");
    if (!confirmed) return;
    const columns = [
      { header: "Lead ID", accessor: (l) => l.id },
      { header: "Lead Code", accessor: (l) => l.lead_code || "" },
      { header: "Candidate", accessor: (l) => l.student_name || "" },
      { header: "Email", accessor: (l) => l.email || "" },
      { header: "Phone", accessor: (l) => l.phone || "" },
      { header: "Domain", accessor: (l) => l.domain || "" },
      { header: "Category", accessor: (l) => l.category || "" },
      { header: "Interest", accessor: (l) => l.interested_in || "" },
      { header: "Assigned To", accessor: (l) => l.assigned_to_name || l.assigned_to || "" },
      { header: "Date", accessor: (l) => (l.created_at ? new Date(l.created_at).toLocaleDateString("en-GB") : "") },
      { header: "Status", accessor: (l) => l.status || "" },
    ];
    await exportToExcel("bgi-leads.xlsx", columns, data.leads);
  };

  const SortHeader = ({ label, sortKey, className = "" }) => {
    const isActive = sortBy === sortKey;
    return (
      <th
        className={`px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors ${className}`}
        onClick={() => {
          if (isActive) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          } else {
            setSortBy(sortKey);
            setSortOrder("desc");
          }
          fetchLeads(1, pageSize);
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

  if (loading && data.leads.length === 0) {
    return <LoadingScreen message="Loading BGI leads..." fullPage={false} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black text-slate-800 leading-none">{resolvedView.title}</h2>
        <p className="text-[10px] mt-1 font-bold uppercase tracking-widest text-slate-400">
          Bluestone Group of Institutions - All Domains
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 ring-blue-500/20"
          />
        </div>
        <select value={domain} onChange={(e) => setDomain(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-3 py-2">
          <option value="All">{['Main Admin', 'MD', 'GM', 'Super Admin'].includes(user?.role) || user?.tier === 'SUPER_ADMIN' ? 'All Domains' : 'All Assigned Domains'}</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-3 py-2">
          <option value="All">{resolvedView.apiView === "payment" ? "All Enrolled" : "All Payment"}</option>
          <option value="Advance payment">Advance payment</option>
          <option value="Partial Payment">Partial Payment</option>
          <option value="Full payment">Full payment</option>
          <option value="No Fee">No Fee</option>
          <option value="Pending payment">Pending payment</option>
        </select>

        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white"
        >
          <option value="All">All Assigned To</option>
          <option value={user?.id}>{user?.name} (Self)</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-3 py-2">
          <option value="created_at">Sort: Date</option>
          <option value="student_name">Sort: Name</option>
          <option value="domain">Sort: Domain</option>
          <option value="status">Sort: Status</option>
          <option value="payment_status">Sort: Payment</option>
          <option value="total_fees">Sort: Fees</option>
          <option value="paid_amount">Sort: Paid Amount</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-3 py-2">
          <option value="desc">Order: Desc</option>
          <option value="asc">Order: Asc</option>
        </select>
        <button
          type="button"
          onClick={() => fetchLeads(1, pageSize)}
          className="bg-blue-600 text-white rounded-lg text-sm px-3 py-2 font-bold hover:bg-blue-700"
        >
          Search
        </button>
        {/* <button
          type="button"
          onClick={() => {
            setSearch("");
            setDomain("All");
            setStatus("All");
            setPaymentStatus("All");
            setSortBy("created_at");
            setSortOrder("desc");
            setTodayOnly(false);
            fetchLeads(1, pageSize);
          }}
          className="bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm px-3 py-2 font-bold hover:bg-red-100"
        >
          Reset
        </button> */}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLeads(data.page || 1, pageSize)}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Refresh Table"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {data.total}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={bulkDeleteLeads}
              disabled={selectedLeadIds.length === 0}
              className="px-1.5 py-1.5 rounded-lg text-lg font-bold uppercase bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
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
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-200 rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`${data.leads.length > 10 ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="p-2.5 border-r border-slate-100">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all leads"
                  />
                </th>
                <SortHeader label="Candidate" sortKey="student_name" className="border-r border-slate-100 !p-2.5 text-[10px]" />
                <th className="p-2.5 border-r border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone</th>
                <SortHeader label="Domain" sortKey="domain" className="border-r border-slate-100 !p-2.5 text-[10px]" />
                <th className="p-2.5 border-r border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">Category</th>
                <th className="p-2.5 border-r border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">Interest</th>
                <th className="p-2.5 border-r border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">Remarks</th>
                <th className="p-2.5 border-r border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">{isStaffTier ? 'Assigned By' : 'Assigned To'}</th>
                <SortHeader label="Date & Time" sortKey="created_at" className="border-r border-slate-100 !p-2.5 text-[10px]" />
                <SortHeader label="Status" sortKey="status" className="border-r border-slate-100 !p-2.5 text-[10px]" />
                <th className="p-2.5 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.leads.length > 0 ? data.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="p-2.5 border-r border-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedLeadSet.has(lead.id)}
                      onChange={() => toggleSelectLead(lead.id)}
                      aria-label={`Select lead ${lead.student_name}`}
                    />
                  </td>
                  <td className="p-2.5 border-r border-slate-50">
                    <p className="font-bold text-slate-800 text-[12px] whitespace-normal break-words leading-tight">{lead.student_name}</p>
                    <p className="text-[10px] text-slate-400 whitespace-normal break-words mt-0.5">{lead.lead_code || `#${lead.id}`} - {lead.domain}</p>
                  </td>
                  <td className="p-2.5 text-[11px] font-medium text-slate-600 border-r border-slate-50 whitespace-normal">{lead.phone}</td>
                  <td className="p-2.5 text-[11px] font-medium text-slate-600 border-r border-slate-50 whitespace-normal break-words leading-tight">{lead.domain}</td>
                  <td className="p-2.5 text-[11px] font-bold text-slate-700 border-r border-slate-50 whitespace-normal break-words leading-tight">{lead.category || "-"}</td>
                  <td className="p-2.5 text-[11px] font-bold text-blue-700 border-r border-slate-50 whitespace-normal break-words leading-tight">{lead.interested_in || "-"}</td>
                  <td 
                    className="p-2.5 border-r border-slate-50 min-w-[150px] cursor-pointer"
                  >
                    <p className="text-[11px] text-slate-600 whitespace-normal break-words leading-tight line-clamp-2 hover:text-blue-600 transition-colors" title={lead.latest_remark_subject || lead.remarks}>
                      {lead.latest_remark_subject || lead.remarks || "-"}
                    </p>
                  </td>
                  <td className="p-2.5 border-r border-slate-50">
                    {isStaffTier ? (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${lead.assigned_by === user.id ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                        <span className="text-[11px] font-bold text-slate-700 leading-tight">
                          {lead.assigned_by === user.id ? 'Self' : (lead.assigned_by_name || "System")}
                        </span>
                      </div>
                    ) : (
                      <select
                        className="text-[11px] font-bold bg-white border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:ring-2 ring-blue-500/20 w-fit"
                        value={lead.assigned_to || ""}
                        onChange={(e) => {
                          const selectedStaff = e.target.value === user.id.toString()
                            ? { id: user.id, name: user.name }
                            : staffList.find((s) => s.id.toString() === e.target.value);
                          assignLead(lead.id, e.target.value, selectedStaff?.name);
                        }}
                      >
                        <option value="">Select Staff</option>
                        <option value={user.id}>{user.name} (Self)</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="p-2.5 text-[10px] font-bold text-slate-500 border-r border-slate-50 leading-tight">
                    {formatToLocalDateTime(lead.created_at)}
                  </td>
                  <td className="p-2.5 text-xs border-r border-slate-50">
                    <div className="flex flex-col gap-1.5">
                      <select
                        value={lead.status || "New"}
                        onChange={(e) => updateStatus(lead.id, e.target.value, lead.student_name)}
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-transparent outline-none cursor-pointer w-fit ${getStatusStyle(lead.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Follow Up">Confirmed Leads</option>
                        <option value="Waiting for Confirmation">Waiting for Confirmation</option>
                        <option value="Enrolled">Enrolled</option>
                        <option value="Dropped">Dropped</option>
                        <option value="Invalid">Invalid</option>
                      </select>
                      <p className="text-[10px] text-slate-500 whitespace-normal break-all leading-tight">{lead.email || "-"}</p>
                    </div>
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => goToLeadDetails(lead)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors border border-blue-100"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => fetchLeadHistory(lead.id, lead.student_name)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition-colors border border-indigo-100"
                        title="View History"
                      >
                        <History size={15} />
                      </button>
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors border border-emerald-100"
                        title="Edit Lead"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors border border-red-100"
                        title="Delete Lead"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          stats={{ currentPage: data.page, totalPages: data.totalPages }}
          onPageChange={(newPage) => fetchLeads(newPage, pageSize)}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => setPageSize(Number(newSize))}
        />
      </div>

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
                  value={selectedLead.student_name || ""}
                  onChange={(e) => setSelectedLead({ ...selectedLead, student_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Email</label>
                  <input
                    className="w-full p-2 border rounded-lg text-sm"
                    value={selectedLead.email || ""}
                    onChange={(e) => setSelectedLead({ ...selectedLead, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Phone</label>
                  <input
                    className="w-full p-2 border rounded-lg text-sm"
                    value={selectedLead.phone || ""}
                    onChange={(e) => setSelectedLead({ ...selectedLead, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Category</label>
                  <select
                    className="w-full p-2 border rounded-lg text-sm bg-white"
                    value={selectedLead.category || ""}
                    onChange={(e) => setSelectedLead({ ...selectedLead, category: e.target.value, interested_in: "" })}
                  >
                    <option value="">Select Category</option>
                    {(masterData.find(d => {
                      const dName = (d.name || "").toLowerCase();
                      const lDom = (selectedLead.domain || "").toLowerCase();
                      return dName === lDom || dName.includes(lDom) || lDom.includes(dName);
                    })?.categories || []).map(c => (
                      <option key={c.id} value={c.category_name}>{c.category_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Interested In</label>
                  <select
                    className="w-full p-2 border rounded-lg text-sm bg-white"
                    value={selectedLead.interested_in || ""}
                    onChange={(e) => setSelectedLead({ ...selectedLead, interested_in: e.target.value })}
                  >
                    <option value="">Select Interest</option>
                    {(masterData.find(d => {
                      const dName = (d.name || "").toLowerCase();
                      const lDom = (selectedLead.domain || "").toLowerCase();
                      return dName === lDom || dName.includes(lDom) || lDom.includes(dName);
                    })?.categories?.find(c => c.category_name === selectedLead.category)
                      ?.values || []).map(v => (
                        <option key={v.id} value={v.sub_value}>{v.sub_value}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Remarks</label>
                <input
                  className="w-full p-2 border rounded-lg text-sm"
                  value={selectedLead.remarks || ""}
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
                    <span className="text-blue-600">{h.action_type || "UPDATE"} by: {h.changed_by}</span>
                    <span>{new Date(h.changed_at).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{h.field_name || "details"}</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    <span className="text-slate-400">From:</span> {h.old_value || "-"}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    <span className="text-slate-400">To:</span> {h.new_value || "-"}
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

export default BGILeads;

const getStatusStyle = (status) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-700";
    case "Follow Up":
      return "bg-orange-100 text-orange-700 font-bold";
    case "Waiting for Confirmation":
      return "bg-amber-100 text-amber-700";
    case "Enrolled":
      return "bg-green-100 text-green-700";
    case "Dropped":
      return "bg-slate-200 text-slate-700";
    case "Invalid":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};
