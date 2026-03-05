"use client";

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

// --- MAIN COMPONENTS ---
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BusinessFocus } from './components/BusinessFocus';
import { OurPeople } from './components/OurPeople';
import { Logos } from './components/Logos';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import AboutBluestone from './components/AboutBluestone';

// --- PAGE IMPORTS ---
import { AboutPage } from './components/pages/About';
import { InternationalPreschool } from './components/pages/InternationalPreschool';
import { OverseasConsulting } from './components/pages/OverseasConsulting';
import { IASAcademy } from './components/pages/IASAcademy';
import { PlacementServices } from './components/pages/PlacementServices';
import { TechPark } from './components/pages/TechPark';
import { SportAcademy } from './components/pages/SportAcademy';
import { LanguageHub } from './components/pages/LanguageHub';
import { BusinessIdeas } from './components/pages/BusinessIdeas';
import { OtherServices } from './components/pages/OtherServices';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import { GalleryPage } from './components/pages/Gallery';
import { CareersPage } from './components/pages/Career';

// --- ADMIN CMS IMPORTS (The /admin-login side) ---
import { AdminLogin } from './components/Login/AdminLogin';
import { AdminLayout } from './components/Login/AdminLayout';
import { AdminDashboard } from './components/Login/AdminDashboard';
import { AdminLeads } from './components/Login/AdminLeads';
import { ApprovedLeads } from './components/Login/ApprovedLeads';
import { AdminCareers } from './components/Login/AdminCareer';
import AdminApplicants from './components/Login/AdminApplicants';
import AdminSettings from './components/Login/AdminSettings';
import { AdminMediaManager } from './components/Login/AdminMediaManager';

// --- PORTAL CRM IMPORTS (The /login side) ---
import Layout from './components/Admin Panel/Layout/Layout';
import DomainPage from './components/Admin Panel/Sidebar/Domain';
import Dashboard from './components/Admin Panel/Sidebar/Dashboard';
import BGILeads from './components/Admin Panel/Sidebar/BGILeads';
import LeadDetails from './components/Admin Panel/Sidebar/LeadDetails';
import UserManagement from './components/Admin Panel/Sidebar/UserManagement';
import MasterManagement from './components/Admin Panel/Sidebar/MasterManagement';
import LiveFeedManager from './components/Admin Panel/Layout/Notification';
import LoginPage from './components/Admin Panel/Login/Login';

import { API_BASE_URL } from './apiConfig';

// Helper: Scroll to top
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Domain Resolver for Portal
const DomainResolver = ({ user }) => {
  const { slug } = useParams();
  const mapping = {
    ias: 'Bluestone IAS Academy',
    techpark: 'Bluestone Techpark',
    overseas: 'Bluestone Overseas',
    placements: 'Bluestone Placements',
    languages: 'Bluestone Language Hub',
    sports: 'Bluestone Elite Sports',
    preschool: 'Bluestone Preschool',
    startup: 'Bluestone Startup',
    'ias-academy': 'Bluestone IAS Academy',
    'bluestone-ias-academy': 'Bluestone IAS Academy',
    'bluestone-techpark': 'Bluestone Techpark',
    'bluestone-overseas': 'Bluestone Overseas',
    'bluestone-placements': 'Bluestone Placements',
    'bluestone-language-hub': 'Bluestone Language Hub',
    'bluestone-elite-sports': 'Bluestone Elite Sports',
    'bluestone-preschool': 'Bluestone Preschool',
    'bluestone-startup': 'Bluestone Startup',
  };
  const domainName = mapping[slug] || slug.replace(/-/g, ' ');
  return <DomainPage domain={domainName} user={user} />;
};

const LeadDetailsResolver = ({ user }) => {
  const { slug } = useParams();
  const mapping = {
    ias: 'Bluestone IAS Academy',
    techpark: 'Bluestone Techpark',
    overseas: 'Bluestone Overseas',
    placements: 'Bluestone Placements',
    languages: 'Bluestone Language Hub',
    sports: 'Bluestone Elite Sports',
    preschool: 'Bluestone Preschool',
    startup: 'Bluestone Startup',
    'ias-academy': 'Bluestone IAS Academy',
    'bluestone-ias-academy': 'Bluestone IAS Academy',
    'bluestone-techpark': 'Bluestone Techpark',
    'bluestone-overseas': 'Bluestone Overseas',
    'bluestone-placements': 'Bluestone Placements',
    'bluestone-language-hub': 'Bluestone Language Hub',
    'bluestone-elite-sports': 'Bluestone Elite Sports',
    'bluestone-preschool': 'Bluestone Preschool',
    'bluestone-startup': 'Bluestone Startup',
  };
  const domainName = mapping[slug] || slug.replace(/-/g, ' ');
  return <LeadDetails domain={domainName} user={user} />;
};

