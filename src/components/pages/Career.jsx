import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, ArrowRight, X, Send, User, Mail, Phone, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; // 1. Import Toast components

export function CareersPage({ jobs = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create a loading toast
    const loadingToast = toast.loading("Uploading resume and sending application...");

    const data = new FormData();
    data.append('job_title', selectedJob.title);
    data.append('fullName', e.target[0].value);
    data.append('email', e.target[1].value);
    data.append('phone', e.target[2].value);
    data.append('message', e.target[3].value);
    data.append('resume', e.target[4].files[0]);

    try {
      const res = await fetch('http://localhost:5000/api/jobs/apply', {
        method: 'POST',
        body: data, 
      });

      if (res.ok) {
        // 2. Success Toast
        toast.success("Success! Check your email for confirmation.", { id: loadingToast });
        setIsModalOpen(false);
        e.target.reset(); 
      } else {
        const errorData = await res.json();
        // 3. Error Toast from Server
        toast.error(`Error: ${errorData.error || "Failed to submit"}`, { id: loadingToast });
      }
    } catch (error) {
      console.error("Submission error:", error);
      // 4. Connection Error Toast
      toast.error("Could not connect to the server.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen relative">
      {/* 5. Add Toaster Container here */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Build Your Future with <span className="text-red-600">Bluestone</span>
          </h1>
          <p className="text-gray-600">Join our team and make an impact.</p>
        </div>

        {/* Job Grid */}
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
            <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">No current openings. Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                key={job.id}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group border border-transparent hover:border-red-100"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Briefcase size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{job.type}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{job.title}</h3>
                <p className="text-red-600 font-semibold mb-6">{job.category}</p>
                <div className="flex items-center gap-2 text-gray-500 mb-8">
                  <MapPin size={18} />
                  <span className="text-sm">{job.location}</span>
                </div>
                <button 
                  onClick={() => openModal(job)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold group-hover:bg-red-600 transition-all"
                >
                  Apply Now <ArrowRight size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-red-600 p-8 text-white relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-2">Application Form</p>
                <h2 className="text-2xl font-bold">Applying for: {selectedJob?.title}</h2>
              </div>

              <form className="p-8 space-y-4" onSubmit={handleSubmit}>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all" required />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all" required />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" placeholder="Phone Number" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all" required />
                </div>

                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea rows="4" placeholder="Briefly tell us why you're a good fit..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all resize-none"></textarea>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                    Upload Resume (PDF Only)
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf"
                    required
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer w-full" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 text-white py-4 rounded-2xl font-bold shadow-lg transition-all mt-6 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 shadow-red-200 hover:bg-red-700'}`}
                >
                  {isSubmitting ? 'Sending...' : 'Submit Application'} <Send size={18} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}