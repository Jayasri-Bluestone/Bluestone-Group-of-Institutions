import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Send,
  Info,
  Bell,
  Edit,
  Trash2,
  Search,
  History,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";
import Pagination from "./Pagination";
import { exportToCsv } from "../../../utils/exportCsv";
import { RiDeleteBin4Fill } from "react-icons/ri";
import { BiExport } from "react-icons/bi";

const LiveFeedManager = ({ user }) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // ✅ Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Confirm",
    confirmColor: "bg-blue-600 hover:bg-blue-700"
  });

  // ✅ History Modal State
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    loading: false,
    noteId: null,
    data: []
  });

  const fetchNotificationHistory = async (note) => {
    setHistoryModal({ isOpen: true, loading: true, noteId: note.id, data: [] });
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/notifications/${note.id}/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setHistoryModal({ isOpen: true, loading: false, noteId: note.id, data });
    } catch {
      toast.error("Failed to load history");
      setHistoryModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState([]);

  // ✅ FETCH
  const fetchHistory = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/notifications/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchHistory();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [fetchHistory]);

  // ✅ ADD / UPDATE
  const processSubmit = async () => {
    setLoading(true);

    const isEditing = !!editingId;
    const url = isEditing
      ? `${API_BASE_URL_PORTAL}/api/notifications/${editingId}`
      : `${API_BASE_URL_PORTAL}/api/notifications`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ date, message }),
      });

      if (res.ok) {
        toast.success(isEditing ? "Updated" : "Added");
        resetForm();
        fetchHistory();
      }
    } catch {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: editingId ? "Update Broadcast" : "Add Broadcast",
      message: "Are you sure you want to proceed with this broadcast?",
      confirmText: "Yes, Proceed",
      confirmColor: "bg-black hover:bg-gray-800",
      onConfirm: () => {
        processSubmit();
      }
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setMessage("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  // ✅ TOGGLE
  const processToggle = async (note) => {
    const newStatus = Number(note.is_active) === 1 ? 0 : 1;

    try {
      await fetch(
        `${API_BASE_URL_PORTAL}/api/notifications/${note.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ is_active: newStatus }),
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, is_active: newStatus } : n
        )
      );
      toast.success("Status updated");
    } catch {
      toast.error("Toggle failed");
    }
  };

  const confirmToggle = (note) => {
    const isActivating = Number(note.is_active) === 0;
    setConfirmModal({
      isOpen: true,
      title: "Change Status",
      message: `Are you sure you want to ${isActivating ? 'activate' : 'deactivate'} this broadcast?`,
      confirmText: "Yes, Change Status",
      confirmColor: "bg-blue-600 hover:bg-blue-700",
      onConfirm: () => {
        processToggle(note);
      }
    });
  };

  // ✅ DELETE
  const deleteNotificationById = async (id, options = {}) => {
    const { suppressRefresh = false } = options;
    try {
      await fetch(`${API_BASE_URL_PORTAL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!suppressRefresh) fetchHistory();
      return true;
    } catch {
      return false;
    }
  };

  const confirmBulkDelete = () => {
    if (selectedNotificationIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Delete Broadcasts",
      message: `Delete ${selectedNotificationIds.length} broadcast(s)? This action cannot be undone.`,
      confirmText: "Yes, Delete",
      confirmColor: "bg-red-600 hover:bg-red-700",
      onConfirm: async () => {
        const tid = toast.loading(`Deleting ${selectedNotificationIds.length} broadcast(s)...`);
        const results = await Promise.all(
          selectedNotificationIds.map((id) =>
            deleteNotificationById(id, { suppressRefresh: true })
          )
        );
        const failed = results.filter((ok) => !ok).length;
        if (failed > 0) {
          toast.error(`${failed} broadcast(s) failed to delete`, { id: tid });
        } else {
          toast.success("Selected broadcasts deleted", { id: tid });
        }
        setSelectedNotificationIds([]);
        fetchHistory();
      }
    });
  };

  const confirmDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Broadcast",
      message: "Are you sure you want to permanently delete this broadcast? This action cannot be undone.",
      confirmText: "Yes, Delete",
      confirmColor: "bg-red-600 hover:bg-red-700",
      onConfirm: async () => {
        const ok = await deleteNotificationById(id, { suppressRefresh: true });
        if (ok) {
          toast.success("Deleted successfully");
        } else {
          toast.error("Failed to delete");
        }
        fetchHistory();
      }
    });
  };

  const exportNotificationsCsv = async () => {
    const confirmed = await confirmToast("Export current table to CSV?", "Export");
    if (!confirmed) return;
    const columns = [
      { header: "Status", accessor: (n) => (Number(n.is_active) === 1 ? "Active" : "Inactive") },
      { header: "Date", accessor: (n) => (n.date ? new Date(n.date).toLocaleDateString("en-GB") : "") },
      { header: "Message", accessor: (n) => n.message || "" },
    ];
    await exportToCsv("broadcasts.csv", columns, currentData);
  };

  // ✅ FILTER
  const filteredData = notifications.filter((n) =>
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ PAGINATION
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(Math.ceil(filteredData.length / rowsPerPage), 1);

  const visibleNotificationIds = useMemo(
    () => currentData.map((note) => note.id),
    [currentData]
  );
  const selectedNotificationSet = useMemo(
    () => new Set(selectedNotificationIds),
    [selectedNotificationIds]
  );
  const allVisibleSelected =
    visibleNotificationIds.length > 0 &&
    visibleNotificationIds.every((id) => selectedNotificationSet.has(id));

  useEffect(() => {
    setSelectedNotificationIds((prev) => {
      const next = prev.filter((id) => visibleNotificationIds.includes(id));
      if (next.length === prev.length && next.every((id, idx) => id === prev[idx])) {
        return prev;
      }
      return next;
    });
  }, [visibleNotificationIds]);

  const toggleSelectNotification = (id) => {
    setSelectedNotificationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedNotificationIds((prev) =>
        prev.filter((id) => !selectedNotificationSet.has(id))
      );
      return;
    }
    setSelectedNotificationIds((prev) =>
      Array.from(new Set([...prev, ...visibleNotificationIds]))
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-[32px] shadow border">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-600 text-white rounded-2xl">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black">
              {editingId ? "Edit Broadcast" : "Broadcast Center"}
            </h1>
            <p className="text-sm text-gray-500">
              Manage live notifications
            </p>
          </div>
          {editingId && (
            <button
              onClick={resetForm}
              className="ml-auto text-red-500 text-xs flex gap-1"
            >
              <XCircle size={14} /> Cancel
            </button>
          )}
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-6"
        >
          <div>
            <label className="text-xs font-bold flex gap-2">
              <Calendar size={14} /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border rounded-xl mt-2"
            />
          </div>

          <div>
            <label className="text-xs font-bold">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border rounded-xl mt-2"
              required
            />
          </div>

          <button className="col-span-2 bg-black text-white py-3 rounded-xl font-bold">
            {loading ? "Saving..." : editingId ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] shadow border overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b">
          <div className="flex gap-2 items-center">
            <History size={18} />
            <h3 className="font-bold">Recent Broadcasts</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={confirmBulkDelete}
              disabled={selectedNotificationIds.length === 0}
              className="px-1 py-1 rounded-lg text-lg font-bold uppercase bg-red-600 text-white disabled:opacity-50"
              title="Delete selected broadcasts"
            >
              <RiDeleteBin4Fill/>
              {/* ({selectedNotificationIds.length}) */}
            </button>
            <button
              type="button"
              onClick={exportNotificationsCsv}
              className="px-1 py-1 rounded-lg text-lg font-bold uppercase bg-slate-900 text-white"
              title="Export CSV"
            >
<BiExport/>
            </button>
            <button
              onClick={fetchHistory}
              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Refresh Table"
            >
              <RefreshCcw size={14} className={tableLoading ? "animate-spin" : ""} />
            </button>
            <input
              placeholder="Search..."
              className="border px-3 py-1 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <table className="w-full text-left text-sm whitespace-normal">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="p-4 border-r border-slate-100">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all broadcasts"
                  />
                </th>
                <th className="p-4 border-r border-slate-100">Status</th>
                <th className="p-4 border-r border-slate-100">Date</th>
                <th className="p-4 border-r border-slate-100">Message</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

          <tbody>
            {currentData.map((note) => {
              const isActive = Number(note.is_active) === 1;

              return (
                <tr key={note.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-r border-slate-50 align-top">
                    <input
                      type="checkbox"
                      checked={selectedNotificationSet.has(note.id)}
                      onChange={() => toggleSelectNotification(note.id)}
                      aria-label={`Select broadcast ${note.id}`}
                    />
                  </td>
                  <td className="p-4 border-r border-slate-50 align-top">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />

                      <button
                        onClick={() => confirmToggle(note)}
                        className={`w-10 h-5 rounded-full p-1 transition-colors ${
                          isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            isActive
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </td>

                  <td className="p-4 text-xs font-bold text-slate-600 border-r border-slate-50 align-top">
                    {new Date(note.date).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-4 text-xs font-medium text-slate-700 border-r border-slate-50 align-top leading-relaxed break-words">
                    {note.message}
                  </td>

                  <td className="p-4 text-center align-top">
                    <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => fetchNotificationHistory(note)}
                        className="p-1.5 bg-amber-50 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
                        title="View History"
                      >
                        <History size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(note.id);
                          setMessage(note.message);
                          setDate(note.date.split("T")[0]);
                        }}
                        className="p-1.5 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Broadcast"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => confirmDelete(note.id)}
                        className="p-1.5 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete Broadcast"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        <Pagination
          stats={{ currentPage, totalPages }}
          onPageChange={setCurrentPage}
          pageSize={rowsPerPage}
          pageSizeValue={rowsPerPage}
          onPageSizeChange={(size) => {
            setRowsPerPage(Number(size));
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {confirmModal.title}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                }}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${confirmModal.confirmColor}`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {historyModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <History className="text-blue-600" size={24} /> Broadcast History
              </h2>
              <button
                onClick={() => setHistoryModal({ ...historyModal, isOpen: false })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {historyModal.loading ? (
                <div className="flex justify-center p-10"><RefreshCcw className="animate-spin text-slate-400" /></div>
              ) : historyModal.data.length === 0 ? (
                <div className="text-center p-10 text-slate-500">No history found for this broadcast.</div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {historyModal.data.map((log) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                           <History size={14} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{log.action_type}</span>
                                <time className="text-xs text-slate-400">{new Date(log.changed_at).toLocaleString()}</time>
                            </div>
                            <div className="text-sm font-semibold text-slate-700 mt-2">By: {log.changed_by}</div>
                            {log.action_type === 'UPDATED' && (
                                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg break-words">
                                    <div className="line-through text-slate-400 mb-1">{log.old_message}</div>
                                    <div className="text-green-600">{log.new_message}</div>
                                </div>
                            )}
                            {log.action_type === 'STATUS_TOGGLED' && (
                                <div className="mt-2 text-xs text-slate-600">
                                    Status changed to: <span className="font-bold">{Number(log.new_is_active) === 1 ? 'Active' : 'Inactive'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveFeedManager;
