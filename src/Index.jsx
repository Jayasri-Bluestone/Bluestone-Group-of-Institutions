// "use client";

// import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet, useParams } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// // --- MAIN COMPONENTS ---
// import { Navbar } from './components/Navbar';
// import { Hero } from './components/Hero';
// import { BusinessFocus } from './components/BusinessFocus';
// import { OurPeople } from './components/OurPeople';
// import { Logos } from './components/Logos';
// import { Contact } from './components/Contact';
// import { Footer } from './components/Footer';
// import { AboutPage } from './components/pages/About';
// import AboutBluestone from './components/AboutBluestone';


// // --- PAGE IMPORTS ---
// import { InternationalPreschool } from './components/pages/InternationalPreschool';
// import { OverseasConsulting } from './components/pages/OverseasConsulting';
// import { IASAcademy } from './components/pages/IASAcademy';
// import { PlacementServices } from './components/pages/PlacementServices';
// import { TechPark } from './components/pages/TechPark';
// import { SportAcademy } from './components/pages/SportAcademy';
// import { LanguageHub } from './components/pages/LanguageHub';
// import { BusinessIdeas } from './components/pages/BusinessIdeas';
// import { OtherServices } from './components/pages/OtherServices';
// import PrivacyPolicy from './components/pages/PrivacyPolicy';


// // --- ADMIN IMPORTS ---
// import Layout from '.components/Admin Panel/Layout/layout';
// import DomainPage from '.components/Admin Panel/Sidebar/Domain';
// import Dashboard from '.components/Admin Panel/Sidebar/Dashboard';
// import UserManagement from '.components/Admin Panel/Sidebar/UserManagement';
// import MasterManagement from '.components/Admin Panel/Sidebar/MasterManagement';
// import LiveFeedManager from './components/Admin Panel/Layout/Notification';
// import LiveFeedCalendar from './components/Admin Panel/Layout/LiveFeedCalendar';
// import { Toaster } from 'react-hot-toast';
// import { AdminLogin } from './components/Login/AdminLogin';
// import { AdminLayout } from './components/Login/AdminLayout';
// import { AdminDashboard } from './components/Login/AdminDashboard';
// import { AdminLeads } from './components/Login/AdminLeads';
// import { ApprovedLeads } from './components/Login/ApprovedLeads';
// import { GalleryPage } from './components/pages/Gallery';
// import { CareersPage } from './components/pages/Career';
// import { AdminCareers } from './components/Login/AdminCareer';
// import AdminApplicants from './components/Login/AdminApplicants';
// import AdminSettings from './components/Login/AdminSettings';
// import { AdminMediaManager } from './components/Login/AdminMediaManager';


// import { API_BASE_URL } from './apiConfig';
// import LoginPage from './components/Admin Panel/Login/Login';



// // 1. Helper: Scroll to top on every route change
// function ScrollToTop() {
//   const { pathname } = useLocation();
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);
//   return null;
// }

// // 2. Auth Guard: Checks if adminToken exists in localStorage
// const ProtectedRoute = () => {
//   const token = localStorage.getItem('adminToken');
//   return token ? <Outlet /> : <Navigate to="/admin-login" replace />;
// };

// // 3. Public Layout: Includes Navbar and Footer
// const PublicLayout = () => (
//   <div className="min-h-screen flex flex-col">
//     <Navbar />
//     <main className="flex-grow">
//       <Outlet />
//     </main>
//     <Footer />
//   </div>
// );
// export default function App() {
//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const [auth, setAuth] = useState(() => {
//     const savedUser = localStorage.getItem('user');
//     const savedToken = localStorage.getItem('token');
//     return (savedUser && savedToken)
//       ? { isAuthenticated: true, user: JSON.parse(savedUser) }
//       : { isAuthenticated: false, user: null };
//   });

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsInitialLoading(false);
//     }, 700);

//     return () => clearTimeout(timer);
//   }, []);

//   const handleLogin = (userData, token) => {
//     localStorage.setItem('user', JSON.stringify(userData));
//     localStorage.setItem('token', token);
//     setAuth({ isAuthenticated: true, user: userData });
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     setAuth({ isAuthenticated: false, user: null });
//   };

//   if (isInitialLoading) {
//     return (
//       <div className="app-loader">
//         <div className="app-loader__spinner" />
//         <p>Loading portal...</p>
//       </div>
//     );
//   }
//   // 1. Initialize state with localStorage to persist data on refresh
//   // const [jobs, setJobs] = useState([]);

//   // // 1. Fetch jobs from MySQL on load
//   // useEffect(() => {
//   //   const fetchJobs = async () => {
//   //     try {
//   //       const response = await fetch(`${ API_BASE_URL }/api/jobs`);
//   //       const data = await response.json();
//   //       setJobs(data);
//   //     } catch (error) {
//   //       console.error("Error fetching jobs:", error);
//   //     }
//   //   };
//   //   fetchJobs();
//   // }, []);

