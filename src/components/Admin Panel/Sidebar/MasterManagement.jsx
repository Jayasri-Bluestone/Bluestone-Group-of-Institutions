import React, { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Database, CheckCircle, Edit3, X, Save } from 'lucide-react';
import * as Fa6Icons from 'react-icons/fa6';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io5';
import * as AiIcons from 'react-icons/ai';
import * as RiIcons from 'react-icons/ri';
import * as BiIcons from 'react-icons/bi';
import { confirmToast } from '../../../utils/toastConfirm';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';
import UserManagement from './UserManagement';

const ICON_PACKS = {
  fa6: Fa6Icons,
  md: MdIcons,
  io5: IoIcons,
  ai: AiIcons,
  ri: RiIcons,
  bi: BiIcons,
};

const DEFAULT_ICON_KEY = 'fa6:FaLayerGroup';
const EMPTY_EDITING_ITEM = {
  type: null,
  id: null,
  value: '',
  icon_type: 'default',
  icon_name: DEFAULT_ICON_KEY,
  logo_url: '',
};

const getReactIconComponentByKey = (iconKey) => {
  if (!iconKey) return Fa6Icons.FaLayerGroup;
  if (!iconKey.includes(':')) {
    return Fa6Icons[iconKey] || Fa6Icons.FaLayerGroup;
  }
  const [pack, iconName] = iconKey.split(':');
  const source = ICON_PACKS[pack];
  if (!source) return Fa6Icons.FaLayerGroup;
  return source[iconName] || Fa6Icons.FaLayerGroup;
};

