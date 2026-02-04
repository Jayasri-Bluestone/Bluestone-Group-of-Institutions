"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Briefcase, Clock, User, FileText, Loader2 } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalLeads: 0, 
    todayLeads: 0, 
    totalApplicants: 0, 
    activeJobs: 0,
    byFocus: {} 
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Matching your Express routes: /leads, /applications, and /jobs
        const [leadsRes, appsRes, jobsRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/leads'),
          fetch('http://localhost:5000/api/admin/applications'),
          fetch('http://localhost:5000/api/jobs')
        ]);

        const leads = await leadsRes.json();
        const applications = await appsRes.json();
        const jobs = await jobsRes.json();

        // Check if data is array (Express mysql2 returns arrays)
        const leadsList = Array.isArray(leads) ? leads : [];
        const appsList = Array.isArray(applications) ? applications : [];
        const jobsList = Array.isArray(jobs) ? jobs : [];

        const todayStr = new Date().toISOString().split('T')[0];

        const statsObj = leadsList.reduce((acc, lead) => {
          // MySQL uses created_at usually
          if (lead.created_at && lead.created_at.startsWith(todayStr)) {
            acc.today += 1;
          }
          const focus = lead.business_focus || 'General';
          acc.byFocus[focus] = (acc.byFocus[focus] || 0) + 1;
          return acc;
        }, { today: 0, byFocus: {} });

        setStats({
          totalLeads: leadsList.length,
          todayLeads: statsObj.today,
          totalApplicants: appsList.length,
          activeJobs: jobsList.length,
          byFocus: statsObj.byFocus
        });
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-400 bg-slate-50">
      <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
      <p className="text-xs font-black uppercase tracking-widest">Querying MySQL Database...</p>
    </div>
  );

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Control</h1>
        <p className="text-slate-500 font-medium">Real-time data from Bluestone MySQL Server.</p>
      </header>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Business Leads" 
          value={stats.totalLeads} 
          icon={<Users />} 
          color="bg-blue-600" 
          onClick={() => navigate('/admin/leads')}
        />
        <StatCard 
          title="Job Applicants" 
          value={stats.totalApplicants} 
          icon={<User />} 
          color="bg-rose-600" 
          onClick={() => navigate('/admin/applicants')}
        />
        <StatCard 
          title="Open Positions" 
          value={stats.activeJobs} 
          icon={<Briefcase />} 
          color="bg-purple-600" 
          onClick={() => navigate('/admin/jobs')}
        />
        <StatCard 
          title="Inbound Today" 
          value={stats.todayLeads} 
          icon={<TrendingUp />} 
          color="bg-emerald-600" 
          onClick={() => navigate('/admin/leads')}
        />
      </div>

      {/* Breakdown List */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="text-blue-600" size={20} /> Branch Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.byFocus).map(([name, count]) => (
            <div key={name} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 truncate">{name}</p>
              <p className="text-2xl font-black text-slate-900">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center justify-between text-left transition-all hover:scale-[1.03] active:scale-95 group w-full"
    >
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{title}</p>
        <p className="text-4xl font-black text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
    </button>
  );
}