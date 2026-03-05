import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';

const LoginPage = ({ onLoginSuccess }) => {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const canvasRef = useRef(null);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaText(result);
    drawCaptcha(result);
    setUserInput('');
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 26px 'Courier New'";
    ctx.fillStyle = "#1e293b";
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], 20 + (i * 25), 32 + (Math.random() * 10 - 5));
    }
  };

  useEffect(() => { generateCaptcha(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInput.toUpperCase() !== captchaText) {
      toast.error("Invalid Security Code.");
      return generateCaptcha();
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL_PORTAL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Login successful");
        onLoginSuccess(data.user, data.token);
      } else {
        toast.error(data.message || "Invalid Credentials");
      }
    } catch {
      toast.error("Backend is not responding.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-red-600 p-8 text-center">
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Bluestone CRM</h1>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Leads Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type="email" placeholder="Email" required 
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type="password" placeholder="Password" required 
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verify Identity</span>
                <button type="button" onClick={generateCaptcha} className="text-red-600 hover:rotate-90 transition-transform"><RefreshCw size={14} /></button>
             </div>
             <canvas ref={canvasRef} width="200" height="50" className="mx-auto rounded" />
             <input 
               type="text" placeholder="Type letters above" required value={userInput}
               onChange={(e) => setUserInput(e.target.value)}
               className="w-full px-4 py-2 border rounded-lg text-center font-bold uppercase text-sm focus:border-red-500 outline-none"
             />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-slate-900 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:bg-slate-300"
          >
            {loading ? "Authenticating..." : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

