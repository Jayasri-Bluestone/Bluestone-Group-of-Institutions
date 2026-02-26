import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, Calendar, UserCheck } from 'lucide-react';

const SearchPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        if (query) {
            fetchResults();
        }
    }, [query]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5005/api/search/global?q=${query}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-xl font-black text-slate-800 uppercase">Global Search Results</h2>
                <p className="text-sm text-slate-500 font-medium italic">Showing results for: "{query}"</p>
            </div>

            {loading ? (
                <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Searching leads...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {results.length > 0 ? results.map(lead => (
                        <div key={lead.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center hover:border-blue-300 transition-all">
                            <div className="space-y-1">
                                <h3 className="font-bold text-slate-800">{lead.student_name}</h3>
                                <div className="flex gap-4 text-[11px] text-slate-500 font-bold">
                                    <span className="flex items-center gap-1"><Mail size={12}/> {lead.email}</span>
                                    <span className="flex items-center gap-1"><Phone size={12}/> {lead.phone}</span>
                                </div>
                            </div>
                            
                            <div className="mt-3 md:mt-0 text-left md:text-right">
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded uppercase">
                                    {lead.domain}
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                                    Status: <span className="text-slate-700">{lead.status}</span> • 
                                    Staff: <span className="text-slate-700">{lead.assigned_to_name || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white p-20 text-center rounded-xl border border-dashed border-slate-300">
                             <p className="text-slate-400 font-bold">No leads found across any domain for "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;