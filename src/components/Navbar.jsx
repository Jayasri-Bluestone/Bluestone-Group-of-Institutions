import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { Menu, X, ChevronDown, GraduationCap, Plane, BookOpen, Briefcase, Building2, Trophy, Languages, Lightbulb, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from "../assets/logo.png";


export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const location = useLocation(); // To check current path

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
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

  // Modified nav items to use IDs for home sections
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about', hash: 'about' },
    { label: 'Gallery', path: '/gallery', hash: 'people' },
    { label: 'Career', path: '/career', hash: 'vision' },
    { label: 'Contact', path: '/contact', hash: 'contact' },
  ];

  const handleNavClick = (hash) => {
    setIsMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/55 backdrop-blur-md shadow-lg'
          : 'bg-white/40 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform ">
              <img src={Logo}/>
            </div>
            <span className="ml-3 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              BLUESTONE GROUP OF INSTITUTIONS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => handleNavClick(item.hash)}
                className="text-gray-700 hover:text-red-600 transition-colors duration-200 relative group font-medium"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-700 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {/* Business Focus Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsBusinessDropdownOpen(true)}
              onMouseLeave={() => setIsBusinessDropdownOpen(false)}
            >
              <button className="text-gray-700 hover:text-red-600 transition-colors duration-200 relative group font-medium flex items-center gap-1">
                Business Focus
                <ChevronDown className={`w-4 h-4 transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isBusinessDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-2">
                      {businessItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsBusinessDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-xl transition-colors group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="text-white" size={20} />
                          </div>
                          <span className="text-gray-700 group-hover:text-red-600 font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Admin Access (Optional Hidden Link or Button) */}
           {/* Enquiry Now Button - Scrolls to Contact Section */}
<Button 
  onClick={() => handleNavClick('contact')}
  className="text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-red-100 transition-all active:scale-95"
>
  Enquiry Now
</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-red-600 p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu logic would similarly use <Link> components */}
    </motion.nav>
  );
}