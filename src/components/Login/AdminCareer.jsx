import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function AdminCareers({ jobs, onAddJob, onDeleteJob }) {
  const [form, setForm] = useState({ title: '', category: 'Education', location: '', type: 'Full-time' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.location) return;
    
    // Send data to parent handler
    onAddJob(form); 
    
    // Reset form
    setForm({ title: '', category: 'Education', location: '', type: 'Full-time' });
  };

  // Ensure jobs is an array before mapping
  const jobsList = Array.isArray(jobs) ? jobs : [];

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-96 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="bg-red-600 text-white rounded-md p-1" size={24} /> Post New Job
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-red-500"
              placeholder="Job Title"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
            />
            <select 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none"
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
            >
              <option>Education</option>
              <option>Technology</option>
              <option>Sports</option>
              <option>Corporate</option>
            </select>
            <input 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-red-500"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              required
            />
             <select 
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none"
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
            <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
              Publish Job
            </button>
          </form>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">Active Openings ({jobsList.length})</h2>
          <div className="grid gap-4">
            {jobsList.map(job => (
              <div key={job.id} className="bg-white p-5 rounded-2xl border flex justify-between items-center group">
                <div>
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.category} • {job.location} • {job.type}</p>
                </div>
                <button 
                  onClick={() => onDeleteJob(job.id)} 
                  className="p-2 text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}