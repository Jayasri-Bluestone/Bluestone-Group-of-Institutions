import React, { useState } from "react";
import { User, ChevronLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL_PORTAL } from "../../../apiConfig";

const Profile = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    domain: user?.domain || "",
    avatar: user?.avatar || null,
    oldPassword: "",
    newPassword: "",
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const body = {
      name: profileData.name,
      phone: profileData.phone,
      avatarBase64: profileData.avatar,
      oldPassword: profileData.oldPassword,
      newPassword: profileData.newPassword,
    };

    const res = await fetch(`${API_BASE_URL_PORTAL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const json = await res.json();
      localStorage.setItem("user", JSON.stringify(json.user));
      if (onUpdateUser) onUpdateUser(json.user);
      
      // Clear password fields on success
      setProfileData(prev => ({...prev, oldPassword: "", newPassword: ""}));
      toast.success("Profile updated");
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.msg || err.error || "Profile update failed");
    }
  };

  return (
    <div className="bg-white w-full rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
       <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
          <button
             onClick={() => navigate(-1)}
             className="text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold text-sm"
          >
             <ChevronLeft size={16}/> Back
          </button>
       </div>
       <form
          onSubmit={handleProfileUpdate}
          className="p-6 space-y-4"
       >
         {/* Avatar Section */}
         <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-md relative group">
               {profileData.avatar ? (
                  <img src={profileData.avatar} alt="preview" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-400">
                     <User size={40} />
                  </div>
               )}
            </div>
            <div className="text-center">
               <label className="text-xs font-bold text-red-600 cursor-pointer hover:underline">
                  Change Photo
                  <input
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                           const reader = new FileReader();
                           reader.onloadend = () => setProfileData((prev) => ({ ...prev, avatar: reader.result }));
                           reader.readAsDataURL(file);
                        }
                     }}
                  />
               </label>
               <p className="text-[10px] text-slate-400 mt-1 uppercase">Max Size: 1MB</p>
            </div>
         </div>
         {/* Basic Info */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase">Full Name</label>
               <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 mt-1" />
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase">Phone Number</label>
               <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 mt-1" />
            </div>
            <div className="md:col-span-2">
               <label className="text-[10px] font-black text-slate-400 uppercase">Email (Permanent)</label>
               <input type="text" disabled value={user?.email} className="w-full p-2.5 border rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed mt-1" />
            </div>
         </div>
         <hr className="border-slate-100 max-w-2xl mx-auto my-6" />
         {/* Security Section */}
         <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Current Password</label>
                  <input type="password" placeholder="Required to set new password" value={profileData.oldPassword} onChange={(e) => setProfileData({ ...profileData, oldPassword: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 mt-1" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">New Password</label>
                  <input type="password" placeholder="Leave blank to keep current" value={profileData.newPassword} onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 mt-1" />
               </div>
            </div>
         </div>
         <div className="flex gap-3 pt-6 max-w-2xl mx-auto">
            <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-red-200">Save Changes</button>
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
         </div>
       </form>
    </div>
  );
};

export default Profile;