const MasterManagement = () => {
  const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('domain_setup');
  const [hierarchy, setHierarchy] = useState([]);
  const [newHierarchy, setNewHierarchy] = useState({ tier: 'ADMIN', role_name: '' });
  const [editingHierarchy, setEditingHierarchy] = useState(null);
  const [hierarchyPage, setHierarchyPage] = useState(1);
  const [hierarchyItemsPerPage, setHierarchyItemsPerPage] = useState(10);
  
  const actualItemsPerPage = hierarchyItemsPerPage === 'all' ? Math.max(1, hierarchy.length) : hierarchyItemsPerPage;
  const totalHierarchyPages = Math.ceil(hierarchy.length / actualItemsPerPage);
  const currentHierarchyData = hierarchy.slice(
    (hierarchyPage - 1) * actualItemsPerPage,
    hierarchyPage * actualItemsPerPage
  );
  
  // Create States
  const [newDomain, setNewDomain] = useState('');
  const [newDomainIconType, setNewDomainIconType] = useState('default');
  const [newDomainIconName, setNewDomainIconName] = useState(DEFAULT_ICON_KEY);
  const [iconSearch, setIconSearch] = useState('');
  const [newDomainLogo, setNewDomainLogo] = useState('');
  const [newCat, setNewCat] = useState({ domainId: '', name: '' });
  const [selection, setSelection] = useState({ catId: '', value: '' });
  const fileInputRef = useRef(null);
  
  // Custom dropdown states for sub-values
  const [openSubValuesCatId, setOpenSubValuesCatId] = useState(null);

  // Edit States
  const [editingItem, setEditingItem] = useState(EMPTY_EDITING_ITEM);
  const [editIconSearch, setEditIconSearch] = useState('');

  const allIconOptions = useMemo(() => {
    return Object.entries(ICON_PACKS).flatMap(([pack, icons]) =>
      Object.entries(icons)
        .filter(([iconName, IconComp]) => iconName !== 'IconContext' && typeof IconComp === 'function')
        .map(([iconName, IconComp]) => ({
          key: `${pack}:${iconName}`,
          label: iconName,
          pack,
          component: IconComp,
        })),
    );
  }, []);

  const filteredIconOptions = useMemo(() => {
    const q = iconSearch.trim().toLowerCase();
    if (!q) return allIconOptions.slice(0, 120);
    return allIconOptions
      .filter((item) => `${item.label} ${item.pack}`.toLowerCase().includes(q))
      .slice(0, 150);
  }, [allIconOptions, iconSearch]);

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/full-structure`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Fetch failed", err);
      toast.error("Failed to load master data");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchHierarchy = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      setHierarchy(await res.json());
    } catch {
      toast.error("Failed to load user hierarchy");
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchAll();
      fetchHierarchy();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const addHierarchyRole = async () => {
    if (!newHierarchy.role_name.trim()) return;
    const ok = await confirmToast(`Add new role "${newHierarchy.role_name}" to ${newHierarchy.tier}?`, "Add Role");
    if (!ok) return;
    const tid = toast.loading("Adding role...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newHierarchy),
      });
      if (!res.ok) throw new Error();
      toast.success("Role added", { id: tid });
      setNewHierarchy({ tier: 'ADMIN', role_name: '' });
      fetchHierarchy();
    } catch {
      toast.error("Failed to add role", { id: tid });
    }
  };

  const saveHierarchyRole = async () => {
    if (!editingHierarchy?.role_name?.trim()) return;
    const ok = await confirmToast("Save changes to this role?", "Save Changes");
    if (!ok) return;
    const tid = toast.loading("Saving role...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy/${editingHierarchy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editingHierarchy),
      });
      if (!res.ok) throw new Error();
      toast.success("Role updated", { id: tid });
      setEditingHierarchy(null);
      fetchHierarchy();
    } catch {
      toast.error("Failed to update role", { id: tid });
    }
  };

  const toggleHierarchyStatus = async (row) => {
    const action = Number(row.is_active) === 1 ? 'Deactivate' : 'Activate';
    const ok = await confirmToast(`${action} role "${row.role_name}"?`, action);
    if (!ok) return;
    const tid = toast.loading("Updating status...");
    try {
      const updatedRow = { ...row, is_active: row.is_active ? 0 : 1 };
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy/${row.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedRow),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated", { id: tid });
      fetchHierarchy();
    } catch {
      toast.error("Failed to update status", { id: tid });
    }
  };

  const deleteHierarchyRole = async (id) => {
    const ok = await confirmToast("Delete this hierarchy role?", "Delete");
    if (!ok) return;
    const tid = toast.loading("Deleting role...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Role deleted", { id: tid });
      fetchHierarchy();
    } catch {
      toast.error("Failed to delete role", { id: tid });
    }
  };

  // --- CREATE ACTIONS ---
  const addDomain = async () => {
    if (!newDomain) return;
    if (newDomainIconType === 'logo' && !newDomainLogo) {
      toast.error('Please upload a logo image');
      return;
    }
    const tid = toast.loading("Adding domain...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          name: newDomain,
          icon_type: newDomainIconType,
          icon_name: newDomainIconType === 'react_icon' ? newDomainIconName : null,
          logo_url: newDomainIconType === 'logo' ? newDomainLogo : null
        })
      });
      if (!res.ok) throw new Error();
      toast.success("Domain added", { id: tid });
      setNewDomain('');
      setNewDomainIconType('default');
      setNewDomainIconName(DEFAULT_ICON_KEY);
      setIconSearch('');
      setNewDomainLogo('');
      fetchAll();
    } catch {
      toast.error("Failed to add domain", { id: tid });
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewDomainLogo(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const renderDomainIconPreview = () => {
    if (newDomainIconType === 'logo' && newDomainLogo) {
      return (
        <img
          src={newDomainLogo}
          alt="logo preview"
          className="w-8 h-8 rounded object-cover border border-slate-200"
        />
      );
    }
    if (newDomainIconType === 'react_icon') {
      const IconComp = getReactIconComponentByKey(newDomainIconName);
      return <IconComp className="w-5 h-5 text-slate-700" />;
    }
    return <Fa6Icons.FaLayerGroup className="w-5 h-5 text-slate-700" />;
  };

  const addCategory = async () => {
    if (!newCat.domainId || !newCat.name) return;
    const tid = toast.loading("Adding category...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ domain_id: newCat.domainId, name: newCat.name })
      });
      if (!res.ok) throw new Error();
      toast.success("Category added", { id: tid });
      setNewCat({ ...newCat, name: '' });
      fetchAll();
    } catch {
      toast.error("Failed to add category", { id: tid });
    }
  };

  const addValue = async () => {
    if (!selection.catId || !selection.value) return;
    const tid = toast.loading("Adding value...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ category_id: selection.catId, value: selection.value })
      });
      if (!res.ok) throw new Error();
      toast.success("Value added", { id: tid });
      setSelection({ ...selection, value: '' });
      fetchAll();
    } catch {
      toast.error("Failed to add value", { id: tid });
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selection.catId) {
      toast.error("Please select a Category first.");
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      if (!text) return;

      // Basic CSV parsing: split by newlines and commas, ignore empty
      const rawValues = text.split(/[\r\n,]+/).map(v => v.trim()).filter(v => v);
      
      if (rawValues.length === 0) {
        toast.error("No valid values found in CSV");
        return;
      }

      const tid = toast.loading(`Uploading ${rawValues.length} values...`);
      try {
        const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/values/bulk`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify({ category_id: selection.catId, values: rawValues })
        });
        
        const contentType = res.headers.get("content-type");
        if (!res.ok) {
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                throw new Error(data.error || data.msg || 'Upload failed');
            } else {
                throw new Error(`Upload failed with status: ${res.status}`);
            }
        }
        
        const data = await res.json();
        toast.success(data.msg || "Values uploaded", { id: tid });
        fetchAll();
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to bulk upload", { id: tid });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- EDIT ACTIONS ---
  const startEdit = (type, id, currentText, extra = {}) => {
    setEditingItem({
      ...EMPTY_EDITING_ITEM,
      type,
      id,
      value: currentText,
      ...extra,
    });
    setEditIconSearch('');
  };

  const saveEdit = async () => {
    const { type, id, value } = editingItem;
    const endpoint = `${API_BASE_URL_PORTAL}/api/master/${type}/${id}`;
    
    // Map the payload key based on type (name for domain/cat, sub_value for value)
    const payload = type === 'values'
      ? { sub_value: value }
      : type === 'domains'
        ? {
            name: value,
            icon_type: editingItem.icon_type || 'default',
            icon_name: editingItem.icon_type === 'react_icon' ? (editingItem.icon_name || DEFAULT_ICON_KEY) : null,
            logo_url: editingItem.icon_type === 'logo' ? (editingItem.logo_url || null) : null,
          }
        : { name: value };

    const tid = toast.loading("Saving changes...");
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      toast.success("Updated successfully", { id: tid });
      setEditingItem(EMPTY_EDITING_ITEM);
      setEditIconSearch('');
      fetchAll();
    } catch {
      toast.error("Update failed", { id: tid });
    }
  };

  // --- DELETE ACTIONS ---
  const handleDelete = async (type, id) => {
    const confirmed = await confirmToast(`Delete this ${type.slice(0, -1)}?`, "Delete");
    if (!confirmed) return;

    const tid = toast.loading("Deleting...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted successfully", { id: tid });
      fetchAll();
    } catch {
      toast.error("Delete failed", { id: tid });
    }
  };

  const handleEditLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditingItem((prev) => ({
        ...prev,
        icon_type: 'logo',
        logo_url: String(reader.result || ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const filteredEditIconOptions = useMemo(() => {
    const q = editIconSearch.trim().toLowerCase();
    if (!q) return allIconOptions.slice(0, 120);
    return allIconOptions
      .filter((item) => `${item.label} ${item.pack}`.toLowerCase().includes(q))
      .slice(0, 150);
  }, [allIconOptions, editIconSearch]);

  return (
    <div className="p-8 space-y-10 bg-slate-50 min-h-screen font-sans">
      <header className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
          <Database size={24}/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Master Setup</h1>
        </div>
      </header>

      <div className="bg-white p-2 rounded-xl border border-slate-200 inline-flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('domain_setup')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide ${
            activeTab === 'domain_setup' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Domain Setup
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('user_management')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide ${
            activeTab === 'user_management' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('content_images')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide ${
            activeTab === 'content_images' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Content & Images
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('user_hierarchy')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide ${
            activeTab === 'user_hierarchy' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Hierarchy
        </button>
      </div>

      {activeTab === 'domain_setup' && (
      <>
      {/* --- ADD SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="text-[10px] font-black uppercase text-blue-600 mb-2 block">Step 1: Domain</label>
          <div className="space-y-2">
            <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. Overseas" value={newDomain} onChange={e=>setNewDomain(e.target.value)}/>
            <select
              className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
              value={newDomainIconType}
              onChange={(e) => setNewDomainIconType(e.target.value)}
            >
              <option value="default">Default Icon</option>
              <option value="react_icon">React Icon</option>
              <option value="logo">Upload Logo</option>
            </select>

            {newDomainIconType === 'react_icon' && (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                  placeholder="Search icons (e.g. user, chart, school)"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                />
                <div className="max-h-44 overflow-y-auto border rounded-lg bg-slate-50 p-2 grid grid-cols-6 gap-2">
                  {filteredIconOptions.map((opt) => {
                    const IconComp = opt.component;
                    const selected = newDomainIconName === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        title={`${opt.pack}:${opt.label}`}
                        onClick={() => setNewDomainIconName(opt.key)}
                        className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors ${
                          selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <IconComp size={16} />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                  Selected: {newDomainIconName}
                </p>
              </div>
            )}

            {newDomainIconType === 'logo' && (
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
              />
            )}

            <div className="flex items-center justify-between border rounded-lg p-2 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-500">Icon Preview</span>
              {renderDomainIconPreview()}
            </div>

            <button onClick={addDomain} className="bg-slate-800 text-white p-2 rounded-lg hover:bg-black transition-colors w-full flex items-center justify-center"><Plus size={18}/></button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="text-[10px] font-black uppercase text-blue-600 mb-2 block">Step 2: Category</label>
          <div className="space-y-2">
            <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" onChange={e=>setNewCat({...newCat, domainId: e.target.value})}>
              <option>Select Domain</option>
              {data.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. Test Prep" value={newCat.name} onChange={e=>setNewCat({...newCat, name: e.target.value})}/>
              <button onClick={addCategory} className="bg-slate-800 text-white p-2 rounded-lg hover:bg-black transition-colors"><Plus size={18}/></button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="text-[10px] font-black uppercase text-blue-600 mb-2 flex items-center justify-between">
            <span>Step 3: Sub-Value</span>
            <div className="flex items-center gap-1">
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded text-[9px] font-bold uppercase transition-colors flex items-center gap-1 border border-emerald-200"
                  title="Upload CSV of values"
               >
                 <Database size={10} /> Import CSV
               </button>
               <input 
                  type="file" 
                  accept=".csv,.txt"
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleBulkUpload} 
               />
            </div>
          </label>
          <div className="space-y-2">
            <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" onChange={e=>setSelection({...selection, catId: e.target.value})}>
              <option>Select Category</option>
              {data.flatMap(d => d.categories || []).map(c => (
                <option key={c.id} value={c.id}>{c.domain_name} → {c.category_name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. IELTS" value={selection.value} onKeyDown={e => e.key === 'Enter' && addValue()} onChange={e=>setSelection({...selection, value: e.target.value})}/>
              <button onClick={addValue} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"><CheckCircle size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* --- LIVE HIERARCHY WITH EDIT/DELETE --- */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] flex justify-between">
          <span>Live Master Structure</span>
          <span className="text-slate-400">MD/GM Access Only</span>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.map(domain => (
            <div key={domain.id} className="space-y-4 bg-red-50/50 p-5 rounded-2xl border border-slate-100 hover:border-blue-200">
              
              {/* DOMAIN HEADER */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                {editingItem.type === 'domains' && editingItem.id === domain.id ? (
                  <div className="w-full space-y-2">
                    <input
                      autoFocus
                      className="text-xs p-1 border rounded w-full"
                      value={editingItem.value}
                      onChange={e=>setEditingItem({...editingItem, value: e.target.value})}
                    />

                    <select
                      className="w-full p-1 border rounded bg-slate-50 text-xs"
                      value={editingItem.icon_type}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, icon_type: e.target.value }))
                      }
                    >
                      <option value="default">Default Icon</option>
                      <option value="react_icon">React Icon</option>
                      <option value="logo">Upload Logo</option>
                    </select>

                    {editingItem.icon_type === 'react_icon' && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          className="w-full p-1 border rounded bg-slate-50 text-xs"
                          placeholder="Search icons"
                          value={editIconSearch}
                          onChange={(e) => setEditIconSearch(e.target.value)}
                        />
                        <div className="max-h-28 overflow-y-auto border rounded bg-slate-50 p-1 grid grid-cols-7 gap-1">
                          {filteredEditIconOptions.map((opt) => {
                            const IconComp = opt.component;
                            const selected = editingItem.icon_name === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                title={`${opt.pack}:${opt.label}`}
                                onClick={() => setEditingItem((prev) => ({ ...prev, icon_name: opt.key }))}
                                className={`h-7 w-7 rounded border flex items-center justify-center ${
                                  selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                <IconComp size={13} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {editingItem.icon_type === 'logo' && (
                      <div className="space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditLogoUpload}
                          className="w-full p-1 border rounded bg-slate-50 text-xs"
                        />
                        {editingItem.logo_url && (
                          <img
                            src={editingItem.logo_url}
                            alt="domain logo preview"
                            className="w-6 h-6 rounded object-cover border border-slate-200"
                          />
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      <button onClick={saveEdit} className="text-green-600"><Save size={14}/></button>
                      <button onClick={() => { setEditingItem(EMPTY_EDITING_ITEM); setEditIconSearch(''); }} className="text-slate-400"><X size={14}/></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      {domain.icon_type === 'logo' && domain.logo_url ? (
                        <img
                          src={domain.logo_url}
                          alt={domain.name}
                          className="w-5 h-5 rounded object-cover border border-slate-200"
                        />
                      ) : domain.icon_type === 'react_icon' ? (
                        React.createElement(getReactIconComponentByKey(domain.icon_name), { className: 'w-4 h-4 text-slate-600 shrink-0' })
                      ) : (
                        <Fa6Icons.FaLayerGroup className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <h3 className="font-black text-slate-800 uppercase text-xs truncate">{domain.name}</h3>
                    </div>
                    <div className="flex gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          startEdit('domains', domain.id, domain.name, {
                            icon_type: domain.icon_type || 'default',
                            icon_name: domain.icon_name || DEFAULT_ICON_KEY,
                            logo_url: domain.logo_url || '',
                          })
                        }
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete('domains', domain.id)} className="text-red-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </>
                )}
              </div>

              {/* CATEGORIES */}
              {domain.categories?.map(cat => (
                <div key={cat.id} className="pl-2 space-y-2 border-l-2 border-slate-200">
                  <div className="flex justify-between items-center group">
                    {editingItem.type === 'categories' && editingItem.id === cat.id ? (
                       <div className="flex gap-1 items-center w-full bg-white p-1 rounded shadow-sm">
                          <input autoFocus className="text-[10px] p-1 border-none outline-none w-full font-bold uppercase" value={editingItem.value} onChange={e=>setEditingItem({...editingItem, value: e.target.value})}/>
                          <button onClick={saveEdit} className="text-green-600"><Save size={12}/></button>
                       </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.category_name}</span>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit('categories', cat.id, cat.category_name)} className="text-slate-300 hover:text-blue-500"><Edit3 size={10} /></button>
                          <button onClick={() => handleDelete('categories', cat.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={10} /></button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* SUB-VALUES (Dropdown Toggle) */}
                  <div className="mt-2">
                    {cat.values && cat.values.length > 0 ? (
                      <div className="relative">
                        <button 
                          onClick={() => setOpenSubValuesCatId(openSubValuesCatId === cat.id ? null : cat.id)}
                          className="text-[10px] font-bold uppercase flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          {cat.values.length} Sub-Values {openSubValuesCatId === cat.id ? '▲' : '▼'}
                        </button>
                        
                        {/* Dropdown Content */}
                        {openSubValuesCatId === cat.id && (
                          <div className="absolute z-10 top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded shadow-lg p-2 flex flex-col gap-1">
                            {cat.values.map(val => (
                              <div key={val.id} className="group relative flex justify-between items-center px-2 py-1 hover:bg-slate-50 rounded">
                                {editingItem.type === 'values' && editingItem.id === val.id ? (
                                  <input 
                                    autoFocus 
                                    className="text-[10px] w-full p-0.5 border rounded bg-white" 
                                    value={editingItem.value} 
                                    onBlur={saveEdit}
                                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                    onChange={e=>setEditingItem({...editingItem, value: e.target.value})}
                                  />
                                ) : (
                                  <>
                                    <span className="text-[10px] text-slate-700 font-medium truncate pr-2">
                                      {val.sub_value}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 pl-2">
                                      <button onClick={() => startEdit('values', val.id, val.sub_value)} className="text-blue-400 hover:text-blue-600">
                                        <Edit3 size={10} />
                                      </button>
                                      <button onClick={() => handleDelete('values', val.id)} className="text-slate-400 hover:text-red-500 font-bold">
                                        ×
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-400 italic">No sub-values</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {activeTab === 'user_management' && (
        <div className="rounded-2xl overflow-hidden">
          <UserManagement />
        </div>
      )}



      {activeTab === 'user_hierarchy' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">User Hierarchy Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                className="p-2 border rounded-lg text-sm bg-slate-50"
                value={newHierarchy.tier}
                onChange={(e) => setNewHierarchy((prev) => ({ ...prev, tier: e.target.value }))}
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
              <input
                className="p-2 border rounded-lg text-sm md:col-span-2"
                placeholder="Role name (e.g. Coordinator, Head)"
                value={newHierarchy.role_name}
                onChange={(e) => setNewHierarchy((prev) => ({ ...prev, role_name: e.target.value }))}
              />
              <button
                type="button"
                onClick={addHierarchyRole}
                className="bg-slate-900 text-white rounded-lg text-sm font-bold px-4 py-2 hover:bg-black"
              >
                Add Role
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wide">
              Maintained Roles
            </div>
            <div className="p-4 overflow-x-auto overflow-y-auto max-h-[500px] border-b border-slate-200">
              <table className="w-full text-sm relative">
                <thead className="text-[10px] uppercase text-slate-500 sticky top-0 bg-white z-10 shadow-sm">
                  <tr>
                    <th className="p-2 text-left">Tier</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-center">Status</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentHierarchyData.map((row) => {
                    const isEditing = editingHierarchy?.id === row.id;
                    return (
                      <tr key={row.id}>
                        <td className="p-2">
                          {isEditing ? (
                            <select
                              className="p-1 border rounded text-xs bg-slate-50"
                              value={editingHierarchy.tier}
                              onChange={(e) => setEditingHierarchy((prev) => ({ ...prev, tier: e.target.value }))}
                            >
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="STAFF">STAFF</option>
                            </select>
                          ) : row.tier}
                        </td>
                        <td className="p-2">
                          {isEditing ? (
                            <input
                              className="p-1 border rounded text-xs w-full"
                              value={editingHierarchy.role_name}
                              onChange={(e) => setEditingHierarchy((prev) => ({ ...prev, role_name: e.target.value }))}
                            />
                          ) : row.role_name}
                        </td>
                        <td className="p-2 text-center">
                          {isEditing ? (
                            <select
                              className="p-1 border rounded text-xs bg-slate-50"
                              value={Number(editingHierarchy.is_active)}
                              onChange={(e) => setEditingHierarchy((prev) => ({ ...prev, is_active: Number(e.target.value) }))}
                            >
                              <option value={1}>Active</option>
                              <option value={0}>Inactive</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => toggleHierarchyStatus(row)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out ${
                                Number(row.is_active) === 1 ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                              role="switch"
                              aria-checked={Number(row.is_active) === 1}
                              title={Number(row.is_active) === 1 ? "Click to Deactivate" : "Click to Activate"}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  Number(row.is_active) === 1 ? 'translate-x-2' : '-translate-x-2'
                                }`}
                              />
                            </button>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button onClick={saveHierarchyRole} className="text-green-600"><Save size={14} /></button>
                                <button onClick={() => setEditingHierarchy(null)} className="text-slate-400"><X size={14} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setEditingHierarchy({ ...row })} className="text-blue-500"><Edit3 size={14} /></button>
                                <button onClick={() => deleteHierarchyRole(row.id)} className="text-red-500"><Trash2 size={14} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {hierarchy.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200 text-xs shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <span>Show</span>
                    <select 
                      className="border border-slate-300 rounded p-1 bg-white text-slate-700 outline-none hover:border-blue-400 focus:border-blue-500"
                      value={hierarchyItemsPerPage}
                      onChange={(e) => {
                        setHierarchyItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                        setHierarchyPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="all">All</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500 font-medium tracking-wide">
                    Showing {((hierarchyPage - 1) * actualItemsPerPage) + 1} to {Math.min(hierarchyPage * actualItemsPerPage, hierarchy.length)} of {hierarchy.length} Roles
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={hierarchyPage === 1} 
                    onClick={() => setHierarchyPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={hierarchyPage === totalHierarchyPages} 
                    onClick={() => setHierarchyPage(p => Math.min(totalHierarchyPages, p + 1))}
                    className="px-3 py-1.5 border border-blue-600 rounded-md bg-blue-600 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-300 font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterManagement;
