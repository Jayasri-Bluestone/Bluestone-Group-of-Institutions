"use client";

import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

import { API_BASE_URL_PORTAL } from '../apiConfig';



export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    domain: '',
    category: '',
    interested_in: '',
  });

  const [errors, setErrors] = useState({});
  const [masterData, setMasterData] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);


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

    if (!formData.domain) newErrors.domain = "Please select a domain";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.interested_in) newErrors.interested_in = "Please select an interest";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/full-structure`);
        if (!res.ok) return;
        const json = await res.json();
        setMasterData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Master fetch failed:", err);
      }
    };
    fetchMaster();
  }, []);

  useEffect(() => {
    const selectedDomain = masterData.find((d) => d.name === formData.domain);
    setAvailableCategories(selectedDomain?.categories || []);
  }, [formData.domain, masterData]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error("Please fix the errors in the form");
    return;
  }

  const loadingToast = toast.loading("Sending your inquiry...");

  try {
    const payload = { ...formData };

    const response = await fetch(`${API_BASE_URL_PORTAL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Inquiry sent successfully!", { id: loadingToast });

      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        domain: '',
        category: '',
        interested_in: ''
      });

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

 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.457781655861!2d76.975759!3d11.0042393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8590cfca38287%3A0xc211732c4fb4db14!2sBluestone%20Group%20of%20Institutions!5e0!3m2!1sen!2sin!4v1771325952840!5m2!1sen!2sin" 
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

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Domain *</label>
                    <select
                      value={formData.domain}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          domain: e.target.value,
                          category: '',
                          interested_in: '',
                        });
                        setErrors((prev) => ({ ...prev, domain: null, category: null, interested_in: null }));
                      }}
                      className={`w-full h-14 px-4 rounded-xl border bg-white text-sm font-bold outline-none ${errors.domain ? 'border-red-500 bg-red-50/30' : 'border-slate-200'}`}
                    >
                      <option value="">Select Domain</option>
                      {masterData.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    {errors.domain && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.domain}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Category *</label>
                    <select
                      value={formData.category}
                      disabled={!formData.domain}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          category: e.target.value,
                          interested_in: '',
                        });
                        setErrors((prev) => ({ ...prev, category: null, interested_in: null }));
                      }}
                      className={`w-full h-14 px-4 rounded-xl border bg-white text-sm font-bold outline-none disabled:bg-slate-100 ${errors.category ? 'border-red-500 bg-red-50/30' : 'border-slate-200'}`}
                    >
                      <option value="">Select Category</option>
                      {availableCategories.map((c) => (
                        <option key={c.id} value={c.category_name}>{c.category_name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Interested In *</label>
                    <select
                      value={formData.interested_in}
                      disabled={!formData.category}
                      onChange={(e) => {
                        setFormData({ ...formData, interested_in: e.target.value });
                        setErrors((prev) => ({ ...prev, interested_in: null }));
                      }}
                      className={`w-full h-14 px-4 rounded-xl border bg-white text-sm font-bold outline-none disabled:bg-slate-100 ${errors.interested_in ? 'border-red-500 bg-red-50/30' : 'border-slate-200'}`}
                    >
                      <option value="">Select Interest</option>
                      {availableCategories
                        .find((c) => c.category_name === formData.category)
                        ?.values?.map((v) => (
                          <option key={v.id} value={v.sub_value}>{v.sub_value}</option>
                        ))}
                    </select>
                    {errors.interested_in && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.interested_in}</p>}
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

