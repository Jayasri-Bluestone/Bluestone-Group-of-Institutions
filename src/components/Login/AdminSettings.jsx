import React, { useState } from 'react';
import { Save, ShieldCheck, UserCog, Lock } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

export default function AdminSettings() {
    const [formData, setFormData] = useState({ newUsername: '', newPassword: '' });
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        const confirmChange = window.confirm("This will change your login credentials immediately. Continue?");
        if (!confirmChange) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/update-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                alert("Success! Please use your new credentials next time you log in.");
                setFormData({ newUsername: '', newPassword: '' }); // Clear form
            } else {
                alert("Update failed: " + data.message);
            }
        } catch (error) {
            alert("Network error. Make sure your local server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-900 p-6 text-white flex items-center gap-4">
                    <ShieldCheck className="text-red-500" size={32} />
                    <div>
                        <h2 className="text-xl font-bold">Admin Credentials</h2>
                        <p className="text-slate-400 text-xs">Update your system access settings</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="p-8 space-y-5">
                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">New Username</label>
                        <div className="relative">
                            <UserCog className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                value={formData.newUsername}
                                onChange={(e) => setFormData({...formData, newUsername: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="password"
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <Save size={20} />
                        {loading ? "Saving Changes..." : "Update Credentials"}
                    </button>
                </form>
            </div>
        </div>
    );
}