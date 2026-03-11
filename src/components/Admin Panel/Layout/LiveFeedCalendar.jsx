import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";

const LiveFeedCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSelectedDate = location.state?.selectedDate || null;
  const [currentDate, setCurrentDate] = useState(initialSelectedDate ? new Date(initialSelectedDate) : new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState(initialSelectedDate);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.selectedDate) {
      setSelectedDateFilter(location.state.selectedDate);
      setCurrentDate(new Date(location.state.selectedDate));
    }
  }, [location.state]);

  // Auto-refresh config matches other components
  const AUTO_REFRESH_MS = 300000;

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/notifications/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Only active notifications for the calendar view
        const activeOnly = data.filter(n => Number(n.is_active) === 1);
        setNotifications(activeOnly);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const numDays = daysInMonth(currentYear, currentMonth);
  const startDay = firstDayOfMonth(currentYear, currentMonth);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Group notifications by date formatting YYYY-MM-DD
  const notifsByDate = notifications.reduce((acc, notif) => {
    const d = new Date(notif.date);
    // Pad month and day
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(notif);
    return acc;
  }, {});

  const renderCells = () => {
    const cells = [];
    
    // Blank cells for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-50 border border-slate-200"></div>);
    }

    // Days of the month
    for (let i = 1; i <= numDays; i++) {
        const d = new Date(currentYear, currentMonth, i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;
        
        const dayNotifs = notifsByDate[dateKey] || [];
        const isToday = new Date().toDateString() === d.toDateString();

        cells.push(
            <div key={i} 
                 onClick={() => setSelectedDateFilter(dateKey)}
                 className={`min-h-[140px] p-2 border border-slate-200 relative group transition-all cursor-pointer ${isToday ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                        {i}
                    </span>
                    {dayNotifs.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                            {dayNotifs.length}
                        </span>
                    )}
                </div>
                
                <div className="space-y-1.5 overflow-y-auto max-h-[100px] pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {dayNotifs.map((n, idx) => (
                    <div key={idx} className="bg-white border shadow-sm p-1.5 rounded-md text-[11px] leading-tight text-slate-700 group-hover:border-red-200 transition-colors">
                      <p className="line-clamp-3">{n.message}</p>
                      <div className="text-[9px] text-slate-400 mt-1 flex justify-between">
                         <span className="font-bold text-red-500 uppercase">{n.updated_by || n.created_by || "System"}</span>
                         <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
        );
    }

    return cells;
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 p-6 min-h-screen bg-slate-50">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => {
                if (selectedDateFilter) {
                   setSelectedDateFilter(null);
                   // Optionally clear location state
                   navigate(".", { replace: true, state: {} });
                } else {
                   navigate(-1);
                }
             }}
             className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
           >
             <ArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
               <CalendarIcon className="text-red-500" />
               Notification Calendar
             </h1>
             <p className="text-sm text-slate-500 font-medium">View all historical and upcoming broadcasts.</p>
           </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl">
            <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl shadow-sm font-bold text-slate-700 transition">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-black text-slate-800 min-w-[160px] text-center uppercase tracking-widest">
                {monthNames[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl shadow-sm font-bold text-slate-700 transition">
              <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden">
         {/* Days Header */}
         <div className="grid grid-cols-7 bg-slate-900 text-white border-b border-slate-200">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
               <div key={day} className="py-4 text-center text-xs font-black uppercase tracking-widest text-slate-300">
                  {day}
               </div>
            ))}
         </div>
         
         {/* Days Grid or Single Date List View */}
         {loading ? (
           <div className="h-[600px] flex items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
           </div>
         ) : selectedDateFilter ? (
           <div className="p-8 min-h-[400px]">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                 <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">
                     Announcements for {new Date(selectedDateFilter).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                   </h3>
                   <p className="text-slate-500 text-sm mt-1">Found {(notifsByDate[selectedDateFilter] || []).length} results</p>
                 </div>
                 <button 
                   onClick={() => {
                     setSelectedDateFilter(null);
                     navigate(".", { replace: true, state: {} });
                   }} 
                   className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm"
                 >
                   Show Full Month
                 </button>
              </div>

              {notifsByDate[selectedDateFilter] && notifsByDate[selectedDateFilter].length > 0 ? (
                  <div className="space-y-4">
                     {notifsByDate[selectedDateFilter].map((n, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                           <p className="text-slate-700 font-medium leading-relaxed">{n.message}</p>
                           <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">
                                 By {n.updated_by || n.created_by || "System"}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                 {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
              ) : (
                  <div className="text-center py-20">
                     <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon size={32} className="text-slate-300" />
                     </div>
                     <p className="text-slate-500 font-medium">No announcements found for this date.</p>
                  </div>
              )}
           </div>
         ) : (
           <div className="grid grid-cols-7 bg-slate-200 gap-[1px]">
             {renderCells()}
           </div>
         )}
      </div>

    </div>
  );
};

export default LiveFeedCalendar;
