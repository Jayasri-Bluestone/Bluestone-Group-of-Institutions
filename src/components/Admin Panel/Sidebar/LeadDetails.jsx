import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { RefreshCcw } from "lucide-react";
import LoadingScreen from "../Layout/LoadingScreen";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";

const LeadDetails = ({ user }) => {
  const getTier = (u) => {
    if (u?.tier) return u.tier;
    if (["Main Admin", "MD", "GM"].includes(u?.role)) return "SUPER_ADMIN";
    if (["TL", "Coordinator", "Head"].includes(u?.role)) return "ADMIN";
    return "STAFF";
  };
  const isAdminTier = getTier(user) === "ADMIN" || getTier(user) === "SUPER_ADMIN";
  const { slug, leadId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [remarksDraft, setRemarksDraft] = useState("");
  const [paymentDraft, setPaymentDraft] = useState({
    payment_status: "Unpaid",
    total_fees: 0,
    paid_amount: 0,
  });
  const [remarkMessages, setRemarkMessages] = useState([]);
  const [domainStaff, setDomainStaff] = useState([]);
  const [showAddMessage, setShowAddMessage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [historyData,setHistoryData] = useState([]);
const [showHistory,setShowHistory] = useState(false);

  const AUTO_REFRESH_MS = 30000;
  const recipientPrefKey = `remark_default_recipients_${user?.id || "guest"}`;

  const canEditPayments = isAdminTier;
  const [isSendingMessage, setIsSendingMessage] = useState(false);
 const [messageDraft, setMessageDraft] = useState({
  ref_id: "",
  subject: "",
  description: "",
  recipientUserIds: [],
  attachment: null,
  attachmentName: "",
  attachmentType: ""
});

  const fetchRemarkMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/remark-messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        setRemarkMessages([]);
        return;
      }
      const json = await res.json();
      setRemarkMessages(Array.isArray(json) ? json : []);
    } catch {
      setRemarkMessages([]);
    }
  };

  const fetchDomainStaff = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/domain-staff`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        setDomainStaff([]);
        return;
      }
      const json = await res.json();
      setDomainStaff(Array.isArray(json) ? json : []);
    } catch {
      setDomainStaff([]);
    }
  };

  const fetchLead = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) {
      toast.error("Unable to load lead details");
      setLead(null);
      return;
    }

    const json = await res.json();

    setLead(json);

    setRemarksDraft(json.remarks || "");

    setPaymentDraft({
      payment_status: json.payment_status || "Unpaid",
      total_fees: json.total_fees ?? 0,
      paid_amount: json.paid_amount ?? 0,
    });

    // ✅ AUTO SET REF ID = CANDIDATE ID
  setMessageDraft((prev) => ({
  ...prev,
  ref_id: String(json.lead_code || json.id)
}));

    await Promise.all([fetchRemarkMessages(), fetchDomainStaff()]);

  } catch {
    toast.error("Unable to load lead details");
    setLead(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchRemarkMessages();
      fetchDomainStaff();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const saveRemarks = async () => {
    const tid = toast.loading("Saving remark...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/remarks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ leadId: Number(leadId), remarks: remarksDraft }),
      });
      if (!res.ok) throw new Error();
      toast.success("Remark saved", { id: tid });
      setLead((prev) => (prev ? { ...prev, remarks: remarksDraft } : prev));
    } catch {
      toast.error("Save failed", { id: tid });
    }
  };

  const savePayment = async () => {
    const tid = toast.loading("Saving payment details...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(paymentDraft),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || err.error || "Save failed");
      }
      toast.success("Payment details updated", { id: tid });
      setLead((prev) => (prev ? { ...prev, ...paymentDraft } : prev));
    } catch (err) {
      toast.error(err.message || "Save failed", { id: tid });
    }
  };

  const openHistory = async (messageId) => {

  try {

    const res = await fetch(
      `${API_BASE_URL_PORTAL}/api/leads/remark-history/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    if (!res.ok) {
      throw new Error("History not found");
    }

    const json = await res.json();

    setHistoryData(json);
    setShowHistory(true);

  } catch (err) {
    console.error(err);
    toast.error("Failed to load history");
  }

};


  const toggleRecipient = (staffId) => {
    const idNum = Number(staffId);
    setMessageDraft((prev) => {
      const exists = prev.recipientUserIds.includes(idNum);
      const nextIds = exists
        ? prev.recipientUserIds.filter((id) => id !== idNum)
        : [...prev.recipientUserIds, idNum];

      // Persist default ON/OFF recipient switches for future candidates.
      try {
        localStorage.setItem(recipientPrefKey, JSON.stringify(nextIds));
      } catch {
        // ignore storage errors
      }

      return {
        ...prev,
        recipientUserIds: nextIds,
      };
    });
  };

  const saveAndSendMessage = async () => {

  if (
    !String(messageDraft.ref_id).trim() ||
    !messageDraft.subject.trim() ||
    !messageDraft.description.trim()
  ) {
    toast.error("Ref ID, Subject and Description are required");
    return;
  }

  setIsSendingMessage(true);

  const tid = toast.loading("Saving and sending...");

  try {

    const isEditing = Boolean(editingMessageId);

    const endpoint = isEditing
      ? `${API_BASE_URL_PORTAL}/api/leads/${leadId}/remark-messages/${editingMessageId}`
      : `${API_BASE_URL_PORTAL}/api/leads/${leadId}/remark-messages/send`;

    const payload = {
      ref_id: lead.id,
      subject: messageDraft.subject,
      description: messageDraft.description,
      recipientUserIds: messageDraft.recipientUserIds,
      attachment_base64: messageDraft.attachment,
      attachment_name: messageDraft.attachmentName,
      attachment_type: messageDraft.attachmentType
    };

    const res = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(json.msg || json.error || "Save/Send failed", { id: tid });
      return;
    }

    toast.success("Message sent successfully", { id: tid });

    // reset form
    setMessageDraft({
      ref_id: String(lead.lead_code || lead.id),
      subject: "",
      description: "",
      recipientUserIds: messageDraft.recipientUserIds,
      attachment: null,
      attachmentName: "",
      attachmentType: ""
    });

    setShowAddMessage(false);
    setEditingMessageId(null);

    await fetchRemarkMessages();

  } catch (err) {

    console.error(err);
    toast.error("Send failed", { id: tid });

  } finally {

    setIsSendingMessage(false);

  }
};

  const startEditMessage = (message) => {
    let ids = [];
    try {
      const parsed = JSON.parse(message.recipient_user_ids || "[]");
      ids = Array.isArray(parsed) ? parsed.map((v) => Number(v)).filter((v) => Number.isInteger(v)) : [];
    } catch {
      ids = String(message.recipient_user_ids || "")
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isInteger(v) && v > 0);
    }

    setMessageDraft({
      ref_id: lead.id || "",
      subject: message.subject || "",
      description: message.description || "",
      recipientUserIds: ids,
    });
    setEditingMessageId(message.id);
    setShowAddMessage(true);
  };

  useEffect(() => {
    if (editingMessageId) return;

    let storedIds = [];
    try {
      const raw = localStorage.getItem(recipientPrefKey);
      const parsed = JSON.parse(raw || "[]");
      storedIds = Array.isArray(parsed)
        ? parsed.map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0)
        : [];
    } catch {
      storedIds = [];
    }

    // Apply only users available in current lead domain staff list.
    const allowed = new Set(domainStaff.map((s) => Number(s.id)));
    const applicableIds = storedIds.filter((id) => allowed.has(id));

    setMessageDraft((prev) => ({ ...prev, recipientUserIds: applicableIds }));
  }, [domainStaff, editingMessageId, recipientPrefKey]);

  const deleteMessage = async (messageId) => {
    const tid = toast.loading("Deleting message...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/remark-messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.msg || json.error || "Delete failed");
      toast.success("Message deleted", { id: tid });
      if (editingMessageId === messageId) {
        setEditingMessageId(null);
        setShowAddMessage(false);
      }
      await fetchRemarkMessages();
    } catch (err) {
      toast.error(err.message || "Delete failed", { id: tid });
    }
  };

  if (loading) return <LoadingScreen message="Loading lead details..." fullPage={false} />;

  if (!lead) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        Lead not found.
      </div>
    );
  }

  const visibleMessages = showAllMessages
  ? remarkMessages
  : remarkMessages.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Lead Details</h2>
          <p className="text-xs font-bold text-slate-400">{lead.lead_code || `#${lead.id}`} {lead.student_name}</p>
        </div>
        <button
          onClick={() => navigate(`/portal/domain/${slug}`)}
          className="px-3 py-2 text-xs font-black rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
        >
          Back To Domain
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Email" value={lead.email || "N/A"} />
        <InfoRow label="Phone" value={lead.phone || "N/A"} />
        <InfoRow label="Domain" value={lead.domain || "N/A"} />
        <InfoRow label="Course / Interested In" value={lead.interested_in || "General"} />
        <InfoRow label="Source" value={lead.source || "Direct"} />
        <InfoRow label="Status" value={lead.status || "New"} />
        <InfoRow label="Assigned To" value={lead.assigned_to_name || "Not assigned"} />
        <InfoRow label="Assigned By" value={lead.assigned_by_name || "System"} />
        <InfoRow label="Created On" value={lead.created_at ? new Date(lead.created_at).toLocaleString() : "N/A"} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <p className="text-[10px] font-black uppercase text-slate-400">Remarks</p>
        <textarea
          value={remarksDraft}
          onChange={(e) => setRemarksDraft(e.target.value)}
          className="w-full min-h-[100px] p-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 ring-blue-500/20"
        />
       
        <button
          onClick={saveRemarks}
          className="px-3 py-2 text-[10px] font-black rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Remark
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <p className="text-[10px] font-black uppercase text-slate-400">Payment Details</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            disabled={!canEditPayments}
            value={paymentDraft.payment_status}
            onChange={(e) => setPaymentDraft((prev) => ({ ...prev, payment_status: e.target.value }))}
            className={`border rounded-lg px-3 py-2 text-sm ${canEditPayments ? "bg-white" : "bg-slate-100 text-slate-500 cursor-not-allowed"}`}
          >
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            disabled={!canEditPayments}
            value={paymentDraft.total_fees}
            onChange={(e) => setPaymentDraft((prev) => ({ ...prev, total_fees: e.target.value }))}
            className={`border rounded-lg px-3 py-2 text-sm ${canEditPayments ? "bg-white" : "bg-slate-100 text-slate-500 cursor-not-allowed"}`}
            placeholder="Total Fees"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            disabled={!canEditPayments}
            value={paymentDraft.paid_amount}
            onChange={(e) => setPaymentDraft((prev) => ({ ...prev, paid_amount: e.target.value }))}
            className={`border rounded-lg px-3 py-2 text-sm ${canEditPayments ? "bg-white" : "bg-slate-100 text-slate-500 cursor-not-allowed"}`}
            placeholder="Paid Amount"
          />
        </div>
        {canEditPayments && (
          <button
            onClick={savePayment}
            className="px-3 py-2 text-[10px] font-black rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Save Payment Details
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-slate-400">Message Log</p>
          <button
            onClick={() => {
              fetchRemarkMessages();
              fetchDomainStaff();
            }}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            title="Refresh Table"
          >
            <RefreshCcw size={14} />
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50">
              <tr className="text-[10px] uppercase text-slate-500 font-black">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Description</th>
                <th className="p-3">Attachment</th>
<th className="p-3">Created</th>
<th className="p-3">Last Modified</th>
                <th className="p-3">Mail</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {remarkMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">No messages yet</td>
                </tr>
              ) : (
                visibleMessages.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100 align-top">
                    <td className="p-3 font-bold text-slate-700">{messageDraft.ref_id}</td>
                    <td className="p-3 font-semibold text-slate-700">{m.subject}</td>
                    <td className="p-3 text-slate-600 whitespace-pre-wrap">{m.description}</td>
                   <td className="p-3">
  {m.attachment_base64 ? (

    m.attachment_type?.startsWith("image") ? (

      <img
        src={m.attachment_base64}
        alt={m.attachment_name}
        className="w-16 h-16 object-cover rounded border cursor-pointer"
        onClick={() => window.open(m.attachment_base64, "_blank")}
      />

    ) : m.attachment_type === "application/pdf" ? (

      <a
        href={m.attachment_base64}
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-600 font-bold text-xs"
      >
        📄 View PDF
      </a>

    ) : (

      <a
        href={m.attachment_base64}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-xs"
      >
        Download
      </a>

    )

  ) : "-"}
</td>
<td className="p-3 text-slate-500">
  {new Date(m.created_at).toLocaleString()}
</td>

<td className="p-3 text-slate-500">
  {m.updated_at ? new Date(m.updated_at).toLocaleString() : "-"}
</td>                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-black ${m.sent_status === "SENT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {m.sent_status}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => startEditMessage(m)}
                        className="mr-2 px-2 py-1 text-[10px] font-black rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMessage(m.id)}
                        className="px-2 py-1 text-[10px] font-black rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                      <button
  onClick={() => openHistory(m.id)}
  className="mr-2 px-2 py-1 text-[10px] ml-2 font-black rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
>
  History
</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
        </div>
        {remarkMessages.length > 3 && (
  <div className="flex justify-end mt-3">
    <button
      onClick={() => setShowAllMessages(!showAllMessages)}
      className="px-4 py-1 text-[10px] font-black rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
    >
      {showAllMessages ? "Show Less" : `Show All (${remarkMessages.length})`}
    </button>
  </div>
)}

        {!!lead.remarks?.trim() && (
          <button
            onClick={() => setShowAddMessage((prev) => !prev)}
            className="px-3 py-2 text-[10px] font-black rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {showAddMessage ? "Close Add & Send Message" : "Add & Send Message"}
          </button>
        )}

        {showAddMessage && (
          <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50">
            <p className="text-[10px] font-black uppercase text-slate-500">
              {editingMessageId ? "Edit Message (will re-send mail)" : "Add Message"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={messageDraft.ref_id}
                onChange={(e) => setMessageDraft((prev) => ({ ...prev, ref_id: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Ref ID *"
              />
              <input
                value={messageDraft.subject}
                onChange={(e) => setMessageDraft((prev) => ({ ...prev, subject: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Subject *"
              />
              <input
                value={lead.email || ""}
                disabled
                className="border rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-500"
                placeholder="Candidate Email *"
              />
            </div>
            <textarea
              value={messageDraft.description}
              onChange={(e) => setMessageDraft((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full min-h-[110px] border rounded-lg p-3 text-sm"
              placeholder="Description / message *"
            />

            <div>
  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
    Attachment (Optional)
  </p>

  <input
    type="file"
    accept="image/*,.pdf"
   onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    setMessageDraft((prev) => ({
      ...prev,
      attachment: reader.result, // base64
      attachmentName: file.name,
      attachmentType: file.type
    }));
  };

  reader.readAsDataURL(file);
}}
    className="text-xs border border-slate-200 rounded-lg p-2 w-full"
  />

  {messageDraft.attachment && (
    <p className="text-[10px] text-green-600 mt-1 font-semibold">
Selected: {messageDraft.attachmentName}
    </p>
  )}
</div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-[10px] uppercase text-slate-500 font-black">
                    <th className="p-2">Send Mail</th>
                    <th className="p-2">User ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Mobile</th>
                    <th className="p-2">Domain</th>
                  </tr>
                </thead>
                <tbody>
                  {domainStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-3 text-center text-slate-400">No domain staff found</td>
                    </tr>
                  ) : (
                    domainStaff.map((s) => (
                      <tr key={s.id} className="border-t border-slate-100">
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRecipient(s.id)}
                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                              messageDraft.recipientUserIds.includes(Number(s.id))
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                            aria-label={`Toggle mail send for ${s.name || "user"}`}
                            title={messageDraft.recipientUserIds.includes(Number(s.id)) ? "ON" : "OFF"}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                messageDraft.recipientUserIds.includes(Number(s.id))
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                            <span className="sr-only">
                              {messageDraft.recipientUserIds.includes(Number(s.id)) ? "ON" : "OFF"}
                            </span>
                          </button>
                        </td>
                        <td className="p-2">{s.id}</td>
                        <td className="p-2 font-semibold">{s.name}</td>
                        <td className="p-2">{s.role}</td>
                        <td className="p-2">{s.email || "-"}</td>
                        <td className="p-2">{s.phone || "-"}</td>
                        <td className="p-2">{s.domain || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
  onClick={saveAndSendMessage}
  disabled={isSendingMessage}
  className={`px-4 py-2 text-[10px] font-black rounded-lg text-white
    ${isSendingMessage ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
  `}
>
  {isSendingMessage ? "Sending..." : editingMessageId ? "Update And Re-Send" : "Save And Send"}
</button>
          </div>
        )}
      </div>

     {showHistory && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-[700px] max-h-[80vh] overflow-auto p-5">

          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-lg">Message History</h3>

            <button
              onClick={() => setShowHistory(false)}
              className="text-red-500 font-bold"
            >
              Close
            </button>
          </div>

          <table className="w-full text-xs border">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2">Subject</th>
                <th className="p-2">Description</th>
                <th className="p-2">Edited By</th>
                <th className="p-2">Edited At</th>
              </tr>
            </thead>

            <tbody>
              {historyData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-slate-400">
                    No history available
                  </td>
                </tr>
              ) : (
                historyData.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="p-2">{h.subject}</td>
                    <td className="p-2 whitespace-pre-wrap">{h.description}</td>
                    <td className="p-2">{h.edited_by}</td>
                    <td className="p-2">
                      {new Date(h.edited_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>
    )}

  </div>
);
   
};

const InfoRow = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-700 break-words">{value}</p>
  </div>
);



export default LeadDetails;
