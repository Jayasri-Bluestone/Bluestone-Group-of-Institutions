import React, { useState, useEffect } from 'react';
import { Calendar, Send, Info, CheckCircle, Bell } from 'lucide-react';

const LiveFeedManager = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Fetch existing message when date changes
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/notifications?date=${date}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setMessage(data.message || '');
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    fetchExisting();
  }, [date]);

 const handleUpdate = async (e) => {
  e.preventDefault();
  
  const token = localStorage.getItem('token'); // Get the stored JWT

  try {
    const res = await fetch('http://localhost:5005/api/notifications', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ENSURE THIS IS PRESENT
      },
      body: JSON.stringify({ date, message })
    });
    
    if (res.ok) {
       setStatus('success');
    } else if (res.status === 403) {
       console.error("The backend doesn't recognize your role or token.");
    }
  } catch (err) {
    console.error("Network error:", err);
  }
};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-2xl text-white">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Broadcast Center</h1>
            <p className="text-sm text-slate-500 font-medium">Update the live notification feed for all staff</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Schedule Date
            </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 ring-blue-500/10 outline-none transition-all"
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Announcement Message</label>
            <textarea 
              required
              placeholder="Type today's targets, motivation, or updates..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 ring-blue-500/10 outline-none transition-all min-h-[150px] resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <Info size={18} className="text-blue-500 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Updating this will immediately reflect on the dashboard for all users. Keep messages concise and professional.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
              status === 'success' 
              ? 'bg-emerald-500 text-white shadow-emerald-200' 
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            {loading ? "Processing..." : status === 'success' ? (
              <><CheckCircle size={18} /> Update Published</>
            ) : (
              <><Send size={18} /> Update Live Feed</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveFeedManager;