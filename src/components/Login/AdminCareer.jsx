import React, { useState } from 'react';
import { Plus, Trash2, LayoutGrid, List, Search, ArrowUpDown, DollarSign, Briefcase, MapPin } from 'lucide-react';
import { confirmToast } from '../../utils/toastConfirm';

export function AdminCareers({ jobs = [], onAddJob, onDeleteJob }) {
  // 1. Expanded Form State
  const [form, setForm] = useState({ 
    title: '', 
    category: 'Education', 
    location: '', 
    type: 'Full-time',
    salary: '',
    skills: '',
    description: '' 
  });

  // 2. UI State
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddJob(form);
    setForm({ title: '', category: 'Education', location: '', type: 'Full-time', salary: '', skills: '', description: '' });
  };

  // 3. Filter and Sort Logic
  const filteredJobs = jobs
    .filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.id - a.id; // Newest first
    });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* LEFT: JOB POSTING FORM */}
        <div className="w-full xl:w-[400px] bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="bg-red-600 text-white rounded-lg p-1" size={28} /> 
            Create Job Post
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Job Title (e.g. Senior Lecturer)"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <select className="p-3 bg-gray-50 border rounded-xl outline-none" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                <option>Education</option><option>Technology</option><option>Sports</option><option>Corporate</option>
              </select>
              <select className="p-3 bg-gray-50 border rounded-xl outline-none" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                <option>Full-time</option><option>Part-time</option><option>Intern</option>
              </select>
            </div>

            <input 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Location (e.g. Coimbatore, TN)"
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              required
            />

            <input 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Salary Range (e.g. ₹40k - ₹60k)"
              value={form.salary}
              onChange={(e) => setForm({...form, salary: e.target.value})}
            />

            <input 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Skills (Comma separated)"
              value={form.skills}
              onChange={(e) => setForm({...form, skills: e.target.value})}
            />

            <textarea 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500 h-32"
              placeholder="Job Description..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />

            <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100">
              Publish Opening
            </button>
          </form>
        </div>

        {/* RIGHT: LISTINGS AREA */}
        <div className="flex-1">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search job titles..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-200">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition ${viewMode === 'list' ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}>
                <List size={20} />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition ${viewMode === 'grid' ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}>
                <LayoutGrid size={20} />
              </button>
            </div>

            <select 
              className="p-3 bg-white border border-gray-200 rounded-2xl outline-none font-medium text-gray-600"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest</option>
              <option value="title">Sort: Alphabetical</option>
            </select>
          </div>

          {/* Jobs Display */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider">
                    {job.category}
                  </span>
                  <button onClick={async () => {
                    const confirmed = await confirmToast("Delete this job opening?");
                    if (confirmed && onDeleteJob) onDeleteJob(job.id);
                    else if (confirmed && !onDeleteJob) alert("Delete action is not properly linked.");
                  }} className="p-2 text-gray-300 hover:text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="font-bold text-xl text-gray-900 mb-2">{job.title}</h3>
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1"><MapPin size={14}/> {job.location}</div>
                  <div className="flex items-center gap-1"><Briefcase size={14}/> {job.type}</div>
                  {job.salary && <div className="flex items-center gap-1 text-green-600 font-medium"><DollarSign size={14}/> {job.salary}</div>}
                </div>

                {job.skills && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.split(',').map((skill, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium uppercase">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && job.description && (
                  <p className="text-gray-500 text-sm line-clamp-2 border-t pt-4 mt-2 italic">
                    {job.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
              <p className="text-gray-400">No job openings found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}