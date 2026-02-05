"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MessageSquare, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    businessFocus: [],
  });

  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const businessOptions = [
    "International Preschool", "Overseas Consulting", "IAS Academy",
    "Placement Services", "Tech Park", "Elite Sports",
    "Business Ideas", "Language Hub", "Other Services"
  ];

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    let newErrors = {};

    // Name: Required, min 2 chars
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Phone: Required, basic numeric check (adjust regex for your region)
    const phoneRegex = /^[0-9\s+]{10,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number (min 10 digits)";
    }

    // Email: Required, standard regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Business Focus: Required
    if (formData.businessFocus.length === 0) {
      newErrors.businessFocus = "Select at least one area of interest";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const updatedFocus = formData.businessFocus.includes(option)
      ? formData.businessFocus.filter((item) => item !== option)
      : [...formData.businessFocus, option];
    
    setFormData({ ...formData, businessFocus: updatedFocus });
    // Clear error for businessFocus if user selects an option
    if (updatedFocus.length > 0) {
      setErrors(prev => ({ ...prev, businessFocus: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Run Validation
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const loadingToast = toast.loading("Sending your inquiry...");

    try {
      const response = await fetch('https://bluestoneinternationalpreschool.com/bgoi_api/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Inquiry sent successfully!", { id: loadingToast });
        // Reset form and errors
        setFormData({ name: '', email: '', phone: '', message: '', businessFocus: [] });
        setErrors({});
      } else {
        throw new Error(data.error || "Failed to submit");
      }
    } catch (error) {
      toast.error(error.message || "Server connection failed", { id: loadingToast });
    }
  };

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <Toaster position="top-center" />
 <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl md:text-7xl font-extrabold text-red-600 mt-2">Contact <span className="text-black">Us</span></h2>
              </motion.div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Side: Info */}
          <div className="lg:w-1/3 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <MessageSquare size={14} />
                <span>Inquiry Portal</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                Connect with our <br /><span className="text-red-600">Strategic Team.</span>
              </h2>
              
              <div className="space-y-4 mb-8 text-slate-400">
                <a href="tel:+917418176606" className="flex items-center gap-4 group cursor-pointer w-fit">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <Phone size={18}/>
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">+91 74181 76606</span>
                </a>

                <a href="mailto:info@bluestonegroupofinstitutions.com" className="flex items-center gap-4 group cursor-pointer w-fit">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <Mail size={18}/>
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors break-all">info@bluestonegroupofinstitutions.com</span>
                </a>
              </div>
            </div>

             {/* Map Placeholder */}

            <div className="w-full h-80 rounded-3xl overflow-hidden border border-red-600 hover:grayscale-0 transition-all duration-500">

              <iframe

                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.457619491774!2d76.97578759999999!3d11.004251499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8f79532fbd2a7%3A0xecfa1d86f9485eb7!2sBluestone%20Overseas%20Consultants!5e0!3m2!1sen!2sin!4v1770094924626!5m2!1sen!2sin"

                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"

              ></iframe>

            </div>

          </div>

          {/* Right Side: Form */}
          <div className="lg:w-2/3">
            <motion.div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name & Phone Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Full Name *</label>
                    <Input 
                      className={`h-14 rounded-xl border-slate-200 focus:ring-2 ${errors.name ? 'border-red-500 bg-red-50/30' : ''}`}
                      value={formData.name} 
                      onChange={(e) => {
                        setFormData({...formData, name: e.target.value});
                        if (errors.name) setErrors(prev => ({...prev, name: null}));
                      }} 
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Phone Number *</label>
                    <Input 
                      placeholder="+91"
                      className={`h-14 rounded-xl border-slate-200 ${errors.phone ? 'border-red-500 bg-red-50/30' : ''}`}
                      value={formData.phone} 
                      onChange={(e) => {
                        setFormData({...formData, phone: e.target.value});
                        if (errors.phone) setErrors(prev => ({...prev, phone: null}));
                      }} 
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
                  </div>
                </div>

                {/* Business Focus Dropdown */}
                <div className="space-y-2" ref={dropdownRef}>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Business Focus *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full h-14 px-4 rounded-xl border bg-white flex items-center justify-between transition-all ${isDropdownOpen ? 'ring-2 ring-red-500/20 border-red-500 shadow-sm' : 'border-slate-200'} ${errors.businessFocus ? 'border-red-500 bg-red-50/30' : ''}`}
                    >
                      <span className={`text-xs font-bold truncate pr-4 ${formData.businessFocus.length ? "text-slate-900" : "text-slate-400"}`}>
                        {formData.businessFocus.length > 0 ? formData.businessFocus.join(", ") : "Choose areas of interest..."}
                      </span>
                      <ChevronDown size={18} className={`flex-shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-red-600' : 'text-slate-400'}`} />
                    </button>
                    {errors.businessFocus && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.businessFocus}</p>}

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute z-30 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 grid grid-cols-1 md:grid-cols-2 gap-1 max-h-64 overflow-y-auto"
                        >
                          {businessOptions.map((option) => (
                            <div 
                              key={option}
                              onClick={() => toggleOption(option)}
                              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${formData.businessFocus.includes(option) ? 'bg-red-50 text-red-600' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                              <span className="text-xs font-bold">{option}</span>
                              {formData.businessFocus.includes(option) && <Check size={14} strokeWidth={3} />}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Address *</label>
                  <Input 
                    type="email" 
                    className={`h-14 rounded-xl border-slate-200 ${errors.email ? 'border-red-500 bg-red-50/30' : ''}`}
                    value={formData.email} 
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      if (errors.email) setErrors(prev => ({...prev, email: null}));
                    }} 
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.email}</p>}
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Message (Optional)</label>
                  <Textarea 
                    className="min-h-[100px] rounded-xl border-slate-200" 
                    value={formData.message} 
                    onChange={(e) => setFormData({...formData, message: e.target.value})} 
                  />
                </div>

                <Button type="submit" className="w-full h-16 bg-slate-900 hover:bg-red-600 text-white rounded-xl font-black text-lg shadow-lg transition-all group">
                  Submit Inquiry
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}