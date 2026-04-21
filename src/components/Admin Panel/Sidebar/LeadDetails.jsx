import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { RefreshCcw, ChevronUp, Plus, ChevronDown, MessageSquare, User, PenTool, CreditCard, ChevronRight, Mail, FileText, UploadCloud, CheckCircle2, XCircle, Clock, Eye, Trash2, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "../Layout/LoadingScreen";
import { formatToLocalDateTime, parseAsIST } from "../../../utils/timeUtils";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";
import { confirmToast } from "../../../utils/toastConfirm";
import Pagination from "../Layout/Pagination";

const DocPercentageCircle = ({ percentage }) => {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  let colorClass = "stroke-rose-500";
  let borderClass = "border-rose-100";
  let bgClass = "bg-rose-50";
  let textColor = "text-rose-700";
  
  if (percentage === 100) {
    colorClass = "stroke-emerald-500";
    borderClass = "border-emerald-100";
    bgClass = "bg-emerald-50";
    textColor = "text-emerald-700";
  } else if (percentage >= 50) {
    colorClass = "stroke-amber-500";
    borderClass = "border-amber-100";
    bgClass = "bg-amber-50";
    textColor = "text-amber-700";
  } else if (percentage > 0) {
    colorClass = "stroke-orange-500";
    borderClass = "border-orange-100";
    bgClass = "bg-orange-50";
    textColor = "text-orange-700";
  }

  return (
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${borderClass} ${bgClass} shadow-sm group transition-all hover:scale-105`}>
      <svg className="w-8 h-8 transform -rotate-90">
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-slate-100"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx="16"
          cy="16"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={`${colorClass}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-[8px] font-black ${textColor}`}>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

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
  const [managedEmails, setManagedEmails] = useState([]);
  
  // Visibility States
  // Visibility States (Accordion Layout)
  const [expandedSection, setExpandedSection] = useState('message'); // 'message', 'profile', 'remarks', 'payments' or null
  const [docStats, setDocStats] = useState({ total: 0, uploaded: 0, percentage: 0 });


  const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust
  const recipientPrefKey = `remark_default_recipients_${user?.id || "guest"}`;

  const canEditPayments = isAdminTier || getTier(user) === "STAFF";
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageDraft, setMessageDraft] = useState({
    ref_id: "",
    subject: "",
    description: "",
    attachmentType: "",
    includeCandidateBCC: true,
    recipientUserIds: [],
    systemRecipientIds: [],
    primarySystemEmailId: ""
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

  const fetchManagedEmails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/system-emails`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setManagedEmails(Array.isArray(json) ? json.filter(e => Number(e.is_active) === 1) : []);
    } catch {
      setManagedEmails([]);
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
      await Promise.all([fetchRemarkMessages(), fetchDomainStaff(), fetchManagedEmails()]);
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

      const refundStatuses = ['Partial refund', 'Fully refund', 'No refund', 'Refund pending'];
      const isDropped = json.status === "Dropped";
      let initialPayStatus = json.payment_status || (isDropped ? "Refund pending" : "Pending payment");

      // If dropped but current status matches active categories, default to Refund pending
      if (isDropped && !refundStatuses.includes(initialPayStatus)) {
          initialPayStatus = "Refund pending";
      }

      setPaymentDraft({
        payment_status: initialPayStatus,
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
    if (!(await confirmToast("Save lead remarks?", "Save"))) return;
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
    if (!(await confirmToast("Save payment updates?", "Save"))) return;
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
      
      const refundStatuses = ['Partial refund', 'Fully refund', 'No refund', 'Refund pending'];
      const nextStatus = (paymentDraft.payment_status !== 'Pending payment' && !refundStatuses.includes(paymentDraft.payment_status)) 
        ? 'Enrolled' 
        : lead.status;

      setLead((prev) => (prev ? { ...prev, ...paymentDraft, status: nextStatus } : prev));
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

  const toggleSystemRecipient = (id) => {
    const idNum = Number(id);
    setMessageDraft((prev) => {
      const exists = (prev.systemRecipientIds || []).includes(idNum);
      return {
        ...prev,
        systemRecipientIds: exists
          ? prev.systemRecipientIds.filter((i) => i !== idNum)
          : [...(prev.systemRecipientIds || []), idNum],
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
    const label = sendMail ? "Save and Send" : "Save Only";
    if (!(await confirmToast(`${label} this message?`))) {
      setIsSendingMessage(false);
      return;
    }
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
        systemRecipientIds: messageDraft.systemRecipientIds,
        primaryRecipientId: messageDraft.primarySystemEmailId,
        includeCandidateCC: messageDraft.includeCandidateBCC,
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
        systemRecipientIds: [],
        primarySystemEmailId: "",
        includeCandidateBCC: true,
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
      systemRecipientIds: [],
      primarySystemEmailId: "",
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

  const SectionHeader = ({ title, id, currentExpanded, setExpanded, icon: Icon, color = "text-slate-400", rightElement }) => {
    const isExpanded = currentExpanded === id;
    return (
        <button 
            className={`w-full flex items-center justify-between p-5 text-left transition-all duration-300 border-none outline-none group
              ${isExpanded ? "bg-slate-50/80" : "bg-white hover:bg-slate-50/50"}
            `}
            onClick={() => setExpanded(isExpanded ? null : id)}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${isExpanded ? `bg-white shadow-sm ${color}` : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-sm"}`}>
                    <Icon size={20} strokeWidth={isExpanded ? 2.5 : 2} />
                </div>
                <div>
                    <h3 className={`text-base transition-all duration-300 ${isExpanded ? "font-bold text-slate-900" : "font-semibold text-slate-600 tracking-tight"}`}>
                        {title}
                    </h3>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {rightElement}
                <div className={`transition-all duration-500 rounded-full p-1 ${isExpanded ? "bg-slate-200/50 text-slate-900 rotate-180" : "bg-transparent text-slate-300 group-hover:text-slate-400"}`}>
                    <ChevronDown size={20} />
                </div>
            </div>
        </button>
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header (Static) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lead Information</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
              {lead.lead_code || `#${lead.id}`}
            </span>
            <span className="text-sm font-semibold text-slate-400">•</span>
            <span className="text-sm font-semibold text-slate-600">{lead.student_name}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/portal/domain/${slug}`)}
          className="px-5 py-2.5 text-xs font-bold rounded-xl bg-white text-slate-700 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm flex items-center gap-2"
        >
          <ChevronRight size={14} className="rotate-180" />
          Back To Domain
        </button>
      </div>

      {/* 2. Unified Accordion List (FAQ Style) */}
      <div className="bg-white rounded-2xl border border-slate-200 uppercase overflow-hidden shadow-sm divide-y divide-slate-100">
        
        {/* Section: Message Log */}
        <div className="overflow-hidden uppercase">
          <SectionHeader 
              title="Update Remarks & Send Mail" 
              id="message"
              currentExpanded={expandedSection}
              setExpanded={setExpandedSection}
              icon={MessageSquare}
              color="text-blue-600"
          />
          <AnimatePresence>
            {expandedSection === 'message' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-6">
                  <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Communication History</p>
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
                          {formatToLocalDateTime(m.created_at)}
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
                    <label className="text-[9px] font-black text-slate-400 ml-1">Recipient (Primary)</label>
                    <input value="bluestoneocs@gmail.com" disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-100 text-slate-500 font-bold" />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setMessageDraft(prev => ({ ...prev, includeCandidateBCC: !prev.includeCandidateBCC }))}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${messageDraft.includeCandidateBCC ? "bg-blue-500" : "bg-slate-200"}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${messageDraft.includeCandidateBCC ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-700">BCC Candidate</span>
                        <span className="text-[9px] font-medium text-slate-400 lowercase">{lead.email || "No email available"}</span>
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
                        <p className="text-[9px] text-red-600 mt-2 font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded inline-block">
                        ✓ ATTACHED: {messageDraft.attachmentName}
                        </p>
                    )}
                </div>

                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <p className="bg-rose-50 p-2 text-[9px] font-black text-rose-600 uppercase tracking-widest border-b border-rose-100 flex items-center gap-2">
                        <Mail size={10} /> Primary Recipient (Managed List)
                    </p>
                    <div className="p-3">
                        <select
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 bg-slate-50 focus:ring-4 ring-rose-500/5 outline-none transition-all cursor-pointer"
                            value={messageDraft.primarySystemEmailId}
                            onChange={(e) => setMessageDraft(prev => ({ ...prev, primarySystemEmailId: e.target.value }))}
                        >
                            <option value="">Default (bluestoneocs@gmail.com)</option>
                            {managedEmails.map(m => (
                                <option key={m.id} value={m.id}>{m.label} ({m.email})</option>
                            ))}
                        </select>
                        <p className="text-[9px] text-slate-400 mt-2 ml-1 font-medium italic">* Selected ID will be set as the main 'To' recipient</p>
                    </div>
                </div>

                {managedEmails.length > 0 && (
                    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                        <p className="bg-slate-50 p-2 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 flex items-center gap-2">
                            <Plus size={10} /> Add Additional System CCs
                        </p>
                        <div className="p-2 flex flex-wrap gap-2">
                            {managedEmails
                                .filter(m => String(m.id) !== String(messageDraft.primarySystemEmailId))
                                .map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => toggleSystemRecipient(m.id)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${
                                        (messageDraft.systemRecipientIds || []).includes(m.id)
                                        ? "bg-slate-800 border-slate-800 text-white shadow-md shadow-slate-200"
                                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                                    }`}
                                >
                                    {m.label} {(messageDraft.systemRecipientIds || []).includes(m.id) && "✓"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <p className="bg-slate-50 p-2 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Recipient Selection (Staff/Admins CC)</p>
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
                                <td className="p-2 text-slate-400 italic font-medium lowercase">{s.email || "-"}</td>
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
        </motion.div>
      )}
    </AnimatePresence>
  </div>

        {/* Section: Candidate Profile */}
        <div className="overflow-hidden">
          <SectionHeader 
            title="Candidate Profile Details" 
            id="profile"
            currentExpanded={expandedSection}
            setExpanded={setExpandedSection}
            icon={User} 
            color="text-red-600"
          />
          <AnimatePresence>
            {expandedSection === 'profile' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                  <InfoRow label="Name" value={lead.student_name || "N/A"} />
                  <InfoRow label="Phone" value={lead.phone || "N/A"} />
                  <InfoRow label="Email" value={lead.email || "N/A"} />
                  <InfoRow label="Domain" value={lead.domain || "N/A"} />
                  <InfoRow label="Interest" value={lead.interested_in || "General Enquiry"} />
                  <InfoRow label="Source" value={lead.source || "Direct / Organic"} />
                  <InfoRow label="Status" value={lead.status || "New"} />
                  <InfoRow label="Assigned" value={lead.assigned_to_name || "Unassigned"} />
                  <InfoRow label="Manager" value={lead.assigned_by_name || "System Admin"} />
                  <InfoRow label="Created" value={formatToLocalDateTime(lead.created_at)} />
                  <InfoRow label="Updated" value={formatToLocalDateTime(lead.updated_at)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section: Remarks */}
        <div className="overflow-hidden">
          <SectionHeader 
            title="Initial Remarks" 
            id="remarks"
            currentExpanded={expandedSection}
            setExpanded={setExpandedSection}
            icon={PenTool} 
            color="text-red-600"
          />
          <AnimatePresence>
            {expandedSection === 'remarks' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-8 pt-2 space-y-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Finalized System Remarks</p>
                  <textarea
                    value={remarksDraft}
                    onChange={(e) => setRemarksDraft(e.target.value)}
                    readOnly={!!lead.remarks}
                    className={`w-full min-h-[140px] p-5 text-sm border-2 rounded-2xl outline-none transition-all font-medium leading-relaxed 
                      ${!!lead.remarks 
                        ? "bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed select-none" 
                        : "bg-slate-50/50 border-slate-100 focus:ring-4 ring-amber-500/10 focus:border-amber-500/20"
                      }
                    `}
                    placeholder={!!lead.remarks ? "No initial remarks set" : "Enter the primary system record for this lead..."}
                  />
                  {!lead.remarks && (
                    <button
                      onClick={saveRemarks}
                      className="px-8 py-3 text-[10px] font-bold rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                    >
                      Lock & Save Initial Remarks
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section: Payments */}
        <div className="overflow-hidden border-b-0!">
          <SectionHeader 
            title="Enrollment & Financial Details" 
            id="payments"
            currentExpanded={expandedSection}
            setExpanded={setExpandedSection}
            icon={CreditCard} 
            color="text-red-600"
          />
          <AnimatePresence>
            {expandedSection === 'payments' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-8 pt-2 space-y-6">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Fee Tracking Console</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Payment Status</label>
                      <select
                          disabled={!canEditPayments}
                          value={paymentDraft.payment_status}
                          onChange={(e) => setPaymentDraft((prev) => ({ ...prev, payment_status: e.target.value }))}
                          className={`w-full border rounded-xl px-4 py-4 text-sm font-bold shadow-sm transition-all ${canEditPayments ? "bg-white border-slate-200 hover:border-slate-300 outline-none focus:ring-4 ring-rose-500/5" : "bg-slate-100 text-slate-500 cursor-not-allowed border-transparent"}`}
                      >
                          {lead.status === "Dropped" ? (
                            <>
                              <option value="Partial refund">PARTIAL REFUND</option>
                              <option value="Fully refund">FULLY REFUND</option>
                              <option value="No refund">NO REFUND</option>
                              <option value="Refund pending">REFUND PENDING</option>
                            </>
                          ) : (
                            <>
                              <option value="Advance payment">ADVANCE PAYMENT</option>
                              <option value="Partial Payment">PARTIAL PAYMENT</option>
                              <option value="Full payment">FULL PAYMENT</option>
                              <option value="No Fee">NO FEE</option>
                              <option value="Pending payment">PENDING PAYMENT</option>
                            </>
                          )}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Total Course Fee</label>
                      <input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={!canEditPayments}
                          value={paymentDraft.total_fees}
                          onChange={(e) => setPaymentDraft((prev) => ({ ...prev, total_fees: e.target.value }))}
                          className={`w-full border rounded-xl px-4 py-4 text-sm font-bold shadow-sm transition-all ${canEditPayments ? "bg-white border-slate-200 hover:border-slate-300 outline-none focus:ring-4 ring-rose-500/5" : "bg-slate-100 text-slate-500 cursor-not-allowed border-transparent"}`}
                          placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Total Paid Amount</label>
                      <input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={!canEditPayments}
                          value={paymentDraft.paid_amount}
                          onChange={(e) => setPaymentDraft((prev) => ({ ...prev, paid_amount: e.target.value }))}
                          className={`w-full border rounded-xl px-4 py-4 text-sm font-bold shadow-sm transition-all ${canEditPayments ? "bg-white border-slate-200 hover:border-slate-300 outline-none focus:ring-4 ring-rose-500/5" : "bg-slate-100 text-slate-500 cursor-not-allowed border-transparent"}`}
                          placeholder="0.00"
                      />
                    </div>
                  </div>
                  {canEditPayments && (
                    <button
                      onClick={savePayment}
                      className="w-full py-4 text-[10px] font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-98 uppercase tracking-widest"
                    >
                      Update Financial Details
                    </button>
                  )}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* Section: Documents */}
        <div className="overflow-hidden">
          <SectionHeader 
            title="Candidate Document Management" 
            id="documents"
            currentExpanded={expandedSection}
            setExpanded={setExpandedSection}
            icon={FileText} 
            color="text-emerald-600"
            rightElement={docStats.total > 0 && <DocPercentageCircle percentage={docStats.percentage} />}
          />
          <AnimatePresence>
            {expandedSection === 'documents' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <DocumentManager 
                  leadId={leadId} 
                  isAdminTier={isAdminTier} 
                  onStatsUpdate={setDocStats} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
                          {formatToLocalDateTime(h.edited_at)}
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
  <div className="p-2 border border-slate-50 rounded-lg hover:bg-slate-50 transition-colors">
    <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5 tracking-tighter">{label}</p>
    <p className="text-xs font-bold text-slate-700 truncate" title={value}>{value}</p>
  </div>
);

const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;
  const isPDF = file.type.toLowerCase() === 'pdf' || file.url.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative border border-white/20">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{file.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Document Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(file.url, '_blank')}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Open in new tab
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-50 p-8 overflow-auto flex items-center justify-center">
          {isPDF ? (
            <iframe 
              src={`${file.url}#toolbar=0`} 
              className="w-full h-full rounded-xl shadow-inner border border-slate-200"
              title="PDF Preview"
            />
          ) : (
            <img 
              src={file.url} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white p-2 bg-white"
            />
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Bluestone Secure Document Viewer</p>
        </div>
      </div>
    </div>
  );
};

const DocRow = ({ req, upload, onUpload, onDelete, onCheck, uploading, isAdminTier, onPreview }) => {
  const statusColors = {
    'Pending': 'bg-slate-100 text-slate-500',
    'Collected': 'bg-amber-100 text-amber-600',
    'Uploaded': 'bg-blue-100 text-blue-600',
    'Verified': 'bg-emerald-100 text-emerald-600',
    'Rejected': 'bg-rose-100 text-rose-600'
  };

  const handleDownload = async (path, filename) => {
    try {
      const response = await fetch(`${API_BASE_URL_PORTAL}/${path}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${upload ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
            <FileText size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p 
              className={`text-xs font-bold truncate ${upload ? 'text-emerald-600 hover:underline cursor-pointer' : 'text-slate-700'}`}
              onClick={() => upload && window.open(`${API_BASE_URL_PORTAL}/${upload.file_path}`, '_blank')}
            >
              {req.document_name}
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-tighter font-bold">{req.level} Requirement</p>
          </div>
        </div>
      </td>
      <td className="p-4 text-center">
        {req.id && (
          <input 
            type="checkbox"
            checked={!!upload}
            onChange={() => !uploading && onCheck(req.id, req.document_name)}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-all hover:scale-110"
            title="Mark as Received/Collected"
            disabled={uploading || (upload && upload.status !== 'Collected')}
          />
        )}
      </td>
      <td className="p-4">
        {req.is_mandatory ? (
          <span className="text-[8px] font-black uppercase bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded border border-rose-100">Mandatory</span>
        ) : (
          <span className="text-[8px] font-black uppercase bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100">Optional</span>
        )}
      </td>
      <td className="p-4">
        <div className={`inline-flex px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[upload?.status === 'Collected' ? 'Pending' : (upload?.status || 'Pending')]}`}>
          {upload?.status === 'Collected' ? 'Pending' : (upload?.status || 'Pending')}
        </div>
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {upload && (
            <>
              <button 
                onClick={() => onPreview({ url: `${API_BASE_URL_PORTAL}/${upload.file_path}`, name: upload.document_name, type: upload.file_path.split('.').pop() })}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="View"
              >
                <Eye size={14} />
              </button>
              <button 
                onClick={() => handleDownload(upload.file_path, upload.document_name)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                title="Download"
              >
                <Download size={14} />
              </button>
              <button 
                onClick={() => onDelete(upload.id)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

          <label className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-white hover:bg-black shadow-sm'}`}>
            <UploadCloud size={12} />
            {uploading ? 'UP...' : (upload ? 'Update' : 'Upload')}
            <input 
              type="file" 
              className="hidden" 
              disabled={uploading} 
              accept="application/pdf,image/*" 
              onChange={(e) => onUpload(e, req.id, req.document_name)} 
            />
          </label>
        </div>
      </td>
    </tr>
  );
};

const DocumentManager = ({ leadId, isAdminTier, onStatsUpdate }) => {
  const [data, setData] = useState({ requirements: [], uploads: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [docPage, setDocPage] = useState(1);
  const [docItemsPerPage, setDocItemsPerPage] = useState(5);
  const [docItemsPerPageValue, setDocItemsPerPageValue] = useState(5);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/document-requirements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);

        // Calculate stats for percentage circle
        const total = json.requirements.length;
        const uploadedCount = json.requirements.filter(req => 
          json.uploads.some(u => u.requirement_id === req.id)
        ).length;
        const percentage = total > 0 ? (uploadedCount / total) * 100 : 0;
        
        if (onStatsUpdate) {
          onStatsUpdate({ total, uploaded: uploadedCount, percentage });
        }
      }
    } catch { toast.error("Failed to load documents"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, [leadId]);

  const toggleChecklist = async (requirementId, docName) => {
    if (!(await confirmToast(`Update checklist for ${docName}?`, "Update"))) return;
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/documents/checklist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ requirementId, documentName: docName })
      });
      if (res.ok) {
        toast.success("Checklist updated");
        fetchDocs();
      }
    } catch { toast.error("Error updating checklist"); }
  };

  const handleUpload = async (e, requirementId, docName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!(await confirmToast(`Upload "${file.name}" as ${docName}?`, "Upload"))) return;

    // Client-side validation
    const maxSizeBytes = 1024 * 1024; // 1 MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSizeBytes) {
      toast.error("File size exceeds 1 MB limit");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PDF and images are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentName", docName);
    if (requirementId) formData.append("requirementId", requirementId);

    setUploading(requirementId || docName);
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });
      if (res.ok) {
        toast.success("Uploaded successfully");
        fetchDocs();
      } else {
        const errorData = await res.json();
        toast.error(errorData.msg || "Upload failed");
      }
    } catch { toast.error("Error uploading file"); }
    finally { setUploading(null); }
  };

  const updateStatus = async (docId, status) => {
    if (!(await confirmToast(`Change status to ${status}?`, "Change"))) return;
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/documents/${docId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        fetchDocs();
      }
    } catch { toast.error("Failed to update status"); }
  };

  const deleteDoc = async (docId) => {
    if (!(await confirmToast("Delete this document?", "Delete"))) return;
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/${leadId}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Deleted");
        fetchDocs();
      }
    } catch { toast.error("Delete failed"); }
  };

  const allDocs = [
    ...data.requirements.map(req => ({
      id: `req-${req.id}`,
      req,
      upload: data.uploads.find(u => u.requirement_id === req.id),
      onCheck: toggleChecklist,
      uploading: uploading === req.id
    })),
    ...data.uploads.filter(u => !u.requirement_id).map(u => ({
      id: `extra-${u.id}`,
      req: { document_name: u.document_name, is_mandatory: 0, level: 'Ad-hoc' },
      upload: u,
      onCheck: () => {},
      uploading: uploading === u.document_name
    }))
  ];

  const docTotalPages = Math.max(Math.ceil(allDocs.length / docItemsPerPage), 1);
  const docIndexOfLast = docPage * docItemsPerPage;
  const docIndexOfFirst = docIndexOfLast - docItemsPerPage;
  const currentDocs = allDocs.slice(docIndexOfFirst, docIndexOfLast);

  useEffect(() => {
    if (docItemsPerPageValue === 'all') {
      setDocItemsPerPage(Math.max(allDocs.length, 1));
    }
  }, [allDocs.length, docItemsPerPageValue]);

  if (loading) return <div className="p-10 text-center text-xs text-slate-400 uppercase font-black tracking-widest animate-pulse">Checking checklist...</div>;

  return (
    <div className="p-6 pt-0 space-y-4">
      {/* Pagination Info & Page Size Selector */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Show</span>
          <select
            className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none hover:border-blue-400 focus:border-blue-500 transition-colors cursor-pointer shadow-sm"
            value={docItemsPerPageValue}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              setDocItemsPerPageValue(val);
              if (val !== 'all') setDocItemsPerPage(val);
              setDocPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
          <span>Entries</span>
          <span className="text-slate-100 mx-1">|</span>
          <span className="text-slate-500 font-bold">
            Showing {allDocs.length === 0 ? 0 : docIndexOfFirst + 1} to {Math.min(docIndexOfLast, allDocs.length)} of {allDocs.length} Docs
          </span>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] uppercase text-slate-500 font-black tracking-widest">
              <th className="p-4">Document Details</th>
              <th className="p-4 text-center">Handed Over</th>
              <th className="p-4">Type</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentDocs.map(doc => (
              <DocRow 
                key={doc.id} 
                req={doc.req} 
                upload={doc.upload} 
                onUpload={handleUpload}
                onDelete={deleteDoc}
                onCheck={doc.onCheck}
                uploading={doc.uploading}
                isAdminTier={isAdminTier}
                onPreview={setPreviewFile}
              />
            ))}
          </tbody>
        </table>

        {allDocs.length === 0 && (
          <div className="text-center py-16 bg-white italic">
            <FileText className="mx-auto mb-3 text-slate-200" size={40} />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Documents Found</p>
            <p className="text-[9px] text-slate-300">Requirements are pulled from Master Management settings.</p>
          </div>
        )}
      </div>

      {/* Pagination Component */}
      {allDocs.length > 0 && (
        <div className="pt-2">
          <Pagination
            stats={{ currentPage: docPage, totalPages: docTotalPages }}
            onPageChange={(newPage) => setDocPage(newPage)}
            pageSize={docItemsPerPage}
            pageSizeValue={docItemsPerPageValue}
            onPageSizeChange={(val) => {
              setDocItemsPerPageValue(val);
              if (val !== 'all') setDocItemsPerPage(val);
              setDocPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50, 'all']}
          />
        </div>
      )}

      {previewFile && (
        <FilePreviewModal 
          file={previewFile} 
          onClose={() => setPreviewFile(null)} 
        />
      )}
    </div>
  );
};

export default LeadDetails;
