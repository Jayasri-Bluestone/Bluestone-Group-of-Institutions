import React, { useState, useEffect, useCallback } from "react";
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

const LiveFeedManager = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const AUTO_REFRESH_MS = 30000;

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const resetForm = () => {
    setEditingId(null);
    setMessage("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  // ✅ TOGGLE
  const toggleStatus = async (note) => {
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
    } catch {
      toast.error("Toggle failed");
    }
  };

  // ✅ DELETE
  const confirmDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold">Delete this?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)}>Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await fetch(`${API_BASE_URL_PORTAL}/api/notifications/${id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });
              fetchHistory();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    ));
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

        <table className="w-full text-left">
          <thead className="text-xs text-gray-400">
            <tr>
              <th className="p-4">Status</th>
              <th>Date</th>
              <th>Message</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((note) => {
              const isActive = Number(note.is_active) === 1;

              return (
                <tr key={note.id} className="group hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />

                      <button
                        onClick={() => toggleStatus(note)}
                        className={`w-10 h-5 rounded-full p-1 ${
                          isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition ${
                            isActive
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </td>

                  <td className="text-sm">
                    {new Date(note.date).toLocaleDateString()}
                  </td>

                  <td className="text-sm">{note.message}</td>

                  <td className="text-right pr-4">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditingId(note.id);
                          setMessage(note.message);
                          setDate(note.date.split("T")[0]);
                        }}
                        className="p-2 bg-gray-100 rounded-lg hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => confirmDelete(note.id)}
                        className="p-2 bg-gray-100 rounded-lg hover:text-red-600"
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
    </div>
  );
};

export default LiveFeedManager;
