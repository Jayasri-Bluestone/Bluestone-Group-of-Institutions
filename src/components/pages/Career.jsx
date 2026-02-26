import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ArrowRight, X, Send, User, Mail, 
  Phone, FileText, DollarSign, LayoutGrid, 
  List, Search, ChevronLeft, ChevronRight, Award,
  Clock, CheckCircle2, Briefcase
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '../../apiConfig';
import { Button } from '../ui/button';

export function CareersPage({ jobs = [] }) {
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Filter & Pagination States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- Logic: Filter, Sort, then Paginate ---
  const filteredJobs = useMemo(() => {
    let result = Array.isArray(jobs) ? [...jobs] : [];
    
    if (searchQuery) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterCategory !== 'All') {
      result = result.filter(job => job.category === filterCategory);
    }
    
    result.sort((a, b) => {
      if (sortOrder === 'title') return a.title.localeCompare(b.title);
      return b.id - a.id; 
    });
    return result;
  }, [jobs, searchQuery, filterCategory, sortOrder]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const currentJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginate = (n) => { 
    setCurrentPage(n); 
    window.scrollTo({ top: 250, behavior: 'smooth' }); 
  };

  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting application...");
    const data = new FormData(e.currentTarget);
    if (selectedJob) data.append('job_title', selectedJob.title);

    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/apply`, { method: 'POST', body: data });
      if (res.ok) {
        toast.success("Application submitted!", { id: loadingToast });
        setIsModalOpen(false);
      } else {
        toast.error("Submission failed.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Server error.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen font-sans">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Careers at <span className="text-red-600">Bluestone</span></h1>
          <p className="text-gray-500 text-lg">Join a team of innovators and creators.</p>
        </div>

        {/* --- CONTROL BAR --- */}
        <div className="bg-white p-3 rounded-[2rem] shadow-sm mb-8 flex flex-wrap items-center gap-4">
            <div className="relative flex-grow min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search jobs..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-red-500" 
                    value={searchQuery} 
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                />
            </div>
            
            <div className="flex items-center gap-2">
                <select 
                    className="bg-gray-50 border-none outline-none p-3 rounded-xl font-bold text-gray-600 text-sm cursor-pointer"
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                >
                    <option value="All">All Categories</option>
                    <option value="Education">Education</option>
                    <option value="Technology">Technology</option>
                </select>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-red-600' : 'text-gray-400'}`}><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-red-600' : 'text-gray-400'}`}><List size={20} /></button>
                </div>
            </div>
        </div>

        {/* --- JOB LISTINGS --- */}
        {/* --- JOB LISTINGS --- */}
{currentJobs.length > 0 ? (
  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
    {currentJobs.map((job) => (
      <motion.div 
        layout
        key={job.id} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white border hover:shadow-xl transition-all flex group ${
          viewMode === 'grid' 
            ? 'p-8 rounded-[2.5rem] flex-col h-full shadow-sm' 
            : 'p-4 md:px-8 md:py-5 rounded-2xl flex-row items-center justify-between shadow-xs'
        }`}
      >
        <div className={viewMode === 'list' ? "flex items-center gap-8 flex-grow" : "flex flex-col flex-grow"}>
          <span className={`w-fit px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full ${viewMode === 'grid' ? 'mb-4' : 'hidden lg:block'}`}>
            {job.category}
          </span>

          <div className="flex flex-col">
            <h3 className={`${viewMode === 'grid' ? 'text-2xl mb-4' : 'text-lg mb-1'} font-bold text-gray-900 group-hover:text-red-600 transition-colors`}>
              {job.title}
            </h3>
            <div className={`flex flex-wrap gap-4 text-gray-400 text-xs font-medium ${viewMode === 'grid' ? 'mb-6' : ''}`}>
              <span className="flex items-center gap-1"><MapPin size={14} className="text-red-500"/> {job.location}</span>
              <span className="flex items-center gap-1"><Clock size={14}/> {job.type}</span>
            </div>
          </div>
        </div>

        <div className={viewMode === 'list' ? "ml-4" : "mt-auto pt-4"}>
          <button 
            onClick={() => openModal(job)} 
            className={`flex items-center justify-center gap-2 bg-gray-900 text-white font-bold hover:bg-red-600 transition-all ${
              viewMode === 'grid' ? 'w-full py-4 rounded-2xl shadow-lg hover:shadow-red-100' : 'px-8 py-2.5 rounded-xl text-sm'
            }`}
          >
            {viewMode === 'grid' ? 'View & Apply' : 'Apply'} <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    ))}
  </div>
) : (
  /* --- NO OPENINGS STATE --- */
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200"
  >
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
      <Briefcase className="text-gray-300" size={40} />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Current Openings</h3>
    <p className="text-gray-500 max-w-sm mx-auto mb-8">
      {searchQuery || filterCategory !== 'All' 
        ? "We couldn't find any jobs matching your current filters." 
        : "We don't have any open positions at the moment, but we're always looking for talent!"}
    </p>
    <Button 
      onClick={() => {setSearchQuery(''); setFilterCategory('All');}}
      className="bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-red-600 transition-colors"
    >
      Clear All Filters
    </Button>
  </motion.div>
)}

        {/* --- PAGINATION SECTION --- */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-2">
            <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="p-3 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => paginate(i + 1)} 
                className={`w-11 h-11 rounded-xl font-bold transition-all ${
                    currentPage === i + 1 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-100 scale-110' 
                    : 'bg-white text-gray-400 border border-gray-100 hover:border-red-400 hover:text-red-600'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* --- DETAILED MODAL (Full View + Application Form) --- */}
      <AnimatePresence>
        {isModalOpen && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
                
                {/* Left Side: Job Details */}
                <div className="w-full md:w-1/2 bg-gray-50 p-8 md:p-12 overflow-y-auto border-r border-gray-100">
                    <button onClick={() => setIsModalOpen(false)} className="md:hidden absolute top-4 right-4 p-2 bg-white rounded-full shadow-md"><X size={20}/></button>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg">{selectedJob.category}</span>
                        <span className="px-3 py-1 bg-white border text-gray-500 text-[10px] font-black uppercase rounded-lg">{selectedJob.type}</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{selectedJob.title}</h2>
                    <p className="flex items-center gap-1.5 text-red-600 font-bold mb-8 italic"><MapPin size={16}/> {selectedJob.location}</p>

                    <div className="space-y-8">
                        {selectedJob.salary && (<div><h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Salary</h4><p className="text-xl font-bold text-green-600">{selectedJob.salary}</p></div>)}
                        {selectedJob.description && (<div><h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Role Description</h4><p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{selectedJob.description}</p></div>)}
                        {selectedJob.skills && (
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.skills.split(',').map((s,i) => (
                                        <span key={i} className="bg-white border text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm text-gray-700">
                                            <CheckCircle2 size={12} className="text-red-500"/> {s.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 bg-white overflow-y-auto relative">
                    <button onClick={() => setIsModalOpen(false)} className="hidden md:block absolute top-8 right-8 p-2 text-gray-400 hover:text-red-600"><X size={24}/></button>
                    <div className="mb-8"><h3 className="text-2xl font-bold">Apply Now</h3><p className="text-gray-400 text-sm mt-1">Submit your profile to join us.</p></div>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} /><input name="fullName" type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500" required /></div>
                        <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} /><input name="email" type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500" required /></div>
                        <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} /><input name="phone" type="tel" placeholder="Phone Number" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-500" required /></div>
                           <div className="relative">

                  <FileText className="absolute left-4 top-4 text-gray-400" size={18} />

                  <textarea name="message" rows="4" placeholder="Briefly tell us why you're a good fit..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all resize-none"></textarea>

                </div>
                        <div className="pt-2"><label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Resume (PDF)</label><input name="resume" type="file" accept=".pdf" required className="text-sm cursor-pointer w-full text-gray-400" /></div>
                        <button disabled={isSubmitting} className="w-full py-5 rounded-2xl font-black text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95">{isSubmitting ? 'SENDING...' : 'SUBMIT APPLICATION'}</button>
                    </form>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}