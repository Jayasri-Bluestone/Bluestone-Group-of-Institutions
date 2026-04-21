import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MultiDomainDropdown = ({ domains = [], value = "", onChange, className = "" }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef();

  const selected = value
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const toggleDomain = (name) => {
    let next;
    if (selected.includes(name)) {
      next = selected.filter((d) => d !== name);
    } else {
      next = [...selected, name];
    }
    onChange(next.join(", "));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange("");
  };

  // close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredDomains = domains.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative w-full min-w-0 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full min-w-0 flex justify-between items-center border rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
          open 
            ? "bg-white border-slate-900 shadow-sm ring-4 ring-slate-900/5" 
            : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1">
          {selected.length > 0 ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
                {selected.length}
              </span>
              <span className="truncate text-slate-900">
                {selected.join(", ")}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select Domains</span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {selected.length > 0 && (
            <div 
              onClick={clearAll}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={14} />
            </div>
          )}
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-300 ${open ? "rotate-180 text-slate-900" : "text-slate-400"}`} 
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] mt-2 w-full min-w-[200px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            {domains.length > 5 && (
              <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                    type="text"
                    placeholder="Search domains..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 ring-slate-900/5 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
              {filteredDomains.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No matching domains</p>
                </div>
              ) : (
                filteredDomains.map((d) => {
                  const isChecked = selected.includes(d.name);

                  return (
                    <div
                      key={d.id}
                      onClick={() => toggleDomain(d.name)}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                        isChecked 
                          ? "bg-slate-900 text-white shadow-md" 
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                          isChecked ? "bg-white text-slate-900" : "border-2 border-slate-200"
                        }`}>
                          {isChecked && <Check size={10} strokeWidth={4} />}
                        </div>
                        <span className={`text-[11px] font-black truncate uppercase tracking-tight ${isChecked ? "text-white" : ""}`}>
                          {d.name}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiDomainDropdown;
