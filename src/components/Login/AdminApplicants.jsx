import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Mail, Phone, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';

export default function AdminApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const response = await fetch('https://bluestoneinternationalpreschool.com/bgoi_api/api/admin/applications');
      const data = await response.json();
      setApplicants(data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
            <p className="text-gray-500">Manage and review incoming candidate resumes.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-sm font-medium text-gray-600">
            Total Applicants: {applicants.length}
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Candidate</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Applied For</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : applicants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Name & Message Mini-preview */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{applicant.full_name}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[200px]" title={applicant.message}>
                          {applicant.message || "No cover message"}
                        </div>
                      </td>

                      {/* Job Title Badge */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                          {applicant.job_title}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(applicant.applied_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Contact Info icons */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-gray-400" /> {applicant.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} className="text-gray-400" /> {applicant.phone}
                          </div>
                        </div>
                      </td>

                      {/* Resume Action */}
                      <td className="px-6 py-4 text-center">
                        {applicant.resume_path ? (
                          <a
                            href={`https://bluestoneinternationalpreschool.com/bgoi_api/${applicant.resume_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-md shadow-red-100"
                            title="Download PDF"
                          >
                            <FileDown size={20} />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300 italic">No file</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}