import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const MultiDomainDropdown = ({ domains = [], value = "", onChange }) => {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center border rounded-xl px-3 py-2 text-sm bg-white"
      >
        <span className="truncate">
          {selected.length > 0 ? selected.join(", ") : "Select Domains"}
        </span>

        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {domains.map((d) => {
            const checked = selected.includes(d.name);

            return (
              <label
                key={d.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDomain(d.name)}
                />
                {d.name}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiDomainDropdown;