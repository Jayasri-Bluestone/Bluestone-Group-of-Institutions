import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Users, Clock, Filter,
  RefreshCcw, LayoutGrid, List, FileDown,
  ArrowLeft, Calendar as CalendarIcon, User as UserIcon, Activity, ChevronUp, ChevronDown
} from 'lucide-react';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';
import { toast } from 'react-hot-toast';
import { exportToExcel } from "../../../utils/exportExcel";
import { formatOverallReport, formatIndividualReport, downloadExcelAOA } from "../../../utils/reportUtils";
import { parseAsIST, formatToLocalDateTime } from "../../../utils/timeUtils";

// --- PROFESSIONAL COLOR SYSTEM ---
const CHART_COLORS = [
  '#2563eb', '#0891b2', '#059669', '#7c3aed', '#db2777',
  '#ea580c', '#475569', '#1e40af', '#166534', '#991b1b'
];

const UserEfficiency = ({ user }) => {
  const [data, setData] = useState({ chartData: [], userTotals: [] });
  const [loading, setLoading] = useState(true);
  const [filteredUser, setFilteredUser] = useState('All');
  const tableRef = useRef(null);
  const [timeRange, setTimeRange] = useState('day');
  const [showPersonnelTable, setShowPersonnelTable] = useState(false);

  // Detailed View State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [hourlyData, setHourlyData] = useState([]);
  const [individualChartData, setIndividualChartData] = useState([]);
  const [loadingHourly, setLoadingHourly] = useState(false);

  // --- API FETCHERS ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const tzOffset = new Date().getTimezoneOffset();
      let url = `${API_BASE_URL_PORTAL}/api/admin/user-efficiency?range=${timeRange}&tzOffset=${tzOffset}`;
      if (timeRange === 'day') {
        url += `&date=${selectedDate}`;
      } else {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error("Failed to fetch efficiency data");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedDate, startDate, endDate]);

  const fetchIndividualData = useCallback(async (userId) => {
    setLoadingHourly(true);
    try {
      const tzOffset = new Date().getTimezoneOffset();
      let url = `${API_BASE_URL_PORTAL}/api/admin/user-efficiency?userId=${userId}&range=${timeRange}&tzOffset=${tzOffset}`;
      if (timeRange === 'day') {
        url += `&date=${selectedDate}`;
      } else {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (timeRange === 'day') {
          setHourlyData(json.hourlyData || []);
        } else {
          setIndividualChartData(json.chartData || []);
        }
      } else {
        toast.error("Failed to fetch performance data");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoadingHourly(false);
    }
  }, [timeRange, selectedDate, startDate, endDate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      // Only fetch if the tab is visible to save database connections
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, 180000); // Increased from 30s to 3m to stay under 500 connections/hour limit
    return () => clearInterval(interval);
  }, [timeRange, selectedDate, startDate, endDate, fetchData]);

  useEffect(() => {
    if (selectedUser) {
      fetchIndividualData(selectedUser.id);
    }
  }, [selectedUser, selectedDate, timeRange, startDate, endDate]);

  const formatToHMM = (totalMinutes) => {
    if (!totalMinutes && totalMinutes !== 0) return '0.00';
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    return `${h}.${m.toString().padStart(2, '0')}`;
  };

  const getUserStatus = (lastActiveAt, iactive, secondsAgo) => {
    // 1. Priority: Server-provided relative 'secondsAgo' (drift-immune)
    if (secondsAgo !== undefined && secondsAgo !== null) {
      if (secondsAgo <= 65) {
        return { label: 'ONLINE', color: 'emerald', isOnline: true };
      }

      // 2. Secondary: If backend explicitly says iactive=1, user is definitely online
      // (Used as a fallback if the window has passed but the heartbeat just finished)
      if (iactive === 1 && secondsAgo <= 120) {
        return { label: 'ONLINE', color: 'emerald', isOnline: true };
      }

      const h = Math.floor(secondsAgo / 3600);
      const d = Math.floor(h / 24);
      const m = Math.floor(secondsAgo / 60);
      let timeText = '';
      if (d > 0) timeText = `${d}d ago`;
      else if (h > 0) timeText = `${h}h ago`;
      else timeText = `${m}m ago`;
      return { label: timeText.toUpperCase(), color: 'slate', isOnline: false };
    }

    if (!lastActiveAt) return { label: 'OFFLINE', color: 'slate', isOnline: false };

    // Parse date safely as IST
    const lastActive = parseAsIST(lastActiveAt);
    if (isNaN(lastActive.getTime())) return { label: 'OFFLINE', color: 'slate', isOnline: false };

    const now = new Date();
    // Correct for potentially missing 'Z' or local differences by using UTC comparison
    // But if backend is Z, this is already fine.
    const diffInMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);

    // 2-3 minutes threshold for "Online". Allow negative diff up to -5 mins if user's local PC clock is behind the DB clock.
    if (diffInMinutes >= -5 && diffInMinutes <= 3.5) {
      return { label: 'ONLINE', color: 'emerald', isOnline: true };
    } else {
      const positiveDiff = Math.abs(diffInMinutes);
      const hours = Math.floor(positiveDiff / 60);
      const days = Math.floor(hours / 24);
      let timeText = '';
      if (days > 0) timeText = `${days}d ago`;
      else if (hours > 0) timeText = `${hours}h ago`;
      else timeText = `${Math.max(0, Math.floor(positiveDiff))}m ago`;

      return { label: timeText.toUpperCase(), color: 'slate', isOnline: false };
    }
  };

  // --- DATA TRANSFORMATION ---
  const filteredUserTotals = filteredUser === 'All'
    ? data.userTotals
    : data.userTotals.filter(u => u.name === filteredUser || u.userName === filteredUser);

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const sortedUserTotals = [...filteredUserTotals].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === 'efficiency') {
      const denom = (timeRange === 'day' ? 8 : timeRange === 'week' ? 40 : 160);
      aVal = a.totalHours / denom;
      bVal = b.totalHours / denom;
    } else if (sortBy === 'usage') {
      aVal = Number(a.totalMinutes || 0);
      bVal = Number(b.totalMinutes || 0);
    } else {
      aVal = a[sortBy] || "";
      bVal = b[sortBy] || "";
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalMinutes = filteredUserTotals.reduce(
    (acc, curr) => acc + Number(curr.totalMinutes || 0),
    0
  );

  const avgMinutes = totalMinutes / (filteredUserTotals.length || 1);

  const filterList = ['All', ...new Set(data.userTotals.map(u => u.name || u.userName).filter(n => n && n !== 'All'))];

  const filteredChartData = data.chartData.map(d => {
    let dayTotal = 0;
    let userCount = 0;
    let activeUsers = [];
    const entry = { date: d.date };
    sortedUserTotals.forEach(u => {
      const name = u.userName || u.name;
      if (d[name] !== undefined) {
        const val = d[name];
        entry[name] = val;
        dayTotal += val;
        if (val > 0) {
          userCount++;
          activeUsers.push(name);
        }
      }
    });
    entry.total = Number(dayTotal.toFixed(2));
    entry.userCount = userCount;
    entry.activeUsers = activeUsers;
    return entry;
  });

  // --- EXPORT HANDLERS ---
  const handleExportDirectory = async () => {
    const filename = `Staff_Efficiency_Directory.xlsx`;
    const columns = [
      { header: 'Personnel', accessor: 'name' },
      { header: 'Department', accessor: 'domain' },
      { header: 'Efficiency (%)', accessor: (u) => `${Math.min(100, (u.totalHours / (timeRange === 'day' ? 8 : timeRange === 'week' ? 40 : 160)) * 100).toFixed(1)}%` },
      { header: 'Total Usage (Hours)', accessor: (u) => formatToHMM(u.totalMinutes) },
      { header: 'Total Usage (Minutes)', accessor: 'totalMinutes' },
      { header: 'Status', accessor: (u) => getUserStatus(u.last_active_at, u.iactive, u.secondsAgo).isOnline ? 'ONLINE' : 'OFFLINE' }
    ];
    await exportToExcel(filename, columns, sortedUserTotals);
  };

  const handleExportDetailedOverall = async () => {
    setLoading(true);
    try {
      const sDate = timeRange === 'day' ? selectedDate : startDate;
      const eDate = timeRange === 'day' ? selectedDate : endDate;

      const res = await fetch(`${API_BASE_URL_PORTAL}/api/admin/efficiency-report?startDate=${sDate}&endDate=${eDate}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        const json = await res.json();
        const aoa = formatOverallReport(json);
        await downloadExcelAOA(aoa, `Overall_Efficiency_Detailed_${sDate}_to_${eDate}.xlsx`);
        toast.success("Detailed report generated");
      } else {
        toast.error("Failed to fetch report data");
      }
    } catch (err) {
      toast.error("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportDetailedIndividual = async () => {
    if (!selectedUser) return;
    setLoadingHourly(true);
    try {
      // Use the global range/date state
      const sDate = timeRange === 'day' ? selectedDate : startDate;
      const eDate = timeRange === 'day' ? selectedDate : endDate;

      const res = await fetch(`${API_BASE_URL_PORTAL}/api/admin/efficiency-report?startDate=${sDate}&endDate=${eDate}&userId=${selectedUser.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        const json = await res.json();
        const aoa = formatIndividualReport(selectedUser, json);
        await downloadExcelAOA(aoa, `${selectedUser.name}_Detailed_Audit_${sDate}_to_${eDate}.xlsx`);
        toast.success("Individual audit generated");
      } else {
        toast.error("Failed to fetch audit data");
      }
    } catch (err) {
      toast.error("Error generating audit");
    } finally {
      setLoadingHourly(false);
    }
  };


  // --- CHART HELPERS ---
  const getXAxisTickFormatter = (val) => {
    if (!val && val !== 0) return val;

    // --- DAY VIEW: HOURLY SLOTS ---
    if (timeRange === 'day') {
      const h = parseInt(val);
      const start = h % 12 || 12;
      const nh = (h + 1) % 24;
      const end = nh % 12 || 12;
      return `${start}-${end}`;
    }

    // --- WEEK VIEW: MONDAY 27/03/2026 ---
    if (timeRange === 'week') {
      const date = parseAsIST(val);
      if (isNaN(date.getTime())) return val;
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(',', '');
    }

    // --- MONTH VIEW: JAN 2026 ---
    if (timeRange === 'month') {
      try {
        const [year, month] = val.split('-');
        const date = parseAsIST(`${year}-${month}-01`);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {
        return val;
      }
    }

    return val;
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const total = dataPoint.total !== undefined ? dataPoint.total : (dataPoint.value !== undefined ? dataPoint.value : 0);
      const hmmVal = formatToHMM(total);
      return (
        <div className="bg-white/90 border border-slate-200 p-4 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="font-black text-blue-600 text-[10px] uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-2">
            {timeRange === 'day' ? `${getXAxisTickFormatter(label)} SLOT` : getXAxisTickFormatter(label)}
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-8">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Users</span>
              </span>
              <span className="text-lg font-black text-slate-900">
                {dataPoint.userCount} <span className="text-[10px] text-slate-400">STAFF</span>
              </span>
            </div>

            {dataPoint.activeUsers && dataPoint.activeUsers.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Staff Online:</p>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {dataPoint.activeUsers.map((name, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-100">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-8 pt-1">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-slate-200 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400">TOTAL USAGE</span>
              </span>
              <span className="text-xs font-bold text-slate-500">
                {hmmVal} <span className="text-[10px]">HRS</span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const HourlyTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white/90 border border-slate-200 p-4 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="font-black text-blue-600 text-[10px] uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-2">{d.label} SLOT</p>
          <div className="flex items-center justify-between gap-8">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <span className="text-xs font-bold text-slate-500">ACTIVITY</span>
            </span>
            <span className="text-lg font-black text-slate-900">{d.minutes} <span className="text-[10px] text-slate-400 uppercase">min</span> ({formatToHMM(d.minutes)} hrs)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const SortHeader = ({ label, sortKey, className = "" }) => {
    const isActive = sortBy === sortKey;
    return (
      <th
        className={`px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors ${className}`}
        onClick={() => {
          if (isActive) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(sortKey);
            setSortOrder('desc');
          }
        }}
      >
        <div className={`flex items-center gap-1.5 ${className.includes('center') ? 'justify-center' : className.includes('right') ? 'justify-end' : 'justify-start'}`}>
          {label}
          <div className="flex flex-col -gap-1">
            <ChevronUp size={10} className={isActive && sortOrder === 'asc' ? "text-blue-600" : "text-slate-300"} />
            <ChevronDown size={10} className={isActive && sortOrder === 'desc' ? "text-blue-600" : "text-slate-300"} />
          </div>
        </div>
      </th>
    );
  };

  if (loading && !selectedUser) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-500 font-semibold animate-pulse">Syncing performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen font-sans">
      {/* 🔹 HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {selectedUser ? (
            <button
              onClick={() => setSelectedUser(null)}
              className="p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
          ) : (
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
              <Activity size={24} />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {selectedUser ? `${selectedUser.name.toUpperCase()} ANALYSIS` : 'TEAM EFFICIENCY INDEX'}
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
              {selectedUser ? `Visualizing work distribution for ${selectedDate}` : 'Comprehensive productivity metrics (Standard Business Hours)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            {timeRange === 'day' ? (
              <div className="flex items-center gap-2 px-4 border-r border-slate-100">
                <CalendarIcon size={14} className="text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-[10px] font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 border-r border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-[10px] font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
                  />
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-[10px] font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            )}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 px-4 py-2 outline-none border-r border-slate-100 cursor-pointer"
            >
              <option value="day">DAY</option>
              <option value="week">WEEK</option>
              <option value="month">MONTH</option>
            </select>
          </div>

          <button
            onClick={() => { if (selectedUser) fetchIndividualData(selectedUser.id); else fetchData(); }}
            className="p-3 bg-white hover:bg-blue-50 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            <RefreshCcw size={18} className={loading || loadingHourly ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {!selectedUser ? (
        <>
          {/* 🔹 SUMMARY METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Total Personnel',
                val: data.userTotals.length,
                icon: Users,
                color: 'blue',
                onClick: () => {
                  const newState = !showPersonnelTable;
                  setShowPersonnelTable(newState);
                  if (newState) {
                    setTimeout(() => {
                      tableRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }
              },
              { label: 'Total Team Usage', val: `${formatToHMM(totalMinutes)} HRS`, icon: Clock, color: 'emerald' },
              {
                label: `${timeRange === 'day' ? 'Daily' : timeRange === 'week' ? 'Weekly' : 'Monthly'} Avg/User`,
                val: `${formatToHMM(avgMinutes)} HRS`, icon: TrendingUp, color: 'amber'
              },
              { label: 'Personnel Filter', val: filteredUser, icon: Filter, color: 'slate', isTag: true }
            ].map((card, i) => (
              <div
                key={i}
                className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all ${card.onClick ? 'cursor-pointer' : ''}`}
                onClick={card.onClick}
              >
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{card.label}</p>
                  {card.isTag ? (
                    <div className="relative group/select text-lg font-black text-slate-800 flex items-center gap-1">
                      <select
                        value={filteredUser}
                        onChange={(e) => setFilteredUser(e.target.value)}
                        className="bg-transparent outline-none cursor-pointer appearance-none pr-8 relative z-10"
                      >
                        {filterList.map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-0 text-slate-400 group-hover/select:text-blue-500 transition-colors pointer-events-none" />
                    </div>
                  ) : (
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{card.val}</p>
                  )}
                </div>
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:scale-110 transition-transform">
                  <card.icon size={20} />
                </div>
              </div>
            ))}
          </div>

          {/* 🔹 MAIN ANALYTICS HUB */}
          <div className="bg-white text-slate-800 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              {!showPersonnelTable ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-100 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-xl font-black flex items-center gap-3">
                            <div className="h-6 w-1 bg-blue-500 rounded-full" />
                            Overall Operational Efficiency
                          </h3>
                          <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest ml-4">Consolidated team-wide productivity index</p>
                        </div>
                        <button
                          onClick={handleExportDetailedOverall}
                          className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2 border border-emerald-100"
                          title="Download Overall Detailed Report (Date-wise/User-wise Matrix)"
                        >
                          <FileDown size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Detailed Report</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-6 bg-slate-50/80 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Team Usage</p>
                          <p className="text-xl font-black text-blue-600 leading-none">{formatToHMM(totalMinutes)} <span className="text-[10px] text-slate-400">HRS</span></p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Avg/User</p>
                          <p className="text-xl font-black text-slate-800 leading-none">{avgMinutes.toFixed(1)} <span className="text-[10px] text-slate-400">MIN</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height={400} minWidth={0} debounce={1}>
                      <AreaChart data={timeRange === 'day' ? filteredChartData.filter(d => parseInt(d.date) >= 9 && parseInt(d.date) <= 18) : filteredChartData}>
                        <defs>
                          <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={getXAxisTickFormatter}
                          axisLine={false} tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          ticks={timeRange === 'day' ? [9, 10, 11, 12, 13, 14, 15, 16, 17, 18] : undefined}
                          interval={0}
                          dy={20}
                        />
                        <YAxis
                          axisLine={false} tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          domain={timeRange === 'day' ? [0, 'auto'] : ['auto', 'auto']}
                          // Allow better scaling for user counts
                          allowDecimals={false}
                          tickFormatter={(val) => val}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 40 }} />
                        <Area
                          type="monotone"
                          dataKey="userCount"
                          stroke="#3b82f6"
                          strokeWidth={4}
                          fill="url(#mainGrad)"
                          fillOpacity={1}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="pt-10 border-t border-slate-100" ref={tableRef}>
                  <div className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-xl font-black flex items-center gap-3">
                          <div className="h-6 w-1 bg-blue-500 rounded-full" />
                          Personnel Usage Directory
                        </h3>
                        <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest ml-4">Detailed breakdown of individual time contributions</p>
                      </div>
                      <button
                        onClick={handleExportDirectory}
                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                        title="Export Full Directory"
                      >
                        <FileDown size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Export</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowPersonnelTable(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black rounded-lg transition-colors uppercase tracking-widest"
                    >
                      Hide Directory
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-[2rem] bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <SortHeader label="Personnel" sortKey="name" />
                          <SortHeader label="Department" sortKey="domain" />
                          <SortHeader label="Status" sortKey="last_active_at" className="text-center" />
                          <SortHeader label="Efficiency" sortKey="efficiency" className="text-center" />
                          <SortHeader label={`${timeRange === 'day' ? 'Today' : timeRange === 'week' ? 'Weekly' : 'Monthly'} Usage`} sortKey="usage" className="text-center" />
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right px-10">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {sortedUserTotals.map((u, i) => (

                          <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-md text-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                                  {u.name.charAt(0)}
                                </div>
                                <span className="font-black text-slate-800 uppercase tracking-tight text-sm group-hover:text-blue-600 transition-colors">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black uppercase tracking-wider">{u.domain}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              {(() => {
                                const status = getUserStatus(u.last_active_at, u.iactive, u.secondsAgo);
                                return (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`} />
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${status.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {status.isOnline ? 'ONLINE' : 'OFFLINE'}
                                      </span>
                                    </div>
                                    {!status.isOnline && (
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                        Seen {status.label}
                                        {u.last_active_at && ` (${formatToLocalDateTime(u.last_active_at).split(' ')[1]} ${formatToLocalDateTime(u.last_active_at).split(' ')[2]})`}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-black text-slate-500">{Math.min(100, (u.totalHours / (timeRange === 'day' ? 8 : timeRange === 'week' ? 40 : 160)) * 100).toFixed(1)}%</span>
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(100, (u.totalHours / (timeRange === 'day' ? 8 : timeRange === 'week' ? 40 : 160)) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-black text-slate-900 text-lg">
                                  {formatToHMM(u.totalMinutes)} <span className="text-[10px] text-slate-400">HRS</span>
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">({u.totalMinutes} min)</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right px-10">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-95 uppercase tracking-widest"
                              >
                                VIEW GRAPH
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* 🔹 USER SPECIFIC QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Active Session</p>
                <p className="text-2xl font-black text-slate-800">{hourlyData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(2)} Hrs</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Peak Activity Hour</p>
                <p className="text-2xl font-black text-slate-800">{hourlyData.length ? [...hourlyData].sort((a, b) => b.minutes - a.minutes)[0].label : '-'}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <UserIcon size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Audit Status</p>
                <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  VERIFIED <Award size={20} className="text-amber-500" />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white text-slate-800 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="flex flex-col sm:flex-row justify-between items-start mb-12 relative z-10">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-blue-500 rounded-full" />
                    {timeRange === 'day' ? 'Hourly Activity Timeline' : 'Performance Trend Analysis'}
                  </h3>
                  <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest ml-4">
                    {timeRange === 'day' ? '60-second resolution activity monitoring' : `${timeRange.toUpperCase()} productivity breakdown`}
                  </p>
                </div>
                <button
                  onClick={handleExportDetailedIndividual}
                  className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm flex items-center gap-2 border border-amber-100"
                  title="Export Detailed Audit Report"
                >
                  <FileDown size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Detailed Audit</span>
                </button>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 mt-4 sm:mt-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Telemetry</span>
              </div>
            </div>

            {loadingHourly ? (
              <div className="h-[400px] flex items-center justify-center">
                <RefreshCcw className="animate-spin text-blue-500" size={32} />
              </div>
            ) : (
              <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height={400} minWidth={0} debounce={1}>
                  <AreaChart
                    data={
                      timeRange === 'day'
                        ? (hourlyData || []).filter(d => d.hour >= 9 && d.hour <= 17)
                        : (individualChartData || []).map(d => {
                          const val = d[selectedUser.name] || d[selectedUser.userName] || 0;
                          return { ...d, value: val, total: val };
                        })
                    }
                  >
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey={timeRange === 'day' ? "hour" : "date"}
                      tickFormatter={getXAxisTickFormatter}
                      axisLine={false} tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      ticks={timeRange === 'day' ? [9, 10, 11, 12, 13, 14, 15, 16, 17] : undefined}
                      interval={0}
                      dy={20}
                    />
                    <YAxis
                      axisLine={false} tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      domain={timeRange === 'day' ? [0, 60] : ['auto', 'auto']}
                      tickFormatter={(val) => timeRange === 'day' ? val : (val / 60).toFixed(0)}
                    />
                    <Tooltip
                      content={timeRange === 'day' ? <HourlyTooltip /> : <CustomTooltip />}
                      cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 40 }}
                    />
                    <Area
                      type="monotone"
                      dataKey={timeRange === 'day' ? "minutes" : "value"}
                      stroke="#3b82f6"
                      strokeWidth={4}
                      fill="url(#blueGrad)"
                      fillOpacity={1}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex justify-between mt-12 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-8 relative z-10">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500/10" /> Morning Block</span>
              <span className="flex items-center gap-2 text-slate-300 tracking-[0.3em]">Operational Timeline v2.0</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500/10" /> Evening Block</span>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 FOOTER SYSTEM INDICATOR */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-400 rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-sm">Automated Efficiency Calculation</p>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-tight">Tracking frequency: 60,000ms / Idle timeout: 600,000ms</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-black text-slate-300 uppercase italic">Ready for Audit</span>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            SYNCHRONIZE LIVE
          </button>
        </div>
      </div>
    </div>
  );
};

const Award = ({ size, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

export default UserEfficiency;