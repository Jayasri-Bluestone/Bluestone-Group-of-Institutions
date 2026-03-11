import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  UserPlus, Mail, Phone, Trash2, Edit, Save, X, ShieldCheck,
  Search, Loader2, History, RefreshCcw, ChevronDown,
} from "lucide-react";
import LoadingScreen from "../Layout/LoadingScreen";
import Pagination from "../Layout/Pagination";
import { confirmToast } from "../../../utils/toastConfirm";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";
import MultiDomainDropdown from "./MultiSelectDD";
import { exportToCsv } from "../../../utils/exportCsv";


const UserManagement = () => {
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

  const [editFormData, setEditFormData] = useState({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [historyUserName, setHistoryUserName] = useState("");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", domain: "", role: "Staff", designation: "", password: "",
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

  // --- LOGIC: FILTERING ---
  const filteredStaff = staff.filter(user =>
    (
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.domain || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (
      statusFilter === "all" ||
      (statusFilter === "active" && Number(user.is_active) === 1) ||
      (statusFilter === "inactive" && Number(user.is_active) === 0)
    )
  );

  // --- LOGIC: PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const enableTableScroll =
    (itemsPerPageValue === 'all' && filteredStaff.length > 10) ||
    (itemsPerPageValue !== 'all' && Number(itemsPerPageValue) > 10);

  const visibleUserIds = useMemo(() => currentItems.map((user) => user.id), [currentItems]);
  const selectedUserSet = useMemo(() => new Set(selectedUserIds), [selectedUserIds]);
  const allVisibleSelected =
    visibleUserIds.length > 0 && visibleUserIds.every((id) => selectedUserSet.has(id));

  useEffect(() => {
    setSelectedUserIds((prev) => prev.filter((id) => visibleUserIds.includes(id)));
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

  // --- API HANDLERS (handleAddUser, handleDelete, handleSaveEdit remain same) ---
  const validate = (data, isNewUser = false) => {
    if (!data.name || data.name.length < 3) return "Name must be 3+ chars";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) return "Invalid email";
    if (isNewUser && (!data.password || data.password.length < 6)) return "Password must be 6+ chars";
    return null;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const error = validate(formData, true);
    if (error) return toast.error(error);
    const confirmed = await confirmToast(`Create account for ${formData.name}?`, "Create");
    if (!confirmed) return;
    const roleTier = roleHierarchy.find((r) => r.role_name === formData.role)?.tier;
    const isHighLevel = roleTier ? roleTier === "SUPER_ADMIN" : ["Main Admin", "MD", "GM"].includes(formData.role);
    const submissionData = { ...formData, domain: isHighLevel ? "All" : formData.domain };
    const loadToast = toast.loading("Registering staff...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(submissionData),
      });
      if (res.ok) {
        toast.success("Account created!", { id: loadToast });
        setFormData({ name: "", email: "", phone: "", domain: "", role: "Staff", designation: "", password: "" });
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

  const exportUsersCsv = async () => {
    const confirmed = await confirmToast("Export current table to CSV?", "Export");
    if (!confirmed) return;
    const columns = [
      { header: "User ID", accessor: (u) => u.id },
      { header: "User Name", accessor: (u) => u.name || "" },
      { header: "Role", accessor: (u) => u.role || "" },
      { header: "Designation", accessor: (u) => u.designation || "" },
      { header: "Domains", accessor: (u) => u.domain || "" },
      { header: "Email", accessor: (u) => u.email || "" },
      { header: "Phone", accessor: (u) => u.phone || "" },
      { header: "Status", accessor: (u) => (Number(u.is_active) === 1 ? "Active" : "Inactive") },
    ];
    await exportToCsv("staff-directory.csv", columns, currentItems);
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
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(editFormData),
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

  

  return (
  
 <div className="p-6 bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen space-y-8">

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
      {/* NAME */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Full Name
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

      {/* EMAIL */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Work Email
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

      {/* PHONE */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Phone
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

      {/* ROLE */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Role
        </label>

        <select
          className="p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value })
          }
        >
          {activeHierarchy.length > 0 ? (
            activeHierarchy.map((r) => (
              <option key={r.id} value={r.role_name}>
                {r.role_name}
              </option>
            ))
          ) : (
            <>
              <option value="Staff">Staff</option>
              <option value="TL">Team Lead</option>
              <option value="GM">GM</option>
              <option value="MD">MD</option>
              <option value="Main Admin">Admin</option>
            </>
          )}
        </select>
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
          Password
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

      {/* DOMAIN SELECT */}
      <div className="md:col-span-3 space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Assign Domains
        </label>

        <div className="p-3 rounded-xl bg-slate-50">

          {((roleHierarchy.find((r) => r.role_name === formData.role)?.tier || "") === "SUPER_ADMIN" ||
            ["Main Admin", "MD", "GM"].includes(formData.role)) ? (

            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 w-fit">
              All Domains (Admin Access)
            </div>

          ) : (

            <MultiDomainDropdown
              domains={dynamicDomains}
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
              className="px-3 py-2 rounded-lg text-xs font-bold uppercase bg-red-600 text-white disabled:opacity-50"
              title="Delete selected users"
            >
              Delete Selected ({selectedUserIds.length})
            </button>
            <button
              type="button"
              onClick={exportUsersCsv}
              className="px-3 py-2 rounded-lg text-xs font-bold uppercase bg-slate-900 text-white"
              title="Export CSV"
            >
              Export CSV
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
                <th className="p-4">User ID</th>

                <th className="p-4">User Name</th>
                <th className="p-4">Role / Domain</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4 text-center">Status</th>

                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUserSet.has(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      aria-label={`Select user ${user.name}`}
                    />
                  </td>
                  {editingId === user.id ? (
                    <EditRow
                      editFormData={editFormData}
                      setEditFormData={setEditFormData}
                      dynamicDomains={dynamicDomains}
                      roleHierarchy={roleHierarchy}
                      handleSaveEdit={handleSaveEdit}
                      setEditingId={setEditingId}
                      user={user}
                    />
                  ) : (
                    <DisplayRow
                      user={user}
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

const DisplayRow = ({ user, setEditingId, setEditFormData, handleDelete, fetchUserHistory, handleToggleStatus }) => (
  <>
    <td className="p-4 font-bold text-slate-700">{user.id}</td>
    <td className="p-4 font-bold text-slate-700">{user.name}</td>
    <td className="p-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase w-fit">{user.role}</span>
        {user.designation && <span className="text-slate-500 text-[11px] font-semibold">{user.designation}</span>}
        <div className="flex flex-wrap gap-1 mt-1">
          {user.domain === "All" ? (
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase border border-slate-200">All Domains</span>
          ) : (
            (user.domain || "").split(',').map((d, idx) => d.trim() && (
              <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase border border-blue-100 whitespace-nowrap">
                {d.trim()}
              </span>
            ))
          )}
        </div>
      </div>
    </td>
    <td className="p-4 text-xs text-slate-500">
      <div>{user.email}</div>
      <div>{user.phone}</div>
    </td>
    <td className="p-4 text-center">
      <div className="inline-flex items-center gap-2">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${Number(user.is_active) === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
          {Number(user.is_active) === 1 ? "Active" : "Inactive"}
        </span>
        <button
          type="button"
          onClick={() => handleToggleStatus(user)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${Number(user.is_active) === 1 ? "bg-emerald-500" : "bg-slate-300"}`}
          title={Number(user.is_active) === 1 ? "Set Inactive" : "Set Active"}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${Number(user.is_active) === 1 ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>
    </td>
    <td className="p-4">
      <div className="flex justify-center gap-2">
        <button
          onClick={async () => {
            const confirmed = await confirmToast(`Edit account for ${user.name}?`, "Edit");
            if (!confirmed) return;
            setEditingId(user.id);
            setEditFormData({ ...user, password: "" });
          }}
          className="p-2 text-slate-400 hover:text-blue-600"
        >
          <Edit size={16} />
        </button>
        <button onClick={() => fetchUserHistory(user.id, user.name)} className="p-2 text-slate-400 hover:text-emerald-600"><History size={16} /></button>
        <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
      </div>
    </td>
  </>
);


const EditRow = ({ editFormData, setEditFormData, dynamicDomains, roleHierarchy, handleSaveEdit, setEditingId, user }) => (
  <>
    {/* User ID */}
    <td className="p-4 font-bold text-slate-700">{user.id}</td>

    {/* Name & Email Column */}
    <td className="p-4 space-y-2">
      <input
        className="w-full border p-2 rounded-lg text-sm mb-1"
        placeholder="Full Name"
        value={editFormData.name}
        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
      />
      <input
        className="w-full border p-2 rounded-lg text-xs bg-slate-50"
        placeholder="Work Email"
        value={editFormData.email}
        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
      />
    </td>

    {/* Role & Domain Column */}
    <td className="p-4">
      <div className="flex flex-col gap-2">
        <select className="border p-2 rounded-lg text-xs" value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}>
          {roleHierarchy.filter((r) => Number(r.is_active) === 1).length > 0 ? (
            roleHierarchy
              .filter((r) => Number(r.is_active) === 1)
              .map((r) => (
                <option key={r.id} value={r.role_name}>{r.role_name}</option>
              ))
          ) : (
            <>
              <option value="Staff">Staff</option>
              <option value="TL">TL</option>
              <option value="GM">GM</option>
              <option value="MD">MD</option>
              <option value="Main Admin">Admin</option>
            </>
          )}
        </select>
        <input
          className="border p-2 rounded-lg text-xs"
          placeholder="Designation"
          value={editFormData.designation || ""}
          onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
        />

       {/* MULTI-DOMAIN EDIT DROPDOWN */}
<div className="space-y-1 mt-1">
  <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
    Assigned Domains
  </label>

  {((roleHierarchy.find((r) => r.role_name === editFormData.role)?.tier || "") === "SUPER_ADMIN" ||
    ["Main Admin", "MD", "GM"].includes(editFormData.role)) ? (
    <span className="text-[10px] font-bold text-blue-600 px-2 py-1 bg-white border rounded">
      ALL ACCESS
    </span>
  ) : (
    <MultiDomainDropdown
      domains={dynamicDomains}
      value={editFormData.domain}
      onChange={(val) =>
        setEditFormData({
          ...editFormData,
          domain: val,
        })
      }
    />
  )}
</div>
      </div>
    </td>

    {/* Phone & Password Reset Column */}
    <td className="p-4 space-y-2">
      <input
        className="w-full border p-2 rounded-lg text-sm"
        placeholder="Phone"
        value={editFormData.phone}
        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
      />
      <input
        className="w-full border p-2 rounded-lg text-xs bg-blue-50 border-blue-100 font-mono"
        placeholder="New Password (or leave blank)"
        type="text"
        value={editFormData.password || ""}
        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
      />
    </td>

    {/* Status Placeholder (not editable in row-edit mode) */}
    <td className="p-4 text-center">
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${Number(user.is_active) === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
        {Number(user.is_active) === 1 ? "Active" : "Inactive"}
      </span>
    </td>

    {/* Actions */}
    <td className="p-4 text-center">
      <div className="flex flex-col justify-center gap-2">
        <button onClick={() => handleSaveEdit(user.id)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-1 text-xs font-bold">
          <Save size={14} /> Update
        </button>
        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 flex items-center justify-center gap-1 text-xs font-bold">
          <X size={14} /> Cancel
        </button>
      </div>
    </td>
  </>
);


export default UserManagement;
