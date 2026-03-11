"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Briefcase, Clock, User, FileText, Loader2 } from 'lucide-react';

import { API_BASE_URL } from '../../apiConfig';


export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalApplicants: 0, 
    activeJobs: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Matching your Express routes: /applications, and /jobs
        const [appsRes, jobsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/applications`),
          fetch(`${API_BASE_URL}/api/jobs`)
        ]);

        const applications = await appsRes.json();
        const jobs = await jobsRes.json();

        // Check if data is array (Express mysql2 returns arrays)
        const appsList = Array.isArray(applications) ? applications : [];
        const jobsList = Array.isArray(jobs) ? jobs : [];

        setStats({
          totalApplicants: appsList.length,
          activeJobs: jobsList.length
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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