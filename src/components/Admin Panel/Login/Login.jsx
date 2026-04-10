import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';
import { RiAdminFill, RiAdminLine } from 'react-icons/ri';
import loginBg from '../../../assets/bluestone.png';

const LoginPage = ({ onLoginSuccess }) => {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
  };

  useEffect(() => { generateCaptcha(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInput !== captchaText) {
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      {/* Background Image with Premium Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-110"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 backdrop-blur-[2px]" />

      <div className="relative z-10 bg-white/95 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20">
       <div className="bg-red-600 p-8 text-center text-white relative overflow-hidden">
                  {/* Decorative background for header */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
                  
                  <div className="relative z-10 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30 shadow-inner">
                    <RiAdminFill size={32} />
                  </div>
          <h1 className="relative z-10 text-2xl font-black text-white tracking-tighter uppercase">BGOI</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type="email" placeholder="Email" required 
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none text-sm transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type={showPassword ? "text" : "password"} placeholder="Password" required 
              className="w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none text-sm transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button
              type="button"
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Captcha Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Security Check</label>
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between px-4 py-2 opacity-80 select-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)' }}>
                <span className="font-mono text-xl font-bold tracking-[0.3em] text-slate-700 italic">{captchaText}</span>
                <button type="button" onClick={generateCaptcha} className="text-slate-400 hover:text-red-600 transition-colors p-1">
                  <RefreshCw size={18} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter Code"
                required
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-center font-bold tracking-wider"
              />
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-red-600 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:bg-slate-300"
          >
            {loading ? "Authenticating..." : "Login"} 
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

