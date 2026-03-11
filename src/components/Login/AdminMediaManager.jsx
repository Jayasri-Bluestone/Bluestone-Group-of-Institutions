"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Image as ImageIcon, Plus, Crop, Check, X, Tag, Loader2, Edit, Save } from 'lucide-react';
import Cropper from 'react-easy-crop';
import toast from 'react-hot-toast';
import { confirmToast } from '../../utils/toastConfirm';
import { API_BASE_URL } from '../../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';

const TABS = [
  { id: 'all', label: 'All Media' },
  { id: 'business_verticals', label: 'Business Verticals' },
  { id: 'about_us', label: 'About Us' },
  { id: 'our_teams', label: 'Our Teams' },
  { id: 'our_partners', label: 'Our Partners' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'focus', label: 'Business Focus' }
];

const FOCUS_SUB_CATS = [
  'Preschool', 'IAS', 'OCS', 'Tech', 'Lang Hub', 'Elite Sport', 'Placement', 'Start-up', 'Investment'
];

export function AdminMediaManager() {
  const [altText, setAltText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeSubCat, setActiveSubCat] = useState('');
  const [images, setImages] = useState([]);
  const [ourPeopleCards, setOurPeopleCards] = useState([]);
  const [loading, setLoading] = useState(false);

  // New state variables for Our People form
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [personForm, setPersonForm] = useState({ id: null, name: '', position: '', image_key: '', image_data: '', bio: '' });
  const [personImageToCrop, setPersonImageToCrop] = useState(null);

  const [editingImage, setEditingImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Sync logic for sub-categories
  useEffect(() => {
    if (activeTab === 'focus') {
      setActiveSubCat(FOCUS_SUB_CATS[0]);
    } else {
      setActiveSubCat('');
    }
  }, [activeTab]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'our_teams') {
        const res = await fetch(`${API_BASE_URL}/api/our_people`);
        const data = await res.json();
        setOurPeopleCards(Array.isArray(data) ? data : []);
      } else {
        const queryParam = activeTab === 'all' ? '' : `?category=${activeTab}`;
        let url = `${API_BASE_URL}/api/media${queryParam}`;

        if (activeTab === 'focus' && activeSubCat) {
          url += (queryParam ? '&' : '?') + `caption=${encodeURIComponent(activeSubCat)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setImages(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      toast.error("Could not sync data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [activeTab, activeSubCat]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const load = toast.loading("Processing & Uploading...");

    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: 'image/jpeg'
      };
      
      const compressedFile = await imageCompression(file, options);

      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64String,
          category: activeTab,
          alt_text: altText || file.name,
          caption: activeTab === 'focus' ? activeSubCat : ''
        })
      });

      if (!response.ok) throw new Error("Upload failed");

      toast.success("Uploaded successfully!", { id: load });
      setAltText(''); 
      e.target.value = ""; 
      fetchMedia();
      
    } catch (err) {
      toast.error(err.message, { id: load });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmToast("Delete this item?");
    if (!confirmed) return;
    const load = toast.loading("Deleting...");
    try {
      if (activeTab === 'our_teams') {
         const res = await fetch(`${API_BASE_URL}/api/admin/our_people/${id}`, { method: 'DELETE' });
         if (!res.ok) throw new Error("Delete failed");
         toast.success("Team member deleted", { id: load });
      } else {
         const res = await fetch(`${API_BASE_URL}/api/media/${id}`, { method: 'DELETE' });
         if (!res.ok) throw new Error("Delete failed");
         toast.success("Image deleted", { id: load });
      }
      fetchMedia();
    } catch (err) {
      toast.error(err.message, { id: load });
    }
  };

  const handleSavePerson = async () => {
    if (!personForm.name || !personForm.position) {
      toast.error("Name and Position are required.");
      return;
    }
    const load = toast.loading("Saving team member...");
    try {
      const isCreate = !personForm.id;
      const url = isCreate 
        ? `${API_BASE_URL}/api/admin/our_people` 
        : `${API_BASE_URL}/api/admin/our_people/${personForm.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(data.message || "Saved successfully!", { id: load });
      setIsEditingPerson(false);
      setPersonForm({ id: null, name: '', position: '', image_key: '', image_data: '', bio: '' });
      fetchMedia();
    } catch (err) {
      toast.error(err.message, { id: load });
    }
  };

  const handlePersonImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/jpeg' };
      const compressedFile = await imageCompression(file, options);
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      setPersonImageToCrop({ url: base64String, filename: file.name });
    } catch (err) {
      toast.error("Error processing image");
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSavePersonCrop = async () => {
    if (!croppedAreaPixels || !personImageToCrop) return;
    const load = toast.loading("Applying crop...");
    try {
      const image = new Image();
      image.src = personImageToCrop.url;
      await new Promise(r => image.onload = r);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width, croppedAreaPixels.height
      );

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      setPersonForm({ ...personForm, image_data: croppedBase64, image_key: personImageToCrop.filename });
      setPersonImageToCrop(null);
      toast.success("Crop applied", { id: load });
    } catch (e) {
      toast.error("Failed to crop", { id: load });
    }
  };

const handleSaveCrop = async () => {
  if (!croppedAreaPixels || !editingImage) return;
  const load = toast.loading("Saving changes...");

  try {
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = editingImage.url;
    await new Promise(r => image.onload = r);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x, croppedAreaPixels.y,
      croppedAreaPixels.width, croppedAreaPixels.height,
      0, 0,
      croppedAreaPixels.width, croppedAreaPixels.height
    );

    // Final cropped string
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8);

    const res = await fetch(`${API_BASE_URL}/api/media/edit/${editingImage.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          image: croppedBase64, // Key matches backend
          alt_text: editingImage.alt_text 
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Update failed");

    toast.success("Image updated!", { id: load });
    setEditingImage(null);
    fetchMedia(); 
  } catch (err) {
    console.error("Cropping Error:", err);
    toast.error(err.message, { id: load });
  }
};
  
  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[600px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Media Library</h2>
          <p className="text-gray-400 text-sm font-medium">Manage your website assets</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-3">
          {activeTab === 'our_teams' ? (
             <button
               onClick={() => {
                 setPersonForm({ id: null, name: '', position: '', image_key: '', image_data: '', bio: '' });
                 setIsEditingPerson(true);
               }}
               className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95"
             >
               <Plus size={20} /> Add Member
             </button>
          ) : activeTab !== 'all' ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Alt Description</label>
                <input 
                  type="text" 
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image..."
                  className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none w-64"
                />
              </div>

              <label className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold cursor-pointer hover:bg-red-700 transition-all active:scale-95">
                <Plus size={20} />
                Upload
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              </label>
            </>
          ) : (
            <p className="text-xs text-gray-400 italic mb-3">Select a category to upload new media</p>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-bold text-sm transition-all whitespace-nowrap relative ${
              activeTab === tab.id ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Sub-Category Filter */}
      <AnimatePresence mode='wait'>
        {activeTab === 'focus' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center gap-2 mb-8 p-5 bg-gray-50/50 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-2 mr-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              <Tag size={14} className="text-red-500" /> Focus Area:
            </div>
            {FOCUS_SUB_CATS.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubCat(sub)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubCat === sub ? 'bg-gray-900 text-white shadow-xl scale-105' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Grid / Our People Grid */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
          <p className="text-gray-400 font-medium">Syncing Library...</p>
        </div>
      ) : activeTab === 'our_teams' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {ourPeopleCards.map((person) => (
              <motion.div 
                key={person.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                <div className="h-64 flex-shrink-0 relative bg-gray-100 overflow-hidden">
                   <img 
                     src={person.image_data || (person.image_key ? `${API_BASE_URL}/api/media?category=our_teams` : "https://placehold.co/400x500?text=Member")} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                     onError={(e) => { e.target.src = "https://placehold.co/400x500?text=Error" }}
                   />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                     <button onClick={() => { setPersonForm(person); setIsEditingPerson(true); }} className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Edit size={20} /></button>
                     <button onClick={() => handleDelete(person.id)} className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg"><Trash2 size={20} /></button>
                   </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                   <h3 className="text-xl font-bold text-gray-900 mb-1">{person.name}</h3>
                   <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4 block">{person.position}</span>
                   <p className="text-sm text-gray-600 italic line-clamp-3">"{person.bio}"</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && ourPeopleCards.length === 0 && (
             <div className="col-span-full py-20 text-center">
               <p className="text-gray-400 font-bold">No team members found.</p>
             </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          <AnimatePresence>
            {images.map((img) => (
              <motion.div 
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Category Badge for 'All' Tab */}
                {activeTab === 'all' && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[8px] px-2 py-1 rounded-lg uppercase font-bold">
                      {img.category?.replace('_', ' ')}
                    </span>
                  </div>
                )}

                <img 
                  src={img.url} 
                  alt={img.alt_text} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                   <button onClick={() => setEditingImage(img)} className="p-3 bg-white text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Crop size={20} /></button>
                   <button onClick={() => handleDelete(img.id)} className="p-3 bg-white text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                    <p className="text-[10px] font-black text-gray-900 truncate uppercase">{img.alt_text || 'Untitled'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State for Media */}
      {!loading && activeTab !== 'our_teams' && images.length === 0 && (
        <div className="py-32 text-center">
          <ImageIcon size={32} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bold">No images found</p>
        </div>
      )}

      {/* CROP MODAL */}
      <AnimatePresence>
        {editingImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-3xl h-[500px] bg-gray-900 rounded-[3rem] overflow-hidden border border-white/10">
              <Cropper image={editingImage.url} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-xs">
               <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} className="w-full accent-red-600" />
               <div className="flex gap-4 w-full">
                <button onClick={() => setEditingImage(null)} className="flex-1 px-6 py-4 bg-white/10 text-white rounded-2xl font-bold"> Cancel </button>
                <button onClick={handleSaveCrop} className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold"> Apply </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* PERSON MODAL */}
      <AnimatePresence>
        {isEditingPerson && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-xl font-black">{personForm.id ? "Edit Team Member" : "Add Team Member"}</h3>
                 <button onClick={() => setIsEditingPerson(false)} className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full transition-all"><X size={20} /></button>
               </div>
               
               <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Name</label>
                     <input type="text" value={personForm.name} onChange={(e) => setPersonForm({...personForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. John Doe" />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Position</label>
                     <input type="text" value={personForm.position} onChange={(e) => setPersonForm({...personForm, position: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Coordinator" />
                   </div>
                 </div>

                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Bio</label>
                   <textarea rows={3} value={personForm.bio} onChange={(e) => setPersonForm({...personForm, bio: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none" placeholder="Short biography..." />
                 </div>

                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Photo (Square aspect recommended)</label>
                   <div className="flex items-center gap-4 mt-2">
                     <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {personForm.image_data ? (
                           <img src={personForm.image_data} className="w-full h-full object-cover" />
                        ) : personForm.image_key ? (
                           <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs text-gray-400 font-bold p-2 text-center break-all">{personForm.image_key}</div>
                        ) : (
                           <ImageIcon className="w-full h-full p-6 text-gray-300" />
                        )}
                     </div>
                     <label className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-bold cursor-pointer hover:bg-black transition-all">
                       <Plus size={16} /> Upload New Photo
                       <input type="file" className="hidden" accept="image/*" onChange={handlePersonImageUpload} />
                     </label>
                   </div>
                 </div>
               </div>

               <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
                  <button onClick={() => setIsEditingPerson(false)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">Cancel</button>
                  <button onClick={handleSavePerson} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 flex items-center gap-2">
                    <Save size={18} /> Save Member
                  </button>
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSON IMAGE CROP MODAL */}
      <AnimatePresence>
        {personImageToCrop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-3xl h-[500px] bg-gray-900 rounded-[3rem] overflow-hidden border border-white/10">
              <Cropper image={personImageToCrop.url} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-xs">
               <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} className="w-full accent-red-600" />
               <div className="flex gap-4 w-full">
                <button onClick={() => setPersonImageToCrop(null)} className="flex-1 px-6 py-4 bg-white/10 text-white rounded-2xl font-bold"> Cancel </button>
                <button onClick={handleSavePersonCrop} className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold"> Apply </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}