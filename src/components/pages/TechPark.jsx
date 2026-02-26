"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building2, Wifi, Shield, Zap, Users, Globe, 
  Coffee, Trophy, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { API_BASE_URL } from '../../apiConfig';

export function TechPark() {
  const navigate = useNavigate();
  const [images, setImages] = useState({}); // Mapping object for alt_text
  const [loading, setLoading] = useState(true);

  // --- FETCH MEDIA FROM DATABASE ---
  useEffect(() => {
    const fetchTechMedia = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media?category=focus`);
        const data = await res.json();
        const finalData = Array.isArray(data) ? data : data.data || [];
        
        const mappedMedia = {};
        finalData.forEach(item => {
          const key = item.alt_text?.trim();
          if (key) {
            // BASE64 COMPATIBILITY: Skip timestamp for data URIs to avoid corruption
            if (item.url.startsWith('data:')) {
              mappedMedia[key] = item.url;
            } else {
              const fullUrl = item.url.startsWith('http') ? item.url : `${API_BASE_URL}/${item.url}`;
              mappedMedia[key] = `${fullUrl}?v=${Date.now()}`;
            }
          }
        });
        setImages(mappedMedia);
      } catch (err) {
        console.error("Tech Park Image Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechMedia();
  }, []);

  // Helper to get image by Alt Key or return placeholder
  const getImg = (altKey) => images[altKey] || `https://placehold.co/800x600?text=TechPark+${altKey}`;

  const features = [
    { icon: Building2, title: 'Modern Infrastructure', description: 'State-of-the-art facilities with smart technology' },
    { icon: Wifi, title: 'High-Speed Connectivity', description: '1Gbps internet with 99.9% uptime guarantee' },
    { icon: Shield, title: 'Advanced Security', description: '24/7 surveillance with biometric access control' },
    { icon: Zap, title: 'Flexible Spaces', description: 'Customizable offices from 1000 to 50,000 sq ft' },
  ];

  const stats = [
    { label: 'Companies', value: '200+', icon: Globe },
    { label: 'Workstations', value: '5000+', icon: Users },
    { label: 'Coffee Lounges', value: '12', icon: Coffee },
    { label: 'Awards Won', value: '25', icon: Trophy },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-red-600/20 rounded-full filter blur-3xl"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 mb-8 group font-medium"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </motion.button>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full mb-6">
                <Building2 size={20} />
                <span className="font-semibold uppercase tracking-wider text-xs">Innovation Hub</span>
              </div>
              <h1 className="text-5xl font-bold text-black mb-6">
                Where Innovation <span className="bg-red-500 bg-clip-text text-transparent">Meets Infrastructure</span>
              </h1>
              <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                Premium technology park designed for startups and enterprises to thrive with world-class amenities and connectivity.
              </p>
              <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg px-8 py-6 rounded-xl">
                <a href="https://bluestonetechpark.com/" target="_blank">Visit Our Website</a>
              </Button>
            </motion.div>

            {/* DYNAMIC HERO IMAGE (Search Key: tech_park_hero) */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <img
                  src={getImg("tech.png")} 
                  alt="Modern Tech Park Office"
                  className="w-full h-[450px] object-cover"
                  onError={(e) => { e.target.src = "https://placehold.co/600x450?text=Tech+Park+Facility"; }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-800 bg-black/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-center"
              >
                <stat.icon className="mx-auto text-red-500 mb-4 opacity-50" size={24} />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative ">
        <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Enterprise Grade Facilities</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to scale your team from 10 to 1000 without worrying about logistics.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-red-600 to-red-700 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-red-500/10 transition-all border border-gray-700"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-red-700" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifecycle Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]"></div>
          
          <div className="flex-1 space-y-8 relative z-10">
            <h2 className="text-4xl font-bold">The Strategic Lifecycle</h2>
            <p className="text-slate-400 text-lg">We don't just provide a space; we provide an ecosystem that scales with you.</p>
            
            <div className="grid gap-4">
              {['Smart Space Allocation', 'Tech Integration', 'Seamless Expansion'].map((step, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm">{i+1}</span>
                  <span className="font-semibold">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700 p-8 flex flex-col justify-end">
                <p className="text-3xl font-black text-red-500">40%</p>
                <p className="text-sm text-slate-400">Average Efficiency Increase</p>
              </div>
              <div className="h-64 bg-red-600 rounded-2xl p-8 flex flex-col justify-end mt-12">
                <p className="text-3xl font-black text-white">250+</p>
                <p className="text-sm text-red-100">Global Enterprises Served</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-700 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to upgrade your workspace?</h2>
              <p className="text-red-100 text-xl mb-10 max-w-2xl mx-auto">Join the most innovative companies in the region. Limited enterprise suites available for the upcoming session.</p>
            </div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>
    </div>
  );
}