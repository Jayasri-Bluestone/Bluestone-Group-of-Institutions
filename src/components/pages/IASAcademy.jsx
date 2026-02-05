"use client";

import * as React from "react";
// 1. Import useNavigate
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, BookOpen, Award, Users, Target, CheckCircle2, Trophy, Landmark, GraduationCap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import IAS from "../../assets/ias5.png";

export function IASAcademy() { // Removed { onBack } from props
  // 2. Initialize the hook
  const navigate = useNavigate();

  const features = [
    { icon: Users, title: 'Expert Faculty', description: 'Mentorship from retired IAS/IPS officers and subject matter specialists.' },
    { icon: Award, title: 'Proven Results', description: 'Consistently producing Top 100 rankers in the UPSC Civil Services exam.' },
    { icon: BookOpen, title: 'Study Material', description: 'Curated static and current affairs notes aligned with the latest syllabus.' },
    { icon: Target, title: 'Mock Tests', description: 'Simulated Prelims and Mains test series with detailed performance analytics.' },
  ];

  const milestones = [
    { title: 'Foundation', desc: 'Core subject building and conceptual clarity.' },
    { title: 'Advanced', desc: 'Integrated Prelims-cum-Mains approach.' },
    { title: 'Intensive', desc: 'Answer writing practice and revision modules.' },
    { title: 'Interview', desc: 'Personality development and mock interviews.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-white">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-100 rounded-full filter blur-[120px] -z-10"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* 3. Updated onClick to use navigate('/') */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 mb-8 group font-medium transition-colors"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </motion.button>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-amber-400 rounded-lg mb-6 shadow-xl">
                <Landmark size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">National Excellence</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.1]">
                Shape Your <br />
                <span className="bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">Civil Service Career</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Join India's most trusted academy for UPSC preparation. We provide the strategic guidance and rigorous training needed to crack the world's toughest exam.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  asChild
                  className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg shadow-red-200"
                >
                  <a href="https://bluestoneiasacademy.com/" target="_blank" rel="noopener noreferrer">
                    Visit Our Website
                  </a>
                </Button>
             
              </div>

              <div className="flex items-center gap-6 py-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <span className="text-sm font-semibold text-slate-700">Online & Offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <span className="text-sm font-semibold text-slate-700">Bilingual Batches</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-amber-500/10 rounded-[2.5rem] rotate-3 scale-105 blur-sm"></div>
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={IAS}
                  alt="UPSC Aspirants Studying"
                  className="w-full h-[550px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Trophy className="text-amber-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">AIR 01</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Last Year Result</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all group"
              >
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                  <feature.icon className="text-amber-400 group-hover:text-white transition-colors" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Roadmap */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6">Our 4-Stage Mastery</h2>
              <p className="text-slate-400 text-lg mb-12">A structured journey from an aspirant to a civil servant.</p>
              
              <div className="space-y-6">
                {milestones.map((m, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900 group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      {i < 3 && <div className="w-px h-16 bg-slate-700 mt-2"></div>}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{m.title}</h4>
                      <p className="text-slate-400 text-sm">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-2">
                <GraduationCap className="mx-auto text-red-500" size={32} />
                <p className="text-3xl font-black">500+</p>
                <p className="text-xs text-slate-400 uppercase font-bold">Selections</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-2 mt-8">
                <Calendar className="mx-auto text-amber-500" size={32} />
                <p className="text-3xl font-black">12 Yrs</p>
                <p className="text-xs text-slate-400 uppercase font-bold">Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}