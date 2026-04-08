import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { RefreshCcw, ChevronUp, ChevronDown, MessageSquare, User, PenTool, CreditCard } from "lucide-react";
import LoadingScreen from "../Layout/LoadingScreen";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";
import { confirmToast } from "../../../utils/toastConfirm";

const LeadDetails = ({ user }) => {
  const getTier = (u) => {
    if (u?.tier) return u.tier;
    const r = u?.role || "";
    if (["Main Admin", "MD", "GM", "Super Admin"].includes(r)) return "SUPER_ADMIN";
    if (["TL", "Coordinator", "Head", "Admin"].includes(r)) return "ADMIN";
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
  const [historyData, setHistoryData] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Visibility States
  // Visibility States (Accordion Layout)
  const [expandedSection, setExpandedSection] = useState('message'); // 'message', 'profile', 'remarks', 'payments' or null


  const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust
  const recipientPrefKey = `remark_default_recipients_${user?.id || "guest"}`;

  const canEditPayments = isAdminTier || getTier(user) === "STAFF";
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
      toast.success("Remark saved", { id: tid, duration: 3000 });
      setLead((prev) => (prev ? { ...prev, remarks: remarksDraft } : prev));
    } catch {
      toast.error("Save failed", { id: tid, duration: 4000 });
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
      toast.success("Payment details updated", { id: tid, duration: 3000 });
      setLead((prev) => (prev ? { ...prev, ...paymentDraft, status: "Enrolled" } : prev));
    } catch (err) {
      toast.error(err.message || "Save failed", { id: tid, duration: 4000 });
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

  const saveAndSendMessage = async (sendMail = true) => {
    if (
      !String(messageDraft.ref_id).trim() ||
      !messageDraft.subject.trim() ||
      !messageDraft.description.trim()
    ) {
      toast.error("Ref ID, Subject and Description are required");
      return;
    }
    if (isSendingMessage) return;

    setIsSendingMessage(true);
    const tid = toast.loading(sendMail ? "Saving and sending..." : "Saving message...");

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
        attachment_type: messageDraft.attachmentType,
        send_mail: sendMail
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
        toast.error(json.msg || json.error || "Save/Send failed", { id: tid, duration: 4000 });
        return;
      }

      toast.success(sendMail ? "Message sent successfully" : "Message saved successfully", { id: tid, duration: 3000 });

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
      toast.error("Process failed", { id: tid, duration: 4000 });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const startEditMessage = (message) => {
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

    // Default active user if not already in stored list
    if (user?.id && !storedIds.includes(Number(user.id))) {
      storedIds.push(Number(user.id));
    }

    // Apply only users available in current lead domain staff list.
    const allowed = new Set(domainStaff.map((s) => Number(s.id)));
    const applicableIds = storedIds.filter((id) => allowed.has(id));

    setMessageDraft({
      ref_id: lead.lead_code || lead.id || "",
      subject: message.subject || "",
      description: message.description || "",
      recipientUserIds: applicableIds,
      attachment: message.attachment_base64 || null,
      attachmentName: message.attachment_name || "",
      attachmentType: message.attachment_type || ""
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

    // Default active user if not already in stored list
    if (user?.id && !storedIds.includes(Number(user.id))) {
      storedIds.push(Number(user.id));
    }

    // Apply only users available in current lead domain staff list.
    const allowed = new Set(domainStaff.map((s) => Number(s.id)));
    const applicableIds = storedIds.filter((id) => allowed.has(id));

    setMessageDraft((prev) => ({ ...prev, recipientUserIds: applicableIds }));
  }, [domainStaff, editingMessageId, recipientPrefKey, user?.id]);

  const deleteMessage = async (messageId) => {
    if (!(await confirmToast("Are you sure you want to delete this message?"))) {
      return;
    }
    const tid = toast.loading("Deleting message...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/remark-messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.msg || json.error || "Delete failed");
      toast.success("Message deleted", { id: tid, duration: 3000 });
      if (editingMessageId === messageId) {
        setEditingMessageId(null);
        setShowAddMessage(false);
      }
      await fetchRemarkMessages();
    } catch (err) {
      toast.error(err.message || "Delete failed", { id: tid, duration: 4000 });
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

  const SectionHeader = ({ title, id, currentExpanded, setExpanded, icon: Icon, color = "text-slate-400" }) => {
    const isExpanded = currentExpanded === id;
    return (
        <div 
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between group cursor-pointer hover:border-slate-300 transition-all shadow-sm"
            onClick={() => setExpanded(isExpanded ? null : id)}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</h3>
                </div>
            </div>
            <div className={`transition-all duration-300 ${isExpanded ? "text-slate-600 rotate-180" : "text-red-500"}`}>
                <ChevronDown size={25} />
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header (Static) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight tracking-tight">Lead Details</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lead.lead_code || `#${lead.id}`} • {lead.student_name}</p>
        </div>
        <button
          onClick={() => navigate(`/portal/domain/${slug}`)}
          className="px-4 py-2 text-xs font-black rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
        >
          Back To Domain
        </button>
      </div>

      {/* 2. Message Log (NOW AT THE TOP) */}
      <div className="space-y-3">
        <SectionHeader 
            title="Message Log & Activity" 
            id="message"
            currentExpanded={expandedSection}
            setExpanded={setExpandedSection}
            icon={MessageSquare}
            color="text-blue-600"
        />
        {expandedSection === 'message' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase text-slate-400">Communication History</p>
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

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-[10px] uppercase text-slate-500 font-black">
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Attachment</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Mail</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {remarkMessages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">No messages logged yet</td>
                    </tr>
                  ) : (
                    visibleMessages.map((m) => (
                      <tr key={m.id} className="border-t border-slate-100 align-top hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-slate-700">{lead.lead_code || m.ref_id || lead.id}</td>
                        <td className="p-3 font-semibold text-slate-700 whitespace-normal break-words">{m.subject}</td>
                        <td className="p-3 text-slate-600 whitespace-pre-wrap leading-relaxed">{m.description}</td>
                        <td className="p-3">
                          {m.attachment_base64 ? (
                            m.attachment_type?.startsWith("image") ? (
                              <img
                                src={m.attachment_base64}
                                alt={m.attachment_name}
                                className="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(m.attachment_base64, "_blank")}
                              />
                            ) : m.attachment_type === "application/pdf" ? (
                              <a href={m.attachment_base64} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-red-600 font-black text-[10px] bg-red-50 px-2 py-1 rounded">
                                📄 VIEW PDF
                              </a>
                            ) : (
                              <a href={m.attachment_base64} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-[10px] font-black">
                                DOWNLOAD
                              </a>
                            )
                          ) : <span className="text-slate-300 font-bold">-</span>}
                        </td>
                        <td className="p-3 text-slate-500 font-medium">
                          {new Date(m.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${m.sent_status === "SENT" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {m.sent_status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => startEditMessage(m)}
                            className="px-2 py-1 text-[9px] font-black rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors uppercase"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMessage(m.id)}
                            className="px-2 py-1 text-[9px] font-black rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors uppercase"
                          >
                            Del
                          </button>
                          <button
                            onClick={() => openHistory(m.id)}
                            className="px-2 py-1 text-[9px] font-black rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors uppercase"
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
              <div className="flex justify-center border-t border-slate-100 pt-3">
                <button
                  onClick={() => setShowAllMessages(!showAllMessages)}
                  className="px-6 py-1.5 text-[10px] font-black rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all uppercase tracking-widest"
                >
                  {showAllMessages ? "Show Less" : `View All Activity (${remarkMessages.length})`}
                </button>
              </div>
            )}

            {!!lead.remarks?.trim() && (
              <button
                onClick={() => setShowAddMessage((prev) => !prev)}
                className={`w-full py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest
                  ${showAddMessage ? "bg-slate-800 text-white shadow-inner" : "bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"}
                `}
              >
                {showAddMessage ? "× Close Message Composer" : "+ Compose & Send Message"}
              </button>
            )}

            {showAddMessage && (
              <div className="space-y-4 border border-slate-200 rounded-xl p-5 bg-slate-50 animate-in zoom-in-95 duration-300">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  {editingMessageId ? "Edit Message Console" : "New Message Console"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Ref ID</label>
                    <input value={messageDraft.ref_id} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-100 text-slate-500 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Subject</label>
                    <input
                      value={messageDraft.subject}
                      onChange={(e) => setMessageDraft((prev) => ({ ...prev, subject: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 ring-blue-500/20 outline-none transition-all"
                      placeholder="Enter subject..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Recipient</label>
                    <input value={lead.email || ""} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-100 text-slate-500 font-medium" />
                  </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Description</label>
                    <textarea
                        value={messageDraft.description}
                        onChange={(e) => setMessageDraft((prev) => ({ ...prev, description: e.target.value }))}
                        className="w-full min-h-[120px] border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 ring-blue-500/20 outline-none transition-all"
                        placeholder="Write your message detail here..."
                    />
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2 ml-1">File Attachment</p>
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
                            attachment: reader.result,
                            attachmentName: file.name,
                            attachmentType: file.type
                            }));
                        };
                        reader.readAsDataURL(file);
                        }}
                        className="text-[10px] w-full"
                    />
                    {messageDraft.attachment && (
                        <p className="text-[9px] text-emerald-600 mt-2 font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded inline-block">
                        ✓ ATTACHED: {messageDraft.attachmentName}
                        </p>
                    )}
                </div>

                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <p className="bg-slate-50 p-2 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Internal Recipients (Staff CC)</p>
                    <table className="w-full text-[10px]">
                        <tbody>
                        {domainStaff.length === 0 ? (
                            <tr><td className="p-4 text-center text-slate-400 uppercase font-bold">No domain staff linked</td></tr>
                        ) : (
                            domainStaff.map((s) => (
                            <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="p-2 text-center w-12">
                                <button
                                    type="button"
                                    onClick={() => toggleRecipient(s.id)}
                                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${messageDraft.recipientUserIds.includes(Number(s.id)) ? "bg-emerald-500" : "bg-slate-200"}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${messageDraft.recipientUserIds.includes(Number(s.id)) ? "translate-x-5" : "translate-x-1"}`} />
                                </button>
                                </td>
                                <td className="p-2 font-bold text-slate-700">{s.name}</td>
                                <td className="p-2 text-slate-500">{s.role}</td>
                                <td className="p-2 text-slate-400 italic font-medium">{s.email || "-"}</td>
                                <td className="p-2 text-slate-500">{s.domain || "-"}</td>
                            </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => saveAndSendMessage(true)}
                    disabled={isSendingMessage}
                    className={`flex-1 py-3 text-[10px] font-black rounded-xl text-white transition-all shadow-lg
                      ${isSendingMessage ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 hover:-translate-y-0.5"}
                    `}
                  >
                    {isSendingMessage ? "PROCESSING..." : editingMessageId ? "UPDATE & RE-SEND MAIL" : "SAVE & SEND MAIL"}
                  </button>
                  {editingMessageId && (
                    <button
                      onClick={() => saveAndSendMessage(false)}
                      disabled={isSendingMessage}
                      className="flex-1 py-3 text-[10px] font-black rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-50 hover:-translate-y-0.5 transition-all"
                    >
                      SAVE CHANGES (LOCAL)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Profile Details (Candidate Info) */}
      <div className="space-y-3">
        <SectionHeader 
          title="Candidate Profile Details" 
          id="profile"
          currentExpanded={expandedSection}
          setExpanded={setExpandedSection}
          icon={User} 
          color="text-emerald-600"
        />
        {expandedSection === 'profile' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
            <InfoRow label="Candidate Name" value={lead.student_name || "N/A"} />
            <InfoRow label="Contact Number" value={lead.phone || "N/A"} />
            <InfoRow label="Email Address" value={lead.email || "N/A"} />
            <InfoRow label="Assigned Domain" value={lead.domain || "N/A"} />
            <InfoRow label="Interested In" value={lead.interested_in || "General Enquiry"} />
            <InfoRow label="Lead Source" value={lead.source || "Direct / Organic"} />
            <InfoRow label="Current Status" value={lead.status || "New"} />
            <div className="col-span-2 h-[1px] bg-slate-100 my-2"></div>
            <InfoRow label="Assigned Staff" value={lead.assigned_to_name || "Unassigned"} color="text-blue-600" />
            <InfoRow label="Managed By Staff" value={lead.assigned_by_name || "System Admin"} />
            <InfoRow label="Created At" value={lead.created_at ? new Date(lead.created_at).toLocaleString() : "N/A"} />
            <InfoRow label="Latest Activity" value={lead.updated_at ? new Date(lead.updated_at).toLocaleString() : "Sync required"} />
          </div>
        )}
      </div>

      {/* 4. Remarks (Quick Notes) */}
      <div className="space-y-3">
        <SectionHeader 
          title="Quick Remarks & Internal Notes" 
          id="remarks"
          currentExpanded={expandedSection}
          setExpanded={setExpandedSection}
          icon={PenTool} 
          color="text-amber-600"
        />
        {expandedSection === 'remarks' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Global System Remarks</p>
            <textarea
              value={remarksDraft}
              onChange={(e) => setRemarksDraft(e.target.value)}
              className="w-full min-h-[120px] p-4 text-sm border border-slate-200 rounded-xl outline-none focus:ring-4 ring-amber-500/10 transition-all font-medium leading-relaxed bg-slate-50/30"
              placeholder="Add system-wide remarks here..."
            />
            <button
              onClick={saveRemarks}
              className="px-6 py-2 text-[10px] font-black rounded-lg bg-slate-800 text-white hover:bg-black transition-all shadow-lg active:scale-95 uppercase tracking-widest"
            >
              Update Global Remarks
            </button>
          </div>
        )}
      </div>

      {/* 5. Payments (Fee Details) */}
      <div className="space-y-3">
        <SectionHeader 
          title="Enrollment & Financial Details" 
          id="payments"
          currentExpanded={expandedSection}
          setExpanded={setExpandedSection}
          icon={CreditCard} 
          color="text-rose-600"
        />
        {expandedSection === 'payments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fee Tracking Console</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Payment Status</label>
                <select
                    disabled={!canEditPayments}
                    value={paymentDraft.payment_status}
                    onChange={(e) => setPaymentDraft((prev) => ({ ...prev, payment_status: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all ${canEditPayments ? "bg-white border-slate-200 hover:border-slate-300 outline-none focus:ring-4 ring-rose-500/10" : "bg-slate-100 text-slate-500 cursor-not-allowed border-transparent"}`}
                >
                    <option value="Paid">✓ FULLY PAID</option>
                    <option value="Partially Paid">⚡ PARTIALLY PAID</option>
                    <option value="Unpaid">✕ UNPAID</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Total Course Fee</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={!canEditPayments}
                    value={paymentDraft.total_fees}
                    onChange={(e) => setPaymentDraft((prev) => ({ ...prev, total_fees: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all ${canEditPayments ? "bg-white border-slate-200 hover:border-slate-300 outline-none focus:ring-4 ring-rose-500/10" : "bg-slate-100 text-slate-500 cursor-not-allowed border-transparent"}`}
                    placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Total Paid Amount</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={!canEditPayments}
                    value={paymentDraft.paid_amount}
                    onChange={(e) => setPaymentDraft((prev) => ({ ...prev, paid_amount: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all ${canEditPayments ? "bg-white border-slate-200 hover:border-slate-300 outline-none focus:ring-4 ring-rose-500/10" : "bg-slate-100 text-slate-500 cursor-not-allowed border-transparent"}`}
                    placeholder="0.00"
                />
              </div>
            </div>
            {canEditPayments && (
              <button
                onClick={savePayment}
                className="w-full py-3 text-[10px] font-black rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95 uppercase tracking-widest"
              >
                Update Enrollment Financials
              </button>
            )}
          </div>
        )}
      </div>

      {/* History Modal (Stays external to expansion logic) */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Message Version History</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit trail for tracking changes</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition-colors shadow-sm font-black">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr className="text-[9px] uppercase text-slate-500 font-black">
                    <th className="p-3 border-b">Version Detail</th>
                    <th className="p-3 border-b">Modified By</th>
                    <th className="p-3 border-b">Modified At</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-bold">NO HISTORY VERSIONS FOUND</td></tr>
                  ) : (
                    historyData.map((h, i) => (
                      <tr key={h.id || i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors align-top">
                        <td className="p-3 space-y-2">
                          <div>
                              <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Subject</p>
                              <p className="font-bold text-slate-700">{h.subject}</p>
                          </div>
                          <div className="pt-1">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Description</p>
                               <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{h.description}</p>
                          </div>
                          {h.attachment_name && (
                              <div className="pt-1 flex items-center gap-1.5 text-blue-600 font-bold text-[9px] bg-blue-50/50 p-1.5 rounded-lg w-fit">
                                  📎 {h.attachment_name}
                              </div>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="font-black text-slate-700 uppercase tracking-tighter">{h.edited_by_name || "User"}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{h.edited_by_role || "Staff"}</p>
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap tabular-nums">
                          {new Date(h.edited_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowHistory(false)} className="px-6 py-2 text-[10px] font-black rounded-xl bg-slate-800 text-white hover:bg-black transition-all uppercase tracking-widest">
                    Got it
                </button>
            </div>
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
