import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Database, CheckCircle, Edit3, X, Save } from 'lucide-react';

const MasterManagement = () => {
  const [data, setData] = useState([]);
  
  // Create States
  const [newDomain, setNewDomain] = useState('');
  const [newCat, setNewCat] = useState({ domainId: '', name: '' });
  const [selection, setSelection] = useState({ catId: '', value: '' });

  // Edit States
  const [editingItem, setEditingItem] = useState({ type: null, id: null, value: '' });

  const fetchAll = async () => {
    try {
      const res = await fetch('http://localhost:5005/api/master/full-structure');
      const json = await res.json();
      setData(json);
    } catch (err) { console.error("Fetch failed", err); }
  };

  useEffect(() => { fetchAll(); }, []);

  // --- CREATE ACTIONS ---
  const addDomain = async () => {
    if (!newDomain) return;
    await fetch('http://localhost:5005/api/master/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ name: newDomain })
    });
    setNewDomain(''); fetchAll();
  };

  const addCategory = async () => {
    if (!newCat.domainId || !newCat.name) return;
    await fetch('http://localhost:5005/api/master/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ domain_id: newCat.domainId, name: newCat.name })
    });
    setNewCat({ ...newCat, name: '' }); fetchAll();
  };

  const addValue = async () => {
    if (!selection.catId || !selection.value) return;
    await fetch('http://localhost:5005/api/master/values', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ category_id: selection.catId, value: selection.value })
    });
    setSelection({ ...selection, value: '' }); fetchAll();
  };

  // --- EDIT ACTIONS ---
  const startEdit = (type, id, currentText) => {
    setEditingItem({ type, id, value: currentText });
  };

  const saveEdit = async () => {
    const { type, id, value } = editingItem;
    const endpoint = `http://localhost:5005/api/master/${type}/${id}`;
    
    // Map the payload key based on type (name for domain/cat, sub_value for value)
    const payload = type === 'values' ? { sub_value: value } : { name: value };

    await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(payload)
    });

    setEditingItem({ type: null, id: null, value: '' });
    fetchAll();
  };

  // --- DELETE ACTIONS ---
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type.slice(0, -1)}?`)) return;
    await fetch(`http://localhost:5005/api/master/${type}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchAll();
  };

  return (
    <div className="p-8 space-y-10 bg-slate-50 min-h-screen font-sans">
      <header className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
          <Database size={24}/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Master Setup</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hierarchy: Domain {'>'} Category {'>'} Value</p>
        </div>
      </header>

      {/* --- ADD SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="text-[10px] font-black uppercase text-blue-600 mb-2 block">Step 1: Domain</label>
          <div className="flex gap-2">
            <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. Overseas" value={newDomain} onChange={e=>setNewDomain(e.target.value)}/>
            <button onClick={addDomain} className="bg-slate-800 text-white p-2 rounded-lg hover:bg-black transition-colors"><Plus size={18}/></button>
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
          <label className="text-[10px] font-black uppercase text-blue-600 mb-2 block">Step 3: Sub-Value</label>
          <div className="space-y-2">
            <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" onChange={e=>setSelection({...selection, catId: e.target.value})}>
              <option>Select Category</option>
              {data.flatMap(d => d.categories || []).map(c => (
                <option key={c.id} value={c.id}>{c.domain_name} → {c.category_name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. IELTS" value={selection.value} onChange={e=>setSelection({...selection, value: e.target.value})}/>
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
                  <div className="flex gap-1 items-center w-full">
                    <input autoFocus className="text-xs p-1 border rounded w-full" value={editingItem.value} onChange={e=>setEditingItem({...editingItem, value: e.target.value})}/>
                    <button onClick={saveEdit} className="text-green-600"><Save size={14}/></button>
                    <button onClick={()=>setEditingItem({type:null})} className="text-slate-400"><X size={14}/></button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-black text-slate-800 uppercase text-xs truncate">{domain.name}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit('domains', domain.id, domain.name)} className="text-blue-400 hover:text-blue-600"><Edit3 size={14} /></button>
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
                  
                  {/* SUB-VALUES (Pills) */}
                  <div className="flex flex-wrap gap-1.5">
                    {cat.values?.map(val => (
                      <div key={val.id} className="group relative">
                        {editingItem.type === 'values' && editingItem.id === val.id ? (
                          <input 
                            autoFocus 
                            className="text-[10px] w-20 p-0.5 border rounded bg-white" 
                            value={editingItem.value} 
                            onBlur={saveEdit}
                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                            onChange={e=>setEditingItem({...editingItem, value: e.target.value})}
                          />
                        ) : (
                          <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-2 hover:border-blue-300 transition-all">
                            {val.sub_value}
                            <div className="flex items-center gap-1">
                              <button onClick={() => startEdit('values', val.id, val.sub_value)} className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-600 transition-opacity">
                                <Edit3 size={10} />
                              </button>
                              <button onClick={() => handleDelete('values', val.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity font-bold">
                                ×
                              </button>
                            </div>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterManagement;