import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  UserPlus, Mail, Phone, Trash2, Edit, Save, X, ShieldCheck,
  Search, Loader2, History, RefreshCcw, ChevronDown, ChevronUp
} from "lucide-react";
import LoadingScreen from "../Layout/LoadingScreen";
import Pagination from "../Layout/Pagination";
import { confirmToast } from "../../../utils/toastConfirm";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";
import MultiDomainDropdown from "./MultiSelectDD";
import { exportToExcel } from "../../../utils/exportExcel";
import { RiDeleteBin4Fill } from "react-icons/ri";
import { BiExport } from "react-icons/bi";


const getUserTier = (u) => {
  if (u?.tier) return u.tier;
  const r = String(u?.role || "").trim();
  if (["Main Admin", "MD", "GM", "Super Admin"].includes(r)) return "SUPER_ADMIN";
  if (["TL", "Coordinator", "Head", "Admin"].includes(r)) return "ADMIN";
  return "STAFF";
};


const UserManagement = ({ user }) => {
  const [staff, setStaff] = useState([]);
  const [dynamicDomains, setDynamicDomains] = useState([]);
  const [roleHierarchy, setRoleHierarchy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemsPerPageValue, setItemsPerPageValue] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [editFormData, setEditFormData] = useState({});
  const editRowRef = useRef(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [historyUserName, setHistoryUserName] = useState("");
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    email: "",
    phone: "",
    domain: "",
    tier: "STAFF",
    role: "Staff",
    designation: "",
    password: "",
  });
  const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [staffRes, domainRes, hierarchyRes] = await Promise.all([
        fetch(`${API_BASE_URL_PORTAL}/api/staff-directory`, { headers }),
        fetch(`${API_BASE_URL_PORTAL}/api/master/domains`, { headers }),
        fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy`, { headers }),
      ]);
      if (staffRes.ok) setStaff(await staffRes.json());
      if (domainRes.ok) setDynamicDomains(await domainRes.json());
      if (hierarchyRes.ok) setRoleHierarchy(await hierarchyRes.json());
    } catch {
      toast.error("Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [fetchData]);
 
  // --- LOGIC: PERMISSIONS & DOMAIN FILTERING ---

  const hasDomainOverlap = useCallback((adminDomainStr, targetDomainStr) => {
    const adminTier = getUserTier(user);
    if (adminTier === 'SUPER_ADMIN') return true;
    
    const adStr = String(adminDomainStr || "").trim();
    if (!adStr) return false;
    if (adStr.toLowerCase() === 'all') return true;

    const tdStr = String(targetDomainStr || "").trim();
    // If staff has NO domain, show them to admins (unassigned staff)
    if (!tdStr) return true;
    // If staff has ALL domains, they are visible to any admin
    if (tdStr.toLowerCase() === 'all') return true;

    const adminDomains = adStr.split(',').map(d => d.trim().toLowerCase());
    const targetDomains = tdStr.split(',').map(d => d.trim().toLowerCase());

    return targetDomains.some(td => adminDomains.includes(td));
  }, [user, getUserTier]);

  const accessibleDomains = useMemo(() => {
    const adminTier = getUserTier(user);
    const adminDomain = String(user?.domain || "").trim();
    
    // Only SUPER_ADMIN gets all domains by default. 
    // ADMIN and STAFF only get domains assigned to them.
    if (adminTier === 'SUPER_ADMIN') {
      return dynamicDomains;
    }
    
    if (adminDomain.toLowerCase() === 'all') return dynamicDomains;
    const adminDomains = adminDomain.split(',').map(d => d.trim().toLowerCase());
    return dynamicDomains.filter(d => adminDomains.includes((d.name || "").toLowerCase()));
  }, [user, dynamicDomains, getUserTier]);

  // --- LOGIC: FILTERING ---
  const filteredStaff = staff.filter(u =>
    (
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.employee_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.domain || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (
      statusFilter === "all" ||
      (statusFilter === "active" && Number(u.is_active) === 1) ||
      (statusFilter === "inactive" && Number(u.is_active) === 0)
    ) &&
    (
      getUserTier(user) === 'SUPER_ADMIN' || 
      (getUserTier(u) === 'STAFF' && hasDomainOverlap(user?.domain, u.domain))
    )
  ).sort((a, b) => {
    const aVal = a[sortBy] || "";
    const bVal = b[sortBy] || "";

    if (typeof aVal === "string") {
      const aStr = aVal.toLowerCase();
      const bStr = bVal.toLowerCase();
      if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
      if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
    } else {
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  // --- LOGIC: PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filteredStaff || []).slice(indexOfFirstItem, indexOfLastItem);
  const enableTableScroll =
    (itemsPerPageValue === 'all' && filteredStaff.length > 10) ||
    (itemsPerPageValue !== 'all' && Number(itemsPerPageValue) > 10);

  const visibleUserIds = useMemo(() => currentItems.map((user) => user.id), [currentItems]);
  const selectedUserSet = useMemo(() => new Set(selectedUserIds), [selectedUserIds]);
  const allVisibleSelected =
    visibleUserIds.length > 0 && visibleUserIds.every((id) => selectedUserSet.has(id));

  useEffect(() => {
    setSelectedUserIds((prev) => {
      const next = prev.filter((id) => visibleUserIds.includes(id));
      if (next.length === prev.length && next.every((id, idx) => id === prev[idx])) {
        return prev;
      }
      return next;
    });
  }, [visibleUserIds]);

  const toggleSelectUser = (id) => {
    setSelectedUserIds((prev) => (
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    ));
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !selectedUserSet.has(id)));
      return;
    }
    setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleUserIds])));
  };

  const handleItemsPerPageChange = (value) => {
    if (value === 'all') {
      setItemsPerPageValue('all');
      setItemsPerPage(Math.max(filteredStaff.length, 1));
      setCurrentPage(1);
      return;
    }
    const numeric = Number(value);
    setItemsPerPageValue(numeric);
    setItemsPerPage(numeric);
    setCurrentPage(1);
  };

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (itemsPerPageValue === 'all') {
      setItemsPerPage(Math.max(filteredStaff.length, 1));
    }
  }, [filteredStaff.length, itemsPerPageValue]);
  useEffect(() => {
    if (!editingId) return;
    const node = editRowRef.current;
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [editingId]);

  // --- API HANDLERS (handleAddUser, handleDelete, handleSaveEdit remain same) ---
  const validate = (data, isNewUser = false) => {
    if (!data.employee_id || !String(data.employee_id).trim()) return "Employee ID is required";
    if (!data.name || data.name.length < 3) return "Name must be 3+ chars";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) return "Invalid email";
    if (!data.phone || !String(data.phone).trim()) return "Phone number is required";

    const tier = getUserTier(data);
    if (!tier) return "Tier is required";
    if (!data.role) return "Role is required";

    const isHighLevel = tier === "SUPER_ADMIN" || tier === "ADMIN";

    if (!isHighLevel && (!data.domain || !String(data.domain).trim())) return "At least one domain must be assigned";

    if (isNewUser && (!data.password || data.password.length < 6)) return "Password must be 6+ chars";
    return null;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const error = validate(formData, true);
    if (error) return toast.error(error);
    const confirmed = await confirmToast(`Create account for ${formData.name}?`, "Create");
    if (!confirmed) return;
    const adminTier = getUserTier(user);
    const targetTier = formData.tier;
    
    // Logic: 
    // - Only SUPER_ADMIN can create accounts with "All" domains.
    // - If a SUPER_ADMIN is creating another SUPER_ADMIN, give "All".
    // - If it's an ADMIN being created, they keep their selected domains unless the creator is a Super Admin who explicitly wants "All" (not implemented here, we stay safe).
    // Actually, per user request: "Super admin only can access all domain"
    const domainToSave = (targetTier === "SUPER_ADMIN") ? "All" : formData.domain;

    const submissionData = { ...formData, domain: domainToSave };
    const loadToast = toast.loading("Registering staff...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(submissionData),
      });
      if (res.ok) {
        toast.success("Account created!", { id: loadToast });
        setFormData({ employee_id: "", name: "", email: "", phone: "", domain: "", tier: "STAFF", role: "Staff", designation: "", password: "" });
        fetchData();
      } else {
        const errData = await res.json();
        toast.error(errData.msg || "Failed", { id: loadToast });
      }
    } catch { toast.error("Server error", { id: loadToast }); }
  };

  const handleDelete = async (id) => {
    return deleteUserById(id);
  };

  const deleteUserById = async (id, options = {}) => {
    const { skipConfirm = false, suppressRefresh = false, suppressToast = false } = options;
    if (!skipConfirm) {
      const confirmed = await confirmToast("Delete this staff account?", "Delete");
      if (!confirmed) return false;
    }

    const loadToast = suppressToast ? null : toast.loading("Deleting staff...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        if (!suppressToast) toast.success("Staff deleted successfully", { id: loadToast });
        if (!suppressRefresh) fetchData();
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        if (!suppressToast) toast.error(errData.msg || "Delete failed", { id: loadToast });
        return false;
      }
    } catch {
      if (!suppressToast) toast.error("Delete failed", { id: loadToast });
      return false;
    }
  };

  const bulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    const confirmed = await confirmToast(
      `Delete ${selectedUserIds.length} staff account(s)?`,
      "Delete"
    );
    if (!confirmed) return;
    const loadToast = toast.loading(`Deleting ${selectedUserIds.length} staff account(s)...`);
    const results = await Promise.all(
      selectedUserIds.map((id) =>
        deleteUserById(id, { skipConfirm: true, suppressRefresh: true, suppressToast: true })
      )
    );
    const failed = results.filter((ok) => !ok).length;
    if (failed > 0) {
      toast.error(`${failed} account(s) failed to delete`, { id: loadToast });
    } else {
      toast.success("Selected accounts deleted", { id: loadToast });
    }
    setSelectedUserIds([]);
    fetchData();
  };

  const exportUsersExcel = async () => {
    const confirmed = await confirmToast("Export current table to Excel?", "Export");
    if (!confirmed) return;
    const columns = [
      { header: "Employee ID", accessor: (u) => u.employee_id || "" },
      { header: "User Name", accessor: (u) => u.name || "" },
      { header: "Role", accessor: (u) => u.role || "" },
      { header: "Designation", accessor: (u) => u.designation || "" },
      { header: "Domains", accessor: (u) => u.domain || "" },
      { header: "Email", accessor: (u) => u.email || "" },
      { header: "Phone", accessor: (u) => u.phone || "" },
      { header: "Status", accessor: (u) => (Number(u.is_active) === 1 ? "Active" : "Inactive") },
    ];
    await exportToExcel("staff-directory.xlsx", columns, currentItems);
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = Number(user.is_active) === 1 ? 0 : 1;
    const nextStatusLabel = nextStatus === 1 ? "Active" : "Inactive";
    const confirmed = await confirmToast(
      `Set ${user.name} as ${nextStatusLabel}?`,
      "Confirm"
    );
    if (!confirmed) return;

    const actionLabel = nextStatus === 1 ? "Activating" : "Deactivating";
    const loadToast = toast.loading(`${actionLabel} user...`);
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/staff/${user.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ is_active: nextStatus }),
      });
      if (res.ok) {
        toast.success(`User ${nextStatus === 1 ? "activated" : "deactivated"}`, { id: loadToast });
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.msg || "Status update failed", { id: loadToast });
      }
    } catch {
      toast.error("Status update failed", { id: loadToast });
    }
  };

  const handleSaveEdit = async (id) => {
    const error = validate(editFormData);
    if (error) return toast.error(error);
    const confirmed = await confirmToast(`Update account for ${editFormData.name}?`, "Update");
    if (!confirmed) return;
    const loadToast = toast.loading("Updating staff...");
    const resolvedTier = getUserTier(editFormData);
    
    // Only SUPER_ADMIN should have "All" domains
    const domainToSave = (resolvedTier === "SUPER_ADMIN") ? "All" : editFormData.domain;

    const updateData = { 
      ...editFormData, 
      tier: resolvedTier,
      domain: domainToSave
    };

    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        toast.success("Staff updated", { id: loadToast });
        setEditingId(null);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.msg || "Update failed", { id: loadToast });
      }
    } catch {
      toast.error("Update failed", { id: loadToast });
    }
  };

  const fetchUserHistory = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/history/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        toast.error(`History API error (${res.status}). Restart backend and try again.`);
        setUserHistory([]);
        return;
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        toast.error("History API did not return JSON. Check backend route.");
        setUserHistory([]);
        return;
      }
      const rows = await res.json();
      setUserHistory(Array.isArray(rows) ? rows : []);
      setHistoryUserName(name);
      setShowHistoryModal(true);
    } catch {
      toast.error("Failed to load history");
    }
  };

  if (loading && staff.length === 0) {
    return <LoadingScreen message="Loading staff directory..." fullPage={false} />;
  }

  const activeHierarchy = roleHierarchy.filter((r) => Number(r.is_active) === 1);

  const SortHeader = ({ label, sortKey, className = "" }) => {
    const isActive = sortBy === sortKey;
    return (
      <th
        className={`p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors ${className}`}
        onClick={() => {
          if (isActive) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          } else {
            setSortBy(sortKey);
            setSortOrder("desc");
          }
        }}
      >
        <div className={`flex items-center gap-1.5 ${className.includes('center') ? 'justify-center' : className.includes('right') ? 'justify-end' : 'justify-start'}`}>
          {label}
          <div className="flex flex-col -gap-1">
            <ChevronUp size={10} className={isActive && sortOrder === "asc" ? "text-blue-600" : "text-slate-300"} />
            <ChevronDown size={10} className={isActive && sortOrder === "desc" ? "text-blue-600" : "text-slate-300"} />
          </div>
        </div>
      </th>
    );
  };

  return (

    <div className=" min-h-screen space-y-8">

      {/* STAFF ONBOARDING */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-800 uppercase flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            Staff Onboarding
          </h2>

          <span className="text-xs text-slate-400 font-semibold">
            Create new user accounts
          </span>
        </div>

        <form
          onSubmit={handleAddUser}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >

          {/* DOMAIN SELECT */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Assign Domains <span className="text-red-500">*</span>
            </label>

            <div className="py-2  rounded-xl bg-slate-50">

              {(formData.tier === "SUPER_ADMIN") ? (

                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 w-fit">
                  All Domains (Admin Access)
                </div>

              ) : (

                <MultiDomainDropdown
                  domains={accessibleDomains}
                  value={formData.domain}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      domain: val,
                    })
                  }
                />

              )}

            </div>
          </div>
          {/* NAME */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              className="p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter full name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* EMPLOYEE ID */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              className="p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Employee ID"
              required
              value={formData.employee_id}
              onChange={(e) =>
                setFormData({ ...formData, employee_id: e.target.value })
              }
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="name@company.com"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* TIER */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Tier <span className="text-red-500">*</span>
            </label>

            <select
              className="p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.tier}
              onChange={(e) => {
                const newTier = e.target.value;
                const firstRoleInTier = activeHierarchy.find(r => r.tier === newTier)?.role_name || 
                                       (newTier === "STAFF" ? "Staff" : (newTier === "ADMIN" ? "TL" : "Main Admin"));
                setFormData({ ...formData, tier: newTier, role: firstRoleInTier });
              }}
            >
              {getUserTier(user) === "SUPER_ADMIN" && (
                <>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                </>
              )}
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {/* ROLE */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Role <span className="text-red-500">*</span>
            </label>


            <select
              className="p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              {activeHierarchy
                .filter((r) => r.tier === formData.tier)
                .map((r) => (
                  <option key={r.id} value={r.role_name}>{r.role_name}</option>
                ))
              }
            </select>
          </div>

          {/* PHONE */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              className="p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Phone number"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          {/* DESIGNATION */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Designation
            </label>

            <input
              className="p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Optional"
              value={formData.designation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  designation: e.target.value,
                })
              }
            />
          </div>





          {/* PASSWORD */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">
              Password <span className="text-red-500">*</span>
            </label>

            <input
              className="p-2.5 border border-blue-200 bg-blue-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Set password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="md:col-span-3 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            Create Account
          </button>

        </form>
      </div>




      {/* 2. DIRECTORY TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">

          {/* NEW DROPDOWN REPLACING THE STATIC TEXT */}
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Show</label>
            <select
              value={itemsPerPageValue}
              onChange={(e) => handleItemsPerPageChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">Show All</option>
            </select>
            <span className="text-[10px] font-bold text-slate-300">|</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total: {filteredStaff.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={bulkDeleteUsers}
              disabled={selectedUserIds.length === 0}
              className="px-1 py-1 rounded-lg text-lg font-bold uppercase bg-red-600 text-white disabled:opacity-50"
              title="Delete selected users"
            >
              <RiDeleteBin4Fill />

              {/* ({selectedUserIds.length}) */}
            </button>
            <button
              type="button"
              onClick={exportUsersExcel}
              className="px-1 py-1 rounded-lg text-lg font-bold uppercase bg-slate-900 text-white"
              title="Export Excel"
            >
              <BiExport />
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={fetchData}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Refresh Table"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text" placeholder="Search..."
                className="pl-9 pr-4 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>


        <div className={`overflow-x-auto min-h-[400px] ${enableTableScroll ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all users"
                  />
                </th>
                <SortHeader label="Employee ID" sortKey="employee_id" />
                <SortHeader label="User Name" sortKey="name" />
                <SortHeader label="Tier / Role / Domain" sortKey="tier" />
                <SortHeader label="Contact Details" sortKey="email" />
                <SortHeader label="Account Status" sortKey="is_active" className="text-center" />
                <th className="p-4 text-center">CRM Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.map((u) => u && (
                <tr
                  key={u.id}
                  ref={editingId === u.id ? editRowRef : null}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUserSet.has(u.id)}
                      onChange={() => toggleSelectUser(u.id)}
                      aria-label={`Select user ${u.name || 'Unknown'}`}
                    />
                  </td>
                  {editingId === u.id ? (
                    <EditRow
                      editFormData={editFormData}
                      setEditFormData={setEditFormData}
                      dynamicDomains={accessibleDomains}
                      roleHierarchy={roleHierarchy}
                      handleSaveEdit={handleSaveEdit}
                      setEditingId={setEditingId}
                      staffMember={u}
                      loggedInUserTier={getUserTier(user)}
                    />
                  ) : (
                    <DisplayRow
                      staffMember={u}
                      setEditingId={setEditingId}
                      setEditFormData={setEditFormData}
                      handleDelete={handleDelete}
                      fetchUserHistory={fetchUserHistory}
                      handleToggleStatus={handleToggleStatus}
                    />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {currentItems.length === 0 && (
            <div className="p-20 text-center text-slate-400">No staff members found matching your search.</div>
          )}
        </div>

        <Pagination
          stats={{ currentPage, totalPages: totalPages || 1 }}
          onPageChange={(newPage) => setCurrentPage(newPage)}
          pageSize={itemsPerPage}
          pageSizeValue={itemsPerPageValue}
          onPageSizeChange={handleItemsPerPageChange}
          pageSizeOptions={[10, 20, 50, 100, 'all']}
        />
      </div>

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-slate-800 text-lg">USER EDIT HISTORY</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{historyUserName}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-full transition-colors">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {userHistory.length > 0 ? userHistory.map((h, i) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4 py-1 bg-slate-50/50 p-3 rounded-r-xl">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                    <span className="text-blue-600">{h.action_type || 'UPDATE'} by: {h.changed_by}</span>
                    <span>{new Date(h.changed_at).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{h.field_name || 'details'}</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium"><span className="text-slate-400">From:</span> {h.old_value || '-'}</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium"><span className="text-slate-400">To:</span> {h.new_value || '-'}</p>
                </div>
              )) : (
                <p className="text-center text-slate-400 text-sm italic py-10">No history found for this user.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const DisplayRow = ({ staffMember, setEditingId, setEditFormData, handleDelete, fetchUserHistory, handleToggleStatus }) => {
  if (!staffMember) return null;
  return (
    <>
      <td className="p-4 font-bold text-slate-700">{staffMember.employee_id || "-"}</td>
      <td className="p-4 font-bold text-slate-700">{staffMember.name || "-"}</td>
      <td className="p-4 min-w-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase w-fit">{staffMember.tier || "STAFF"}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase w-fit">{staffMember.role || "Staff"}</span>
          </div>
          {staffMember.designation && <span className="text-slate-500 text-[11px] font-semibold">{staffMember.designation}</span>}
          <div className="flex flex-wrap gap-1 mt-1">
            {staffMember.domain === "All" ? (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase border border-slate-200">All Domains</span>
            ) : (
              (staffMember.domain || "").split(',').map((d, idx) => d.trim() && (
                <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase border border-blue-100 whitespace-nowrap">
                  {d.trim()}
                </span>
              ))
            )}
          </div>
        </div>
      </td>
      <td className="p-4 text-xs text-slate-500">
        <div>{staffMember.email || "-"}</div>
        <div>{staffMember.phone || "-"}</div>
      </td>
      <td className="p-4 text-center">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleToggleStatus(staffMember)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${Number(staffMember.is_active) === 1 ? "bg-emerald-500" : "bg-slate-300"}`}
            title={Number(staffMember.is_active) === 1 ? "Set Inactive" : "Set Active"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${Number(staffMember.is_active) === 1 ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </td>
      <td className="p-4 text-center">
        {(() => {
          const secondsSinceActive = staffMember.seconds_since_active;
          const isActive = secondsSinceActive !== null && secondsSinceActive !== undefined && (secondsSinceActive >= 0 && secondsSinceActive < 300); // 5 minutes threshold
          return (
            <div className="flex items-center justify-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-red-600"}`} />
              <span className={`text-[10px] font-black uppercase tracking-tight ${isActive ? "text-emerald-700" : "text-red-600"}`}>
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          );
        })()}
      </td>
      <td className="p-4">
        <div className="flex justify-center gap-2">
          <button
            onClick={async () => {
              const confirmed = await confirmToast(`Edit account for ${staffMember.name}?`, "Edit");
              if (!confirmed) return;
              setEditingId(staffMember.id);
              setEditFormData({ ...staffMember, password: "" });
            }}
            className="p-2 text-slate-400 hover:text-blue-600"
          >
            <Edit size={16} />
          </button>
          <button onClick={() => fetchUserHistory(staffMember.id, staffMember.name)} className="p-2 text-slate-400 hover:text-emerald-600"><History size={16} /></button>
          <button onClick={() => handleDelete(staffMember.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
        </div>
      </td>
    </>
  );
};


const EditRow = ({ editFormData, setEditFormData, dynamicDomains, roleHierarchy, handleSaveEdit, setEditingId, staffMember, loggedInUserTier }) => {
  if (!staffMember) return null;
  return (
    <>
      {/* Employee ID */}
      <td className="p-4">
        <input
          className="w-full border p-2 rounded-lg text-sm"
          placeholder="Employee ID *"
          value={editFormData?.employee_id || ""}
          onChange={(e) => setEditFormData({ ...editFormData, employee_id: e.target.value })}
        />
      </td>

      {/* Name & Email Column */}
      <td className="p-4 space-y-2">
        <input
          className="w-full border p-2 rounded-lg text-sm mb-1"
          placeholder="Full Name *"
          value={editFormData?.name || ""}
          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
        />
        <input
          className="w-full border p-2 rounded-lg text-xs bg-slate-50"
          placeholder="Work Email *"
          value={editFormData?.email || ""}
          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
        />
      </td>

      {/* Role & Domain Column */}
      <td className="p-4">
        <div className="flex flex-col gap-2">
          <select 
            className="border p-2 rounded-lg text-xs" 
            value={getUserTier(editFormData)} 
            onChange={(e) => {
              const newTier = e.target.value;
              const firstRoleInTier = roleHierarchy.find(r => r.tier === newTier && Number(r.is_active) === 1)?.role_name || 
                                     (newTier === "STAFF" ? "Staff" : (newTier === "ADMIN" ? "TL" : "Main Admin"));
              setEditFormData(prev => ({ ...prev, tier: newTier, role: firstRoleInTier }));
            }}
          >
            {loggedInUserTier === "SUPER_ADMIN" && (
              <>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
              </>
            )}
            <option value="STAFF">Staff</option>
          </select>
            <select 
            className="border p-2 rounded-lg text-xs" 
            value={editFormData?.role || ""} 
            onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
          >
            {roleHierarchy
              .filter((r) => r.tier === (editFormData.tier || getUserTier(editFormData)) && Number(r.is_active) === 1)
              .map((r) => (
                <option key={r.id} value={r.role_name}>{r.role_name}</option>
              ))
            }
          </select>
          <input
            className="border p-2 rounded-lg text-xs"
            placeholder="Designation"
            value={editFormData?.designation || ""}
            onChange={(e) => setEditFormData(prev => ({ ...prev, designation: e.target.value }))}
          />

          {/* MULTI-DOMAIN EDIT DROPDOWN */}
          <div className="space-y-1 mt-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              Assigned Domains <span className="text-red-500">*</span>
            </label>

            {(editFormData?.tier === "SUPER_ADMIN") ? (
              <span className="text-[10px] font-bold text-blue-600 px-2 py-1 bg-white border rounded uppercase">
                ALL ACCESS
              </span>
            ) : (
              <MultiDomainDropdown
                domains={dynamicDomains}
                value={editFormData?.domain || ""}
                onChange={(val) =>
                  setEditFormData(prev => ({
                    ...prev,
                    domain: val,
                  }))
                }
                className="max-w-[240px]"
              />
            )}
          </div>
        </div>
      </td>

      {/* Phone & Password Reset Column */}
      <td className="p-4 space-y-2">
        <input
          className="w-full border p-2 rounded-lg text-sm"
          placeholder="Phone *"
          value={editFormData?.phone || ""}
          onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
        <input
          className="w-full border p-2 rounded-lg text-xs bg-blue-50 border-blue-100 font-mono"
          placeholder="New Password (or leave blank)"
          type="text"
          value={editFormData?.password || ""}
          onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
        />
      </td>

      {/* Status Placeholder (not editable in row-edit mode) */}
      <td className="p-4 text-center">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${Number(staffMember.is_active) === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
          {Number(staffMember.is_active) === 1 ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-4 text-center">
        <span className="text-[10px] font-bold text-slate-300 uppercase italic">
          -
        </span>
      </td>

      {/* Actions */}
    <td className="p-4 text-center">
      <div className="flex flex-col justify-center gap-2">
        <button onClick={() => handleSaveEdit(staffMember.id)} className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-1 text-xs font-bold">
          <Save size={14} /> Update
        </button>
        <button onClick={() => setEditingId(null)} className="w-full p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 flex items-center justify-center gap-1 text-xs font-bold">
          <X size={14} /> Cancel
        </button>
      </div>
    </td>
    </>
  );
};


export default UserManagement;