//   // // 2. Add Job (Update state AND Database)
//   // const addJob = async (newJob) => {
//   //   try {
//   //     const response = await fetch(`${ API_BASE_URL }/api/admin/jobs`, {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify(newJob),
//   //     });
//   //     if (response.ok) {
//   //       const result = await response.json();
//   //       // Update UI with the ID returned from MySQL
//   //       setJobs([...jobs, { ...newJob, id: result.id }]);
//   //     }
//   //   } catch (err) {
//   //     alert("Failed to save to database");
//   //   }
//   // };

//   // // 3. Delete Job (Update state AND Database)
//   // const deleteJob = async (jobId) => {
//   //   try {
//   //     await fetch(`${ API_BASE_URL }/api/admin/jobs/${jobId}`, {
//   //       method: 'DELETE',
//   //     });
//   //     setJobs(jobs.filter(job => job.id !== jobId));
//   //   } catch (err) {
//   //     alert("Failed to delete from database");
//   //   }
//   // };

//   return (
//     <Router>
//       <ScrollToTop />
//       <Routes>
        
//         {/* --- PUBLIC WEBSITE ROUTES --- */}
//         <Route element={<PublicLayout />}>
//           <Route path="/" element={
//             <>
//               <Hero />
//               <BusinessFocus />
//               <AboutBluestone/>
//               <OurPeople />
//               <Contact />
//               <Logos />
//             </>
//           } />
//           <Route path="/about" element={<AboutPage />} />
//           <Route path="/gallery" element={<GalleryPage />} />
//           <Route path="/contact" element={<Contact/>} />
          
//           {/* FIXED: Passed the 'jobs' prop here */}
//           <Route path="/career" element={<CareersPage jobs={jobs} />} />
          
//           <Route path="/international-preschool" element={<InternationalPreschool />} />
//           <Route path="/overseas-consulting" element={<OverseasConsulting />} />
//           <Route path="/ias-academy" element={<IASAcademy />} />
//           <Route path="/placement-services" element={<PlacementServices />} />
//           <Route path="/tech-park" element={<TechPark />} />
//           <Route path="/sport-academy" element={<SportAcademy />} />
//           <Route path="/language-hub" element={<LanguageHub />} />
//           <Route path="/business-ideas" element={<BusinessIdeas />} />
//           <Route path="/other-services" element={<OtherServices />} />
//           <Route path="/privacy-policy" element={<PrivacyPolicy />} /> 
//         </Route>

//         {/* --- ADMIN LOGIN ROUTE --- */}
//         <Route path="/admin" element={<AdminLogin />} />

//         {/* --- PRIVATE ADMIN ROUTES --- */}
//           <Router>
//       <Toaster 
//         position="top-center" 
//         reverseOrder={false} 
//         toastOptions={{ 
//           duration: 2000,
//           success: {
//             style: {
//               background: '#16a34a', /* green-600 */
//               color: '#fff',
//             },
//             iconTheme: {
//               primary: '#fff',
//               secondary: '#16a34a',
//             },
//           },
//           error: {
//             style: {
//               background: '#dc2626', /* red-600 */
//               color: '#fff',
//             },
//             iconTheme: {
//               primary: '#fff',
//               secondary: '#dc2626',
//             },
//           },
//         }} 
//       />
//       <Routes>
//         <Route path="/login" element={!auth.isAuthenticated ? <LoginPage onLoginSuccess={handleLogin} /> : <Navigate to="/" />} />

//         <Route
//           path="/*"
//           element={
//             auth.isAuthenticated ? (
//               <Layout user={auth.user} onLogout={handleLogout}>
//                 <Routes>
//                   <Route path="/" element={<Dashboard user={auth.user} />} />
//                   <Route path="/domain/:slug" element={<DomainResolver user={auth.user} />} />

//                   {['Main Admin', 'MD', 'GM', 'TL'].includes(auth.user.role) && (
//                     <Route path="/live-feed" element={<LiveFeedManager user={auth.user} />} />
//                   )}
//                   {/* Calendar View accessible by all authenticated users */}
//                   <Route path="/live-feed-calendar" element={<LiveFeedCalendar user={auth.user} />} />

//                   {['Main Admin', 'MD', 'GM'].includes(auth.user.role) && (
//                     <>
//                       <Route path="/user-management" element={<UserManagement user={auth.user} />} />
//                     </>
//                   )}

//                   {auth.user.role === 'Main Admin' && (
//                     <>
//                       <Route path="/master" element={<MasterManagement user={auth.user} />} />
//                     </>
//                   )}

//                   <Route path="*" element={<Navigate to="/" />} />
//                 </Routes>
//               </Layout>
//             ) : <Navigate to="/login" />
//           }
//         />
//       </Routes>
//     </Router>

//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// const DomainResolver = ({ user }) => {
//   const { slug } = useParams();
//   const mapping = {
//     ias: 'IAS Academy',
//     techpark: 'Techpark',
//     overseas: 'Overseas',
//     placements: 'Placements',
//     languages: 'Language Hub',
//     sports: 'Elite Sports',
//     preschool: 'Preschool',
//     startup: 'Startup'
//   };

//   const domainName = mapping[slug] || slug.replace(/-/g, ' ');
//   return <DomainPage domain={domainName} user={user} />;
// };
