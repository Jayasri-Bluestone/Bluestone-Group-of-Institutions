"use client";

import React from 'react';
import { 
  Facebook, Linkedin, Instagram, Youtube, 
  ArrowUp, Mail, MapPin, Phone, ExternalLink 
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

export function Footer() {
  const footerLinks = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Careers', href: '/career' },
    ],
    sectors: [
      { label: 'Preschool & Education', href: 'https://bluestoneinternationalpreschool.com/' },
      { label: 'Overseas Consulting', href: 'https://www.bluestoneoverseas.com/' },
      { label: 'IAS Academy', href: 'https://bluestoneiasacademy.com/' },
      { label: 'Placement Services', href: 'https://bluestoneplacements.com/' },
      { label: 'Tech Park', href: 'https://bluestonetechpark.com/' },
    ],
    support: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Global Compliance', href: '#' },
    ],
  };

 const socialLinks = [

    { icon: Linkedin, href: 'https://www.linkedin.com/company/bluestone-group-of-institutions', label: 'LinkedIn', color: 'hover:text-[#0077B5]' },

    // Use the custom icon here

    { icon: FaWhatsapp, href: 'https://wa.me/917418176606', label: 'Whatsapp', color: 'hover:text-[#25D366]' },

    { icon: Instagram, href: 'https://www.instagram.com/bluestonegroupofinstitutions', label: 'Instagram', color: 'hover:text-[#E4405F]' },

    { icon: Facebook, href: 'https://www.facebook.com/bluestonegroupofinstitutions', label: 'Facebook', color: 'hover:text-[#1877F2]' },

    { icon: Youtube, href: 'https://www.youtube.com/@bluestoneeducation', label: 'YouTube', color: 'hover:text-[#FF0000]' },

  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-[#0A0A0B] text-white relative overflow-hidden border-t border-white/5">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
        
        {/* Top Section: Brand & Contact Info */}
        <div className="grid lg:grid-cols-12 gap-12 pb-16 border-b border-white/5">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                <span className="text-white font-black text-2xl tracking-tighter">B</span>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tighter block leading-none uppercase">Bluestone</span>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.3em]">Groups</span>
              </div>
            </div>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              A global conglomerate dedicated to cross-industry excellence, transforming bold ideas into market-leading institutions across education and technology.
            </p>
          </div>

          {/* Contact Quick-Actions */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4 h-fit">
            <ContactCard 
              href="tel:+917418176606" 
              icon={<Phone size={18} />} 
              title="Call Us" 
              value="+91 74181 76606" 
            />
            <ContactCard 
              href="mailto:info@bluestonegroupofinstitutions.com" 
              icon={<Mail size={18} />} 
              title="Email Us" 
              value="info@bluestonegroupofinstitutions.com" 
            />
            <ContactCard 
              href="https://maps.app.goo.gl/9iKsL99nW7ZNRo1v8" 
              icon={<MapPin size={18} />} 
              title="Global Headquarters" 
              value="2nd Floor, Renaissance Terrace.126 L, opp. Bishop Appasamy College, Race Course, Coimbatore 641018" 
              fullWidth
            />
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 py-16">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-6">
              <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" className="text-slate-400 hover:text-white flex items-center group gap-2 transition-colors">
                      <span className="font-bold text-sm tracking-tight">{link.label}</span>
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-all text-red-600" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Newsletter / CTA Placeholder */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-6">
             <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">Excellence</h4>
             <p className="text-slate-500 text-sm italic font-medium">"Innovation distinguishes between a leader and a follower."</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <a 
                key={social.label} 
                href={social.href} 
                target='_blank'
                className={`text-slate-500 transition-all hover:scale-110 ${social.color}`}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Bluestone Groups International.
            </p>
            <p className="text-slate-700 text-[9px] uppercase tracking-tighter mt-1">
              A Multi-Sector Strategic Enterprise. Built for Excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white text-slate-900 rounded-xl flex items-center justify-center shadow-2xl z-50 border border-slate-200"
      >
        <ArrowUp size={20} />
      </motion.button>
    </footer>
  );
}

// Helper Component for Contact Items
function ContactCard({ href, icon, title, value, fullWidth }) {
  return (
    <a 
      href={href} 
      className={`flex items-center gap-4 text-slate-400 group hover:text-white transition-all p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-600/30 ${fullWidth ? 'sm:col-span-2' : ''}`}
    >
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-red-600 mb-0.5">{title}</p>
        <span className="font-bold text-xs sm:text-sm truncate block tracking-tight">{value}</span>
      </div>
    </a>
  );
}