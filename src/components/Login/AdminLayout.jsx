import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Settings, ShieldCheck, CheckCircle2, WorkflowIcon, Workflow } from 'lucide-react';
import { FaCalendar } from 'react-icons/fa';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch the count of pending leads for the sidebar badge
  useEffect(() => {
    const fetchCount = () => {
      fetch('http://localhost:5000/api/admin/leads')
        .then(res => res.json())
        .then(data => setPendingCount(data.length))
        .catch(err => console.error("Error fetching badge count:", err));
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Refresh count every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/leads', label: 'Enquiry', icon: Users, showBadge: true },
    { path: '/admin/approved-leads', label: 'Leads', icon: CheckCircle2 },
     { path: '/admin/careers', label: 'Careers', icon: FaCalendar },
          { path: '/admin/applicants', label: 'Job Applicants', icon: FaCalendar },

    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-8 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-black">B</div>
          <span className="font-bold tracking-wider italic text-xl">BLUESTONE</span>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} />
                <span className="font-semibold">{item.label}</span>
              </div>
              
              {/* Notification Badge for Leads */}
              {item.showBadge && pendingCount > 0 && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                  location.pathname === item.path ? 'bg-white text-red-600' : 'bg-red-600 text-white'
                }`}>
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-slate-400 hover:bg-red-600/10 hover:text-red-500 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10">
          <div className="flex flex-col">
            <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Management Console</h2>
            <p className="text-slate-900 font-black text-lg capitalize">
              {location.pathname.split('/').pop().replace('-', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-600" />
              Verified Session
            </span>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-10 bg-slate-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}