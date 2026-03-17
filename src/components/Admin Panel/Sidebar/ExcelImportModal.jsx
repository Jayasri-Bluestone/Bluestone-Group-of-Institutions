import React, { useState, useEffect } from "react";
import { X, FileSpreadsheet, AlertCircle, CheckCircle2, Upload, Loader2, Table } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";

const ExcelImportModal = ({ isOpen, onClose, user, domains, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [targetDomain, setTargetDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (user?.domain && domains.length > 0) {
      const userFirstDomain = user.domain.split(",")[0].trim();
      const match = domains.find(d => d.name.toLowerCase().includes(userFirstDomain.toLowerCase()));
      if (match) setTargetDomain(match.name);
      else if (domains.length > 0) setTargetDomain(domains[0].name);
    }
  }, [user, domains, isOpen]);


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        
        // Normalize fields
        const normalized = jsonData.map(row => ({
          student_name: row.Name || row.student_name || row["Candidate Name"] || "",
          email: row.Email || row.email || "",
          phone: row.Phone || row.phone || row["Phone Number"] || "",
          category: row.Category || row.category || "",
          interested_in: row.Interest || row.interested_in || row["Business Focus"] || "",
          remarks: row.Remarks || row.remarks || "",
          source: row.Source || row.source || "Bulk Import",
          assigned_to: null,
          assigned_to_name: "",
          isValid: !!(row.Name || row.student_name || row["Candidate Name"]) && !!(row.Phone || row.phone || row["Phone Number"])
        }));

        setData(normalized);
        setLoading(false);
      } catch (err) {
        console.error("Excel parse error:", err);
        toast.error("Failed to parse Excel file");
        setLoading(false);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (!targetDomain) {
      toast.error("Please select a target domain");
      return;
    }

    const getTier = (u) => {
      if (u?.tier) return u.tier;
      if (["Main Admin", "MD", "GM"].includes(u?.role)) return "SUPER_ADMIN";
      if (["TL", "Coordinator", "Head"].includes(u?.role)) return "ADMIN";
      return "STAFF";
    };
    const isStaff = getTier(user) === "STAFF";

    const validLeads = data.filter(l => l.isValid).map(l => {
      return {
        ...l,
        domain: targetDomain,
        assigned_to: isStaff ? user.id : null,
        assigned_to_name: isStaff ? user.name : null,
        assigned_by: user.id,
        assigned_by_name: user.name
      };
    });

    if (validLeads.length === 0) {
      toast.error("No valid leads to import");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/leads/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ leads: validLeads }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`Successfully imported ${result.count} leads`);
        onSuccess?.();
        onClose();
      } else {
        const error = await res.json();
        toast.error(error.error || "Import failed");
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Server error during import");
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  const validCount = data.filter(l => l.isValid).length;
  const invalidCount = data.length - validCount;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Bulk Import Leads</h2>
              <p className="text-xs text-slate-500 font-medium">Upload Excel file to add multiple leads at once</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
          {importing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center max-w-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-emerald-100 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <Upload className="absolute inset-0 m-auto text-emerald-500" size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Importing Leads...</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  We are processing your Excel data and adding <span className="text-emerald-600 font-bold">{validCount}</span> leads to <span className="text-emerald-600 font-bold">{targetDomain}</span>. 
                  Please do not close this window.
                </p>
                <div className="w-full mt-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-pulse w-full rounded-full" />
                </div>
              </div>
            </div>
          )}

          {!file ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileSpreadsheet size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-bold">Click or drag Excel file here</p>
              <p className="text-slate-400 text-xs mt-1">Supports .xlsx and .xls formats</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Domain & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Domain</label>
                  <select
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  >
                    <option value="">Select Domain</option>
                    {domains.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 items-end">
                    <div className="flex-1 bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
                        <p className="text-[10px] font-black text-emerald-600 uppercase">Valid</p>
                        <p className="text-xl font-black text-emerald-700">{validCount}</p>
                    </div>
                    <div className="flex-1 bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                        <p className="text-[10px] font-black text-red-600 uppercase">Invalid</p>
                        <p className="text-xl font-black text-red-700">{invalidCount}</p>
                    </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="bg-slate-50 p-3 border-b flex items-center gap-2">
                  <Table size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Preview</span>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-white shadow-sm">
                      <tr className="border-b border-slate-100">
                        <th className="p-3 font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="p-3 font-bold text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="p-3 font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                        <th className="p-3 font-bold text-slate-400 uppercase tracking-wider">Email</th>
                         <th className="p-3 font-bold text-slate-400 uppercase tracking-wider">Source</th>
                         <th className="p-3 font-bold text-slate-400 uppercase tracking-wider">Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center">
                            <Loader2 size={24} className="mx-auto animate-spin text-emerald-500 mb-2" />
                            <p className="text-slate-400 italic">Parsing file...</p>
                          </td>
                        </tr>
                      ) : data.length > 0 ? (
                        data.map((row, idx) => (
                          <tr key={idx} className={row.isValid ? "hover:bg-slate-50" : "bg-red-50/50"}>
                            <td className="p-3">
                              {row.isValid ? (
                                <CheckCircle2 size={16} className="text-emerald-500" />
                              ) : (
                                <AlertCircle size={16} className="text-red-500" title="Missing Name or Phone" />
                              )}
                            </td>
                            <td className="p-3 font-bold text-slate-700">{row.student_name || <span className="text-red-400 italic font-normal">Missing</span>}</td>
                            <td className="p-3 text-slate-600">{row.phone || <span className="text-red-400 italic">Missing</span>}</td>
                            <td className="p-3 text-slate-600">{row.email || "-"}</td>
                            <td className="p-3 text-slate-600">
                              <input 
                                type="text"
                                value={row.source}
                                onChange={(e) => {
                                  const newData = [...data];
                                  newData[idx].source = e.target.value;
                                  setData(newData);
                                }}
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 focus:outline-none py-1"
                              />
                            </td>
                            <td className="p-3 text-slate-600">{row.interested_in || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400 italic">No data found in file</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
          <button 
            onClick={() => { setFile(null); setData([]); }}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            disabled={!file || importing}
          >
            Reset File
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
              disabled={importing}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || validCount === 0 || importing || !targetDomain}
              className="px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${validCount} Leads`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportModal;
