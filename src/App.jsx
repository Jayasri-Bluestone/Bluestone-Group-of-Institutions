"use client";

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
// --- MAIN COMPONENTS ---
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BusinessFocus } from './components/BusinessFocus';
import { OurPeople } from './components/OurPeople';
import { Logos } from './components/Logos';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import {AboutPage} from './components/pages/About';
import AboutBluestone from './components/AboutBluestone';


// --- PAGE IMPORTS ---
import { InternationalPreschool } from './components/pages/InternationalPreschool';
import { OverseasConsulting } from './components/pages/OverseasConsulting';
import { IASAcademy } from './components/pages/IASAcademy';
import { PlacementServices } from './components/pages/PlacementServices';
import { TechPark } from './components/pages/TechPark';
import { SportAcademy } from './components/pages/SportAcademy';
import { LanguageHub } from './components/pages/LanguageHub';
import { BusinessIdeas } from './components/pages/BusinessIdeas';
import { OtherServices } from './components/pages/OtherServices';

// --- ADMIN IMPORTS ---
import { AdminLogin } from './components/Login/AdminLogin';
import { AdminLayout } from './components/Login/AdminLayout';
import { AdminDashboard } from './components/Login/AdminDashboard';
import { AdminLeads } from './components/Login/AdminLeads';
import { ApprovedLeads } from './components/Login/ApprovedLeads';
import { GalleryPage } from './components/pages/Gallery';
import { CareersPage } from './components/pages/Career';
import { AdminCareers } from './components/Login/AdminCareer';
import AdminApplicants from './components/Login/AdminApplicants';



// 1. Helper: Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// 2. Auth Guard: Checks if adminToken exists in localStorage
const ProtectedRoute = () => {
  const token = localStorage.getItem('adminToken');
  return token ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

// 3. Public Layout: Includes Navbar and Footer
const PublicLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);
export default function App() {
  // 1. Initialize state with localStorage to persist data on refresh
  const [jobs, setJobs] = useState([]);

  // 1. Fetch jobs from MySQL on load
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('https://bluestoneinternationalpreschool.com/bgoi_api/api/jobs');
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  // 2. Add Job (Update state AND Database)
  const addJob = async (newJob) => {
    try {
      const response = await fetch('https://bluestoneinternationalpreschool.com/bgoi_api/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });
      if (response.ok) {
        const result = await response.json();
        // Update UI with the ID returned from MySQL
        setJobs([...jobs, { ...newJob, id: result.id }]);
      }
    } catch (err) {
      alert("Failed to save to database");
    }
  };

  // 3. Delete Job (Update state AND Database)
  const deleteJob = async (jobId) => {
    try {
      await fetch(`https://bluestoneinternationalpreschool.com/bgoi_api/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
      });
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      alert("Failed to delete from database");
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        
        {/* --- PUBLIC WEBSITE ROUTES --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={
            <>
              <Hero />
              <BusinessFocus />
              <AboutBluestone/>
              <OurPeople />
              <Contact />
              <Logos />
            </>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<Contact/>} />
          
          {/* FIXED: Passed the 'jobs' prop here */}
          <Route path="/career" element={<CareersPage jobs={jobs} />} />
          
          <Route path="/international-preschool" element={<InternationalPreschool />} />
          <Route path="/overseas-consulting" element={<OverseasConsulting />} />
          <Route path="/ias-academy" element={<IASAcademy />} />
          <Route path="/placement-services" element={<PlacementServices />} />
          <Route path="/tech-park" element={<TechPark />} />
          <Route path="/sport-academy" element={<SportAcademy />} />
          <Route path="/language-hub" element={<LanguageHub />} />
          <Route path="/business-ideas" element={<BusinessIdeas />} />
          <Route path="/other-services" element={<OtherServices />} />
        </Route>

        {/* --- ADMIN LOGIN ROUTE --- */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* --- PRIVATE ADMIN ROUTES --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="approved-leads" element={<ApprovedLeads />} />
            <Route 
              path="careers" 
              element={<AdminCareers jobs={jobs} onAddJob={addJob} onDeleteJob={deleteJob} />} 
            />
            <Route path="applicants" element={<AdminApplicants />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}