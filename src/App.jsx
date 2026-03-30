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
import LiveFeedCalendar from './components/Admin Panel/Layout/LiveFeedCalendar';
import LoginPage from './components/Admin Panel/Login/Login';
import Profile from './components/Admin Panel/Sidebar/Profile';
import UserEfficiency from './components/Admin Panel/Sidebar/UserEfficiency';
import DeletedLeads from './components/Admin Panel/Sidebar/DeletedLeads';

import { API_BASE_URL, API_BASE_URL_PORTAL } from './apiConfig';

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
  const { search } = useLocation();
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
  return <DomainPage key={`${slug}${search}`} domain={domainName} user={user} />;
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

    // --- Global CRM Activity Tracking ---
    let lastPing = 0;
    const handleActivity = () => {
      const now = Date.now();
      const token = localStorage.getItem('token');
      // Only ping if we have a token (user logged in) and it's been >= 60 seconds
      if (now - lastPing >= 60000 && token) {
        lastPing = now;
        fetch(`${API_BASE_URL_PORTAL}/api/auth/ping`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => { });
      }
    };

    document.addEventListener("click", handleActivity);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleActivity);
    };
  }, []);

  const getTier = (user) => {
    if (user?.tier) return user.tier;
    const r = user?.role || '';
    if (['Main Admin', 'MD', 'GM', 'Super Admin'].includes(r)) return 'SUPER_ADMIN';
    if (['TL', 'Coordinator', 'Head', 'Admin'].includes(r)) return 'ADMIN';
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
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          success: {
            style: {
              background: '#16a34a', /* green-600 */
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#16a34a',
            },
          },
          error: {
            style: {
              background: '#dc2626', /* red-600 */
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#dc2626',
            },
          },
        }}
      />

      <Routes>
        {/* --- 1. PUBLIC WEBSITE ROUTES --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={
            <>
              <Hero />
              <BusinessFocus />
              <AboutBluestone />
              <OurPeople />
              <Contact />
              <Logos />
            </>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<Contact />} />
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
        <Route
          path="/portal"
          element={
            !auth.isAuthenticated ? (
              <LoginPage onLoginSuccess={handleLogin} />
            ) : (
              <Navigate to="/portal/dashboard" replace />
            )
          }
        />

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

        {/* --- 4. PORTAL CRM ROUTES (/portal/*) --- */}
        {auth.isAuthenticated ? (
          <Route path="/portal" element={<Layout user={auth.user} onLogout={handleLogout} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard user={auth.user} />} />
            <Route
              path="profile"
              element={
                <Profile
                  user={auth.user}
                  onUpdateUser={(u) => setAuth({ isAuthenticated: true, user: u })}
                />
              }
            />
            <Route path="domain/:slug" element={<DomainResolver user={auth.user} />} />
            <Route path="domain/:slug/lead/:leadId" element={<LeadDetailsResolver user={auth.user} />} />
            {/* BGI route: Super Admin, Admin, or Staff with multiple domains */}
            {(getTier(auth.user) === 'SUPER_ADMIN' || getTier(auth.user) === 'ADMIN' ||
              (getTier(auth.user) === 'STAFF' && (auth.user?.domain || '').split(',').filter(Boolean).length > 1)) && (
                <Route path="bgi/:view" element={<BGILeads user={auth.user} />} />
              )}

            {/* Role Restricted Portal Routes */}
            {(getTier(auth.user) === 'SUPER_ADMIN' || getTier(auth.user) === 'ADMIN') && (
              <Route path="live-feed" element={<LiveFeedManager user={auth.user} />} />
            )}

            {/* Calendar View accessible by all authenticated portal users */}
            <Route path="live-feed-calendar" element={<LiveFeedCalendar user={auth.user} />} />

            {getTier(auth.user) === 'SUPER_ADMIN' && (
              <>
                <Route path="user-management" element={<UserManagement user={auth.user} />} />
                <Route path="master" element={<MasterManagement user={auth.user} />} />
                <Route path="efficiency" element={<UserEfficiency user={auth.user} />} />
                <Route path="deleted-enquiries" element={<DeletedLeads user={auth.user} />} />
              </>
            )}
            {getTier(auth.user) === 'ADMIN' && (
              <>
                <Route path="master" element={<MasterManagement user={auth.user} />} />
                <Route path="user-management" element={<Navigate to="/portal/master" replace />} />
              </>
            )}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        ) : (
          <Route path="/portal/*" element={<Navigate to="/portal" replace />} />
        )}

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </Router>
  );
}
