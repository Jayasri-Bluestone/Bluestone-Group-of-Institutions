import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Globe,
  Cpu,
  Briefcase,
  Languages,
  Trophy,
  Baby,
  Rocket,
  Search,
  UserPlus,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  Users,
  Database,
  Layers,
  Phone,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";

const Layout = ({ children, user, onLogout, onUpdateUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const fileInputRef = useRef(null);

  // UI States
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBgiMenuOpen, setIsBgiMenuOpen] = useState(
    location.pathname.startsWith("/bgi/"),
  );
  const [showProfile, setShowProfile] = useState(false);
  const [showNotiPanel, setShowNotiPanel] = useState(false);

  // Data States
  const [masterData, setMasterData] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!enquiryData.student_name.trim()) {
      errors.student_name = "Candidate name is required";
    } else if (enquiryData.student_name.length < 3) {
      errors.student_name = "Name must be at least 3 characters";
    }

    // Phone validation (exactly 10 digits for India, adjust if international)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!enquiryData.phone) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(enquiryData.phone)) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    // Email validation (optional but must be valid if entered)
    if (enquiryData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(enquiryData.email)) {
        errors.email = "Invalid email format";
      }
    }

    // Domain & Interest validation
    if (!enquiryData.domain) errors.domain = "Please select a domain";
    if (!enquiryData.interested_in)
      errors.interested_in = "Please select an interest";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Notification States
  const [selectedNotiDate, setSelectedNotiDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [visibleNotiMonth, setVisibleNotiMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [notiDateCounts, setNotiDateCounts] = useState({});
  const [liveMessage, setLiveMessage] = useState("");
  const [hasNewNoti, setHasNewNoti] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    domain: user?.domain || "",
    avatar: user?.avatar || null,
    oldPassword: "",
    newPassword: "",
  });

  const [enquiryData, setEnquiryData] = useState({
    student_name: "",
    email: "",
    phone: "",
    domain: "",
    source: "",
    interested_in: "",
    remarks: "",
  });

  // --- NOTIFICATION LOGIC (FIXED FOR MULTIPLE MESSAGES) ---
  useEffect(() => {
    const fetchNotis = async () => {
      try {
        // Use selectedNotiDate so the panel updates when the date picker changes
        const res = await fetch(
          `http://localhost:5005/api/notifications?date=${selectedNotiDate}`,
        );
        const data = await res.json();

        // Ensure data is an array before setting state
        const messages = Array.isArray(data) ? data : [];
        setNotifications(messages);

        // Set the latest message to show in the "Live Announcement" slot
        if (messages.length > 0) {
          setLiveMessage(messages[0].message);
          setHasNewNoti(true);
        } else {
          setLiveMessage("No updates for this date.");
          setHasNewNoti(false);
        }
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotis();
  }, [selectedNotiDate]); // Re-fetch when the user picks a new date

  useEffect(() => {
    const fetchCalendarBadges = async () => {
      try {
        const res = await fetch(
          `http://localhost:5005/api/notifications/calendar?month=${visibleNotiMonth}`,
        );
        if (res.ok) {
          const data = await res.json();
          const map = {};
          if (Array.isArray(data)) {
            data.forEach((row) => {
              map[row.date] = Number(row.count || 0);
            });
            setNotiDateCounts(map);
            return;
          }
        }
        throw new Error("Calendar endpoint unavailable");
      } catch (err) {
        try {
          const [year, month] = visibleNotiMonth.split("-").map(Number);
          const daysInMonth = new Date(year, month, 0).getDate();
          const requests = [];
          for (let day = 1; day <= daysInMonth; day += 1) {
            const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            requests.push(
              fetch(
                `http://localhost:5005/api/notifications?date=${dateKey}`,
              ).then(async (r) => ({
                dateKey,
                ok: r.ok,
                data: r.ok ? await r.json() : [],
              })),
            );
          }
          const results = await Promise.all(requests);
          const map = {};
          results.forEach(({ dateKey, ok, data }) => {
            if (ok && Array.isArray(data) && data.length > 0) {
              map[dateKey] = data.length;
            }
          });
          setNotiDateCounts(map);
        } catch {
          setNotiDateCounts({});
        }
      }
    };
    fetchCalendarBadges();
  }, [visibleNotiMonth]);

  useEffect(() => {
    setVisibleNotiMonth(selectedNotiDate.slice(0, 7));
  }, [selectedNotiDate]);

  // --- EXCEL IMPORT LOGIC ---
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const pathParts = location.pathname.split("/");
    const currentSlug = pathParts[pathParts.length - 1];

    const slugToDomain = {
      ias: "IAS Academy",
      techpark: "Techpark",
      overseas: "Overseas",
      placements: "Placements",
      languages: "Language Hub",
      sports: "Elite Sports",
      preschool: "Preschool",
      startup: "Startup",
    };

    const detectedDomain =
      slugToDomain[currentSlug] || user?.domain || "General";
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const leadsToUpload = data.map((row) => ({
          student_name: row.Name || row.student_name,
          email: row.Email || row.email || "",
          phone: row.Phone || row.phone,
          domain: detectedDomain,
          source: row.Source || "Bulk Import",
          interested_in: row.Interest || row.interested_in || "",
          remarks: row.Remarks || "",
        }));
        const res = await fetch("http://localhost:5005/api/leads/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ leads: leadsToUpload }),
        });
        if (res.ok)
          alert(
            `Success: ${leadsToUpload.length} leads added to ${detectedDomain}`,
          );
      } catch (err) {
        alert("Error processing Excel file.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // --- MASTER DATA & SEARCH LOGIC ---
  useEffect(() => {
    const fetchMaster = async () => {
      const res = await fetch(
        "http://localhost:5005/api/master/full-structure",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.ok) setMasterData(await res.json());
    };
    fetchMaster();
  }, [showEnquiry]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        const res = await fetch(
          `http://localhost:5005/api/search/live?q=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (res.ok) {
          setSearchResults(await res.json());
          setShowDropdown(true);
        }
      } else {
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const selectedDomain = masterData.find(
      (d) => d.name === enquiryData.domain,
    );
    setAvailableCategories(selectedDomain?.categories || []);
  }, [enquiryData.domain, masterData]);

  const getSlug = (name) => {
    const mapping = {
      "IAS Academy": "ias",
      Techpark: "techpark",
      Overseas: "overseas",
      Placements: "placements",
      "Language Hub": "languages",
      "Elite Sports": "sports",
      Preschool: "preschool",
      Startup: "startup",
    };
    return mapping[name] || name.toLowerCase().replace(/\s+/g, "-");
  };

  const getIcon = (domainName) => {
    const icons = {
      "IAS Academy": <GraduationCap size={20} />,
      Overseas: <Globe size={20} />,
      Techpark: <Cpu size={20} />,
      Placements: <Briefcase size={20} />,
      "Language Hub": <Languages size={20} />,
      "Elite Sports": <Trophy size={20} />,
      Preschool: <Baby size={20} />,
      Startup: <Rocket size={20} />,
    };
    return icons[domainName] || <Layers size={20} />;
  };

  const buildCalendarDays = (monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const startWeekday = firstDay.getDay();
    const totalDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) {
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push(dateKey);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const monthLabel = (() => {
    const [y, m] = visibleNotiMonth.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString([], {
      month: "long",
      year: "numeric",
    });
  })();

  const dynamicMenu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      visible: true,
    },
    ...masterData.map((d) => ({
      name: d.name,
      path: `/domain/${getSlug(d.name)}`,
      icon: getIcon(d.name),
      visible:
        ["MD", "GM", "Main Admin"].includes(user?.role) ||
        user?.domain === d.name,
    })),
    {
      name: "Add Notifications",
      path: "/live-feed",
      icon: <Bell size={20} />,
      visible: ["MD", "GM", "Main Admin", "TL"].includes(user?.role),
    },
    {
      name: "User Management",
      path: "/user-management",
      icon: <Users size={20} />,
      visible: user?.role === "Main Admin",
    },
    {
      name: "Master",
      path: "/master",
      icon: <Database size={20} />,
      visible: user?.role === "Main Admin",
    },
  ].filter((item) => item.visible);

  const isSuperAdmin = ["MD", "GM", "Main Admin"].includes(user?.role);
  const bgiSubMenu = [
    { name: "All Enquiry", path: "/bgi/all-enquiry" },
    { name: "Pendings", path: "/bgi/pendings" },
    { name: "Payment Status", path: "/bgi/payment-status" },
    { name: "Invalid Enquiries", path: "/bgi/invalid-enquiries" },
  ];

  useEffect(() => {
    if (location.pathname.startsWith("/bgi/")) setIsBgiMenuOpen(true);
  }, [location.pathname]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();

    // 1. Run Validation
    if (!validateForm()) {
      // Scroll to the first error or show a toast if you have one
      return;
    }

    // 2. Start Loading State
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5005/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is included
        },
        body: JSON.stringify(enquiryData),
      });

      if (res.ok) {
        alert(`Lead successfully added`);
        setShowEnquiry(false);

        // Reset form
        setEnquiryData({
          student_name: "",
          email: "",
          phone: "",
          domain: "",
          source: "",
          interested_in: "",
          remarks: "",
        });
        setValidationErrors({}); // Clear any leftover error messages
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || "Failed to add lead"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Server connection failed. Please try again.");
    } finally {
      // 3. Stop Loading State
      setIsSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const body = {
      name: profileData.name,

      phone: profileData.phone,

      avatarBase64: profileData.avatar,

      oldPassword: profileData.oldPassword,

      newPassword: profileData.newPassword,
    };

    const res = await fetch("http://localhost:5005/api/auth/profile", {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: JSON.stringify(body),
    });

    if (res.ok) {
      const json = await res.json();

      localStorage.setItem("user", JSON.stringify(json.user));

      if (onUpdateUser) onUpdateUser(json.user);

      setShowProfile(false);

      alert("Profile updated!");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-72" : "w-20"} bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shrink-0 z-50`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <span
            className={`font-bold text-white ${!isSidebarOpen && "hidden"}`}
          >
            BLUESTONE <span className="text-blue-400">GROUPS</span>
          </span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-white"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {dynamicMenu
            .filter((item) => item.path === "/dashboard")
            .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-3 transition-colors ${location.pathname === item.path ? "bg-blue-600 text-white" : "hover:bg-slate-800"}`}
            >
              <div
                className={
                  location.pathname === item.path
                    ? "text-white"
                    : "text-slate-500"
                }
              >
                {item.icon}
              </div>
              {isSidebarOpen && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          ))}

          {isSuperAdmin && (
            <div>
              <button
                onClick={() => setIsBgiMenuOpen((prev) => !prev)}
                className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${
                  location.pathname.startsWith("/bgi/")
                    ? "bg-blue-600/20 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                <div className={location.pathname.startsWith("/bgi/") ? "text-white" : "text-slate-500"}>
                  <Layers size={20} />
                </div>
                {isSidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">
                      Bluestone Group of Institutions
                    </span>
                    {isBgiMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </>
                )}
              </button>

              {isSidebarOpen && isBgiMenuOpen && (
                <div className="ml-12 mr-3 mt-1 space-y-1">
                  {bgiSubMenu.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`block px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                        location.pathname === sub.path
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {dynamicMenu
            .filter((item) => item.path !== "/dashboard")
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-3 transition-colors ${location.pathname === item.path ? "bg-blue-600 text-white" : "hover:bg-slate-800"}`}
              >
                <div
                  className={
                    location.pathname === item.path
                      ? "text-white"
                      : "text-slate-500"
                  }
                >
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="flex items-center gap-4 w-full px-4 py-3 text-slate-400 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && (
              <span className="text-sm font-bold">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 shadow-sm z-40">
          {/* SEARCH BOX */}
          <div
            className="flex items-center flex-1 max-w-md relative"
            ref={searchRef}
          >
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search globally (name & phone)"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 ring-blue-500/10 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            />
            {showDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-[100]">
                {searchResults.length > 0 ? (
                  <>
                    <div className="p-2 bg-slate-50 border-b">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                        Matching Leads
                      </p>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {searchResults.map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => {
                            navigate(`/domain/${getSlug(lead.domain)}`);
                            setShowDropdown(false);
                          }}
                          className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-0 flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                              {lead.student_name}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                              <span className="flex items-center gap-0.5">
                                <Phone size={10} /> {lead.phone}
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="uppercase text-blue-600 font-bold">
                                {lead.domain}
                              </span>
                            </div>
                          </div>
                          <ArrowRight
                            size={14}
                            className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm text-slate-400 italic">
                      No results found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-4">
            {/* IMPORT & ENQUIRY */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleExcelImport}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-all"
            >
              <Database size={16} /> Import
            </button>
            <button
              onClick={() => setShowEnquiry(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-blue-700"
            >
              <UserPlus size={18} />{" "}
              <span className="hidden lg:inline">Enquiry Form</span>
            </button>

            {/* NOTIFICATION BELL */}
            <div
              className="relative"
              onMouseLeave={() => setShowNotiPanel(false)}
            >
              <button
                onMouseEnter={() => setShowNotiPanel(true)}
                className={`relative p-2 rounded-full transition-all ${showNotiPanel ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <Bell size={20} />
                {hasNewNoti && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>
              {showNotiPanel && (
                <div className="absolute top-full right-0 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in fade-in zoom-in duration-200">
                  {/* Header with Date Picker */}
                  <div className="p-4 bg-slate-900">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Live Updates
                        </span>
                      </div>
                      {selectedNotiDate ===
                        new Date().toISOString().split("T")[0] && (
                        <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                          TODAY
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => {
                            const [y, m] = visibleNotiMonth
                              .split("-")
                              .map(Number);
                            const d = new Date(y, m - 2, 1);
                            setVisibleNotiMonth(
                              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                            );
                          }}
                          className="p-1 text-slate-300 hover:text-white"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <p className="text-[11px] font-black text-white">
                          {monthLabel}
                        </p>
                        <button
                          onClick={() => {
                            const [y, m] = visibleNotiMonth
                              .split("-")
                              .map(Number);
                            const d = new Date(y, m, 1);
                            setVisibleNotiMonth(
                              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                            );
                          }}
                          className="p-1 text-slate-300 hover:text-white"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-[9px] text-slate-400 font-bold mb-1">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                          <div key={d} className="text-center">
                            {d}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {buildCalendarDays(visibleNotiMonth).map((dateKey, idx) => {
                          if (!dateKey) {
                            return <div key={`blank-${idx}`} className="h-7" />;
                          }
                          const day = Number(dateKey.slice(-2));
                          const hasBadge = (notiDateCounts[dateKey] || 0) > 0;
                          const isSelected = selectedNotiDate === dateKey;
                          return (
                            <button
                              key={dateKey}
                              onClick={() => setSelectedNotiDate(dateKey)}
                              className={`h-7 rounded text-[10px] font-bold relative ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-200 hover:bg-slate-700"
                              }`}
                            >
                              {day}
                              {hasBadge && (
                                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="p-2 bg-blue-50/30 max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.map((note, index) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm"
                          >
                            <p className="text-sm font-medium text-slate-700 leading-relaxed mb-1">
                              {note.message}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">
                                By {note.updated_by}
                              </span>
                              <span className="text-[8px] text-slate-400">
                                {new Date(note.created_at).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-xs text-slate-400 italic font-medium">
                          No announcements for this date
                        </p>
                      </div>
                    )}

                    {/* Admin/TL Quick Link */}
                    {["MD", "GM", "Main Admin", "TL"].includes(user?.role) && (
                      <button
                        onClick={() => {
                          navigate("/live-feed");
                          setShowNotiPanel(false);
                        }}
                        className="mt-2 w-full p-2 text-[10px] font-black text-blue-600 uppercase hover:bg-blue-100/50 rounded-lg flex items-center justify-center gap-2 transition-all"
                      >
                        Add New Message <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setShowProfile(true)}
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                  {user?.name}
                </p>
                <p className="text-[10px] text-blue-600 font-bold uppercase mt-1 tracking-wider">
                  {user?.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border group-hover:ring-2 ring-blue-500/20 transition-all">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="p"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-slate-400" />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8"><Outlet /></main>
      </div>

      {/* --- Dynamic Enquiry Modal --- */}

      {showEnquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                New Lead Entry
              </h2>
              <button
                onClick={() => setShowEnquiry(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleEnquirySubmit} className="p-6 space-y-4">
              {/* Domain Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Target Domain
                </label>
                <select
                  value={enquiryData.domain}
                  onChange={(e) => {
                    setValidationErrors((prev) => ({ ...prev, domain: null })); // Clear error on change
                    setEnquiryData((prev) => ({
                      ...prev,
                      domain: e.target.value,
                      interested_in: "",
                    }));
                  }}
                  className={`w-full p-2.5 border rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 ${validationErrors.domain ? "border-red-500 ring-red-500/20" : "ring-blue-500/20"}`}
                >
                  <option value="">Select Domain</option>
                  {masterData?.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {validationErrors.domain && (
                  <p className="text-[10px] text-red-500 font-bold uppercase">
                    {validationErrors.domain}
                  </p>
                )}
              </div>

              {/* Interested In Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Interested In
                </label>
                <select
                  value={enquiryData.interested_in}
                  onChange={(e) => {
                    setValidationErrors((prev) => ({
                      ...prev,
                      interested_in: null,
                    }));
                    setEnquiryData((prev) => ({
                      ...prev,
                      interested_in: e.target.value,
                    }));
                  }}
                  disabled={
                    !enquiryData.domain || availableCategories.length === 0
                  }
                  className={`w-full p-2.5 border rounded-lg bg-slate-50 text-sm outline-none ${validationErrors.interested_in ? "border-red-500" : ""}`}
                >
                  <option value="">Select Interest</option>
                  {availableCategories.map((cat) => (
                    <optgroup key={cat.id} label={cat.category_name}>
                      {cat.values?.map((val) => (
                        <option key={val.id} value={val.sub_value || val.value}>
                          {val.sub_value || val.value}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {validationErrors.interested_in && (
                  <p className="text-[10px] text-red-500 font-bold uppercase">
                    {validationErrors.interested_in}
                  </p>
                )}
              </div>

              {/* Name and Phone Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={enquiryData.student_name}
                    onChange={(e) => {
                      setValidationErrors((prev) => ({
                        ...prev,
                        student_name: null,
                      }));
                      setEnquiryData({
                        ...enquiryData,
                        student_name: e.target.value,
                      });
                    }}
                    className={`w-full p-2.5 border rounded-lg text-sm bg-gray-50 ${validationErrors.student_name ? "border-red-500" : ""}`}
                  />
                  {validationErrors.student_name && (
                    <p className="text-[10px] text-red-500 font-bold">
                      {validationErrors.student_name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <input
                    type="tel"
                    placeholder="Phone (10 digits)"
                    value={enquiryData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // Only allow numbers
                      if (val.length <= 10) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          phone: null,
                        }));
                        setEnquiryData({ ...enquiryData, phone: val });
                      }
                    }}
                    className={`w-full p-2.5 border rounded-lg text-sm bg-gray-50 ${validationErrors.phone ? "border-red-500" : ""}`}
                  />
                  {validationErrors.phone && (
                    <p className="text-[10px] text-red-500 font-bold">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Email and Source Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={enquiryData.email}
                    onChange={(e) => {
                      setValidationErrors((prev) => ({ ...prev, email: null }));
                      setEnquiryData({ ...enquiryData, email: e.target.value });
                    }}
                    className={`w-full p-2.5 border rounded-lg text-sm bg-gray-50 ${validationErrors.email ? "border-red-500" : ""}`}
                  />
                  {validationErrors.email && (
                    <p className="text-[10px] text-red-500 font-bold">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Source (e.g. Instagram)"
                  value={enquiryData.source}
                  onChange={(e) =>
                    setEnquiryData({ ...enquiryData, source: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"
                />
              </div>

              <textarea
                placeholder="Specific requirements or remarks..."
                value={enquiryData.remarks}
                onChange={(e) =>
                  setEnquiryData({ ...enquiryData, remarks: e.target.value })
                }
                className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 resize-none"
                rows="3"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 
    ${
      isSubmitting
        ? "bg-slate-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Lead"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal Remains the same as your input... */}

      {showProfile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>

              <button
                onClick={() => setShowProfile(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={handleProfileUpdate}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {/* Avatar Section */}

              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-md relative group">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-400">
                      <User size={40} />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <label className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];

                        if (file) {
                          const reader = new FileReader();

                          reader.onloadend = () =>
                            setProfileData((prev) => ({
                              ...prev,
                              avatar: reader.result,
                            }));

                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <p className="text-[10px] text-slate-400 mt-1 uppercase">
                    Max Size: 1MB
                  </p>
                </div>
              </div>

              {/* Basic Info */}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Email (Permanent)
                  </label>

                  <input
                    type="text"
                    disabled
                    value={user?.email}
                    className="w-full p-2.5 border rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed mt-1"
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Security Section */}

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Security
                </h3>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Current Password
                  </label>

                  <input
                    type="password"
                    placeholder="Required to set new password"
                    value={profileData.oldPassword}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        oldPassword: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    New Password
                  </label>

                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={profileData.newPassword}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-200"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  className="px-6 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;

