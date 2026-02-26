"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trophy, Users, Target, Activity, Flame, 
  ShieldCheck, Heart, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { API_BASE_URL } from '../../apiConfig';

export function SportAcademy() {
  const navigate = useNavigate();
  const [images, setImages] = useState({}); // Mapping object for dynamic lookup
  const [loading, setLoading] = useState(true);

  // --- FETCH MEDIA FROM DATABASE ---
  useEffect(() => {
    const fetchSportMedia = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media?category=focus`);
        const data = await res.json();
        const finalData = Array.isArray(data) ? data : data.data || [];
        
        const mappedMedia = {};
        finalData.forEach(item => {
          const key = item.alt_text?.trim();
          if (key) {
            // BASE64 COMPATIBILITY: Data URIs remain untouched; regular URLs get cache-busting
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
        console.error("Sport Image Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSportMedia();
  }, []);

  // Helper to get image by Alt Key or return placeholder
  const getImg = (altKey) => images[altKey] || `https://placehold.co/800x600?text=Sports+${altKey}`;

  const activities = [
    { 
      title: 'Cricket', 
      icon: Target, 
      desc: 'Master the art of batting and bowling with professional nets and pitch training.',
      color: 'from-blue-600 to-cyan-500' 
    },
    { 
      title: 'Karate', 
      icon: ShieldCheck, 
      desc: 'Discipline, self-defense, and traditional Kata training led by Black Belt Senseis.',
      color: 'from-emerald-700 to-green-900' 
    },
    { 
      title: 'Yoga', 
      icon: Heart, 
      desc: 'Enhance flexibility, mindfulness, and core strength in our peaceful Zen studios.',
      color: 'from-rose-500 to-red-600' 
    }
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-slate-50">
        <motion.div
          animate={{ x: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full filter blur-3xl"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-red-700 mb-8 group font-medium"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </motion.button>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg mb-6 shadow-lg">
                <Trophy size={18} className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Bluestone Elite Sports</span>
              </div>
              <h1 className="text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Unlock Your <span className="text-red-600">Athletic Potential</span>
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
                Where elite performance meets holistic wellness. Experience world-class coaching in Cricket, Karate, and Yoga designed for the modern athlete.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg shadow-red-200">
                <a href="https://bluestoneelitesports.com/" target="_blank" rel="noopener noreferrer">Visit Our Website</a>
              </Button>
            </motion.div>

            {/* DYNAMIC HERO IMAGE (Search Key: sport_hero) */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 scale-105 opacity-10"></div>
              <img
                src={getImg("sport1.JPG")} 
                alt="Elite Athlete Training"
                className="relative rounded-3xl shadow-2xl z-10 w-full h-[500px] object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/600x500?text=Sport+Academy"; }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Specializations</h2>
          <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {activities.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="group bg-white border-4 border-red-600 p-10 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                <item.icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Advantage Section */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-8">The Bluestone Advantage</h2>
            <div className="space-y-6">
              {[
                { title: "Olympic Standard Coaches", icon: Activity },
                { title: "Personalized Nutrition Plans", icon: Flame },
                { title: "Recovery & Physiotherapy", icon: Heart }
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <benefit.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{benefit.title}</h4>
                    <p className="text-slate-400 text-sm">Tailored approaches to ensure every athlete reaches peak performance.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-48 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center">
                 <Trophy className="text-slate-700" size={48} />
              </div>
              <div className="h-64 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                <span className="text-5xl font-black opacity-20">ELITE</span>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="h-64 bg-slate-800 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400" 
                  alt="Yoga Performance" 
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <div className="h-48 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center">
                <Users className="text-slate-700" size={48} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}