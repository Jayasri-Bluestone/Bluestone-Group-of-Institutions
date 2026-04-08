import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, GraduationCap, Plane, BookOpen, Briefcase, Building2, Trophy, Languages, Lightbulb, MoreHorizontal, Users } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from "../assets/logo.png";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [mobileBusinessOpen, setMobileBusinessOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const businessItems = [
    { label: 'International Preschool', path: '/international-preschool', icon: GraduationCap },
    { label: 'Overseas Consulting', path: '/overseas-consulting', icon: Plane },
    { label: 'IAS Academy', path: '/ias-academy', icon: BookOpen },
    { label: 'Placement Services', path: '/placement-services', icon: Briefcase },
    { label: 'Tech Park', path: '/tech-park', icon: Building2 },
    { label: 'Sport Academy', path: '/sport-academy', icon: Trophy },
    { label: 'Language Hub', path: '/language-hub', icon: Languages },
    { label: 'Start-Ups', path: '/business-ideas', icon: Lightbulb },
    { label: 'Bluestone Investments', path: '/other-services', icon: MoreHorizontal },
  ];

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Gallery', path: '/gallery', hash: 'people' },
    { label: 'Career', path: '/career', hash: 'vision' },
    { label: 'Contact', path: '/contact', hash: 'contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-1' : 'bg-white/95 backdrop-blur-md py-3 border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section - Responsive widths */}
          <Link to="/" className="flex items-center group shrink-0">
            <img src={Logo} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain transition-transform group-hover:scale-105" />
            <div className="ml-2 md:ml-3 flex flex-col">
              <span className="text-sm md:text-base lg:text-lg font-extrabold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent leading-none">
                BLUESTONE GROUP
              </span>
              {/* Hide subtext on smaller tablets to prevent push-out */}
              <span className="hidden lg:block text-[10px] font-bold text-gray-500 tracking-widest mt-0.5">
                OF INSTITUTIONS
              </span>
            </div>
          </Link>

          {/* Navigation - Tablet logic: use smaller gaps and hide button if needed */}
          <div className="hidden md:flex items-center gap-3 lg:gap-8">
            <div className="flex items-center gap-3 lg:gap-6">
              {/* Home */}
              <Link
                to="/"
                className={`text-[13px] lg:text-sm font-semibold transition-colors ${
                  location.pathname === '/' ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                }`}
              >
                Home
              </Link>

              {/* Nav Items */}
              {navItems.filter(i => i.label !== 'Home').map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-[13px] lg:text-sm font-semibold transition-colors ${
                    location.pathname === item.path ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Business Focus - Refined for tablet */}
            <div 
              className="relative"
              onMouseEnter={() => setIsBusinessDropdownOpen(true)}
              onMouseLeave={() => setIsBusinessDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-[13px] lg:text-sm font-semibold text-gray-600 hover:text-red-600 py-2">
               Business Focus <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {isBusinessDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-1">
                      {businessItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 p-2.5 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center shrink-0">
                            <item.icon className="text-white" size={14} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 group-hover:text-red-600">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Compact button for tablets */}
            <Button 
              onClick={() => navigate('/contact')}
              className="hidden lg:flex text-white bg-red-600 hover:bg-red-700 h-9 px-4 text-xs font-bold uppercase tracking-wider"
            >
              Enquiry
            </Button>
          </div>

          {/* Mobile/Tablet Burger Button */}
          <div className="md:hidden flex items-center gap-2">
             <Button 
              onClick={() => navigate('/contact')}
              className="flex md:hidden bg-red-600 text-[10px] h-8 px-3"
            >
              Enquiry
            </Button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 p-1">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[280px] bg-white shadow-2xl z-50 md:hidden flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b">
              <span className="font-bold text-red-600">MENU</span>
              <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block p-3 text-sm font-bold text-gray-700 hover:bg-red-50 rounded-lg">HOME</Link>
              

              {navItems.filter(i => i.label !== 'Home').map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block p-3 text-sm font-bold text-gray-700 hover:bg-red-50 rounded-lg"
                >
                  {item.label.toUpperCase()}
                </Link>
              ))}
              
              <div className="pt-2">
                <button 
                  onClick={() => setMobileBusinessOpen(!mobileBusinessOpen)}
                  className="w-full flex justify-between items-center p-3 text-sm font-bold text-gray-700"
                >
                  BUSINESS FOCUS <ChevronDown size={16} className={`transition-transform duration-200 ${mobileBusinessOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileBusinessOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 space-y-1 overflow-hidden"
                    >
                      {businessItems.map(item => (
                        <Link 
                          key={item.path} 
                          to={item.path} 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-2 text-xs font-bold text-gray-600"
                        >
                          <item.icon size={14} className="text-red-600" /> {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="p-4 border-t">
              <Button onClick={() => navigate('/contact')} className="w-full bg-red-600 text-white">
                ENQUIRY NOW
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}