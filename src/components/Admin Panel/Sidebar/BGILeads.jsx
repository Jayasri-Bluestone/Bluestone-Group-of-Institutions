import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Search, RefreshCcw } from "lucide-react";
import Pagination from "../Layout/Pagination";
import LoadingScreen from "../Layout/LoadingScreen";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";

const viewConfig = {
  "all-enquiry": { apiView: "all", title: "All Enquiry" },
  pendings: { apiView: "pending", title: "Pendings" },
  "payment-status": { apiView: "payment", title: "Payment Status" },
  "invalid-enquiries": { apiView: "invalid", title: "Invalid Enquiries" },
};

const BGILeads = () => {
  const { view = "all-enquiry" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState([]);
  const [data, setData] = useState({ leads: [], total: 0, page: 1, totalPages: 1 });

  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [status, setStatus] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [todayOnly, setTodayOnly] = useState(false);
  const invalidReason = "All";
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const AUTO_REFRESH_MS = 30000;

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

    // Reset filters to defaults when query params are absent.
    setStatus(statusQ || "All");
    setDomain(domainQ || "All");
    setTodayOnly(todayQ === "1");
    if (resolvedView.apiView === "pending") {
      setPaymentStatus("All");
    }
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
          setDomains(Array.isArray(json) ? json.map((d) => d.name) : []);
        }
      } catch {
        setDomains([]);
      }
    };
    fetchDomains();
  }, []);

  const fetchLeads = async (page = 1, limit = pageSize) => {
    setLoading(true);
    try {
      if (resolvedView.apiView === "pending") {
        const params = new URLSearchParams({
          view: "all",
          page: "1",
          limit: "5000",
          search: "",
          domain,
          status: "All",
          payment_status: "All",
          invalid_reason: invalidReason,
          sort_by: sortBy,
          sort_order: sortOrder,
        });
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
          return st !== "follow up" && st !== "enrolled" && st !== "closed";
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

        // Keep pending page aligned with dashboard pending card:
        // do not narrow by status/payment filters.
        if (todayOnly) {
          const now = new Date();
          rows = rows.filter((lead) => {
            const d = new Date(lead.created_at);
            return (
              d.getFullYear() === now.getFullYear() &&
              d.getMonth() === now.getMonth() &&
              d.getDate() === now.getDate()
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
        resolvedView.apiView === "payment" && paymentStatus === "Unpaid" ? "All" : paymentStatus;

      const params = new URLSearchParams({
        view: resolvedView.apiView,
        page: String(page),
        limit: String(limit),
        search,
        domain,
        status,
        payment_status: effectivePaymentStatus,
        invalid_reason: invalidReason,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const res = await fetch(`${API_BASE_URL_PORTAL}/api/bgi/leads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        setData({ leads: [], total: 0, page: 1, totalPages: 1 });
        return;
      }
      const json = await res.json();
      const incomingLeads = json.leads || [];
      const filteredLeads =
        resolvedView.apiView === "payment"
          ? incomingLeads.filter((lead) => {
              const ps = String(lead.payment_status || "").trim().toLowerCase();
              return ps === "paid" || ps === "partially paid";
            })
          : resolvedView.apiView === "invalid"
            ? incomingLeads.filter((lead) => String(lead.status || "").trim().toLowerCase() === "closed")
            : incomingLeads;

      const todayFilteredLeads = todayOnly
        ? filteredLeads.filter((lead) => {
            const d = new Date(lead.created_at);
            const now = new Date();
            return (
              d.getFullYear() === now.getFullYear() &&
              d.getMonth() === now.getMonth() &&
              d.getDate() === now.getDate()
            );
          })
        : filteredLeads;

      setData({
        leads: todayFilteredLeads,
        total: todayOnly
          ? todayFilteredLeads.length
          : resolvedView.apiView === "payment"
            ? filteredLeads.length
            : json.total || 0,
        page: json.page || page,
        totalPages: json.totalPages || 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedView.apiView, search, domain, status, paymentStatus, invalidReason, sortBy, sortOrder, pageSize]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchLeads(data.page || 1, pageSize);
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.page, pageSize, resolvedView.apiView, search, domain, status, paymentStatus, invalidReason, sortBy, sortOrder, todayOnly]);

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
          <option value="All">All Domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-3 py-2">
          <option value="All">All Status</option>
          <option value="New">New</option>
          <option value="Follow Up">Follow Up</option>
          <option value="Enrolled">Enrolled</option>
          <option value="Closed">Closed</option>
        </select>

        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="border border-slate-200 rounded-lg text-sm px-3 py-2">
          <option value="All">{resolvedView.apiView === "payment" ? "All (Paid + Partial)" : "All Payment"}</option>
          <option value="Paid">Paid</option>
          {resolvedView.apiView !== "payment" && <option value="Unpaid">Unpaid</option>}
          <option value="Partially Paid">Partially Paid</option>
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

        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="p-3">Candidate</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.leads.length > 0 ? data.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{lead.student_name}</p>
                    <p className="text-[10px] text-slate-400">{lead.lead_code || `#${lead.id}`}</p>
                  </td>
                  <td className="p-3 text-xs text-slate-600">
                    <div>{lead.email || "-"}</div>
                    <div className="font-bold">{lead.phone}</div>
                  </td>
                  <td className="p-3 text-xs font-bold text-blue-700">{lead.domain}</td>
                  <td className="p-3 text-xs">{lead.status}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => goToLeadDetails(lead)}
                      className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">No leads found.</td>
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
    </div>
  );
};

export default BGILeads;