// Public Layout Wrapper
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [jobs, setJobs] = useState([]); // Initialize jobs state

  // Auth state
  const [auth, setAuth] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    return (savedUser && savedToken)
      ? { isAuthenticated: true, user: JSON.parse(savedUser) }
      : { isAuthenticated: false, user: null };
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const getTier = (user) => {
    if (user?.tier) return user.tier;
    if (['Main Admin', 'MD', 'GM'].includes(user?.role)) return 'SUPER_ADMIN';
    if (['TL', 'Coordinator', 'Head'].includes(user?.role)) return 'ADMIN';
    return 'STAFF';
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setAuth({ isAuthenticated: true, user: userData });
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ isAuthenticated: false, user: null });
  };

  if (isInitialLoading) {
    return (
      <div className="app-loader flex flex-col items-center justify-center h-screen">
        <div className="app-loader__spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        {/* --- 1. PUBLIC WEBSITE ROUTES --- */}
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
          <Route path="/privacy-policy" element={<PrivacyPolicy />} /> 
        </Route>

        {/* --- 2. AUTHENTICATION PAGES --- */}
        <Route path="/admin-login" element={<AdminLogin onLoginSuccess={handleLogin} />} />
        <Route path="/portal" element={!auth.isAuthenticated ? <LoginPage onLoginSuccess={handleLogin} /> : <Navigate to="/portal/dashboard" replace />} />

        {/* --- 3. ADMIN CMS ROUTES (/admin) --- */}
        {auth.isAuthenticated ? (
          <Route path="/admin" element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="approved-leads" element={<ApprovedLeads />} />
            <Route path="careers" element={<AdminCareers jobs={jobs} setJobs={setJobs} />} />
            <Route path="applicants" element={<AdminApplicants />} />
            <Route path="media" element={<AdminMediaManager />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        ) : (
          <Route path="/admin/*" element={<Navigate to="/admin-login" replace />} />
        )}

        {/* --- 2. PORTAL AUTHENTICATION --- */}
        <Route 
          path="/portal" 
          element={!auth.isAuthenticated ? <LoginPage onLoginSuccess={handleLogin} /> : <Navigate to="/portal/dashboard" replace />} 
        />

        {/* --- 4. PORTAL CRM ROUTES (/dashboard) --- */}
        {auth.isAuthenticated ? (
          <Route element={<Layout user={auth.user} onLogout={handleLogout} />}>
            <Route path="/portal/dashboard" element={<Dashboard user={auth.user} />} />
            <Route path="/portal/domain/:slug" element={<DomainResolver user={auth.user} />} />
            <Route path="/portal/domain/:slug/lead/:leadId" element={<LeadDetailsResolver user={auth.user} />} />
            {getTier(auth.user) === 'SUPER_ADMIN' && (
              <Route path="/portal/bgi/:view" element={<BGILeads />} />
            )}
            
            {/* Role Restricted Portal Routes */}
            {(getTier(auth.user) === 'SUPER_ADMIN' || getTier(auth.user) === 'ADMIN') && (
              <Route path="/portal/live-feed" element={<LiveFeedManager user={auth.user} />} />
            )}

            {getTier(auth.user) === 'SUPER_ADMIN' && (
              <>
                <Route path="/portal/user-management" element={<UserManagement user={auth.user} />} />
              </>
            )}

            {getTier(auth.user) === 'SUPER_ADMIN' && (
              <>
                <Route path="/portal/master" element={<MasterManagement user={auth.user} />} />
              </>
            )}
          </Route>
        ) : (
          <Route path="/portal/dashboard/*" element={<Navigate to="/portal" replace />} />
        )}

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </Router>
  );
}
