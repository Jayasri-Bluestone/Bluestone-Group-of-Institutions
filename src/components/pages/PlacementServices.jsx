import * as React from "react";
// 1. Import useNavigate
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Users, TrendingUp, Award, CheckCircle2, Building, Search, FileText, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import placement from "../../assets/ocs.png";

export function PlacementServices() { // Removed { onBack } prop
  // 2. Initialize the hook
  const navigate = useNavigate();

  const features = [
    { icon: Users, title: 'Top Companies', description: 'Partnerships with 500+ leading organizations' },
    { icon: TrendingUp, title: 'High Success Rate', description: '95% placement rate across all sectors' },
    { icon: Award, title: 'Career Guidance', description: 'Expert mentoring and interview preparation' },
    { icon: Briefcase, title: 'Global Reach', description: 'Opportunities in 25+ countries worldwide' },
  ];

  const placementSteps = [
    { icon: Search, title: 'Skill Assessment', desc: 'Detailed evaluation of your professional strengths.' },
    { icon: FileText, title: 'Resume Crafting', desc: 'Optimization for ATS and recruiter impact.' },
    { icon: UserCheck, title: 'Mock Interviews', desc: 'Simulated rounds with industry veterans.' },
    { icon: Building, title: 'Final Placement', desc: 'Secure your role in a top-tier organization.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <motion.div
          animate={{ x: [-100, 100, -100], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-20 w-80 h-80 bg-green-100 rounded-full filter blur-3xl opacity-40"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* 3. Updated onClick to use navigate('/') */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 mb-8 group transition-colors"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </motion.button>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full mb-6">
                <Briefcase size={18} className="text-red-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Placement Services</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Connect with Your <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Dream Career</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                We bridge the gap between talented professionals and leading companies worldwide with personalized placement solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                   <Button 
        asChild
        className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg shadow-red-200"
      >
        <a href="https://bluestoneplacements.com/" target="_blank" rel="noopener noreferrer">
          Visit Our Website
        </a>
      </Button>
              
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <CheckCircle2 className="text-green-500" />
                  <span>500+ Hiring Partners</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src={placement}
                  alt="Job Placement Recruitment"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20">
        <div className="max-w-7xl p-10 rounded-3xl mx-auto bg-red-600 px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                  <feature.icon className="text-red-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Placement Journey Section */}
      <section className="py-24 bg-white text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl text-black font-bold mb-4">Your Path to Employment</h2>
            <p className="text-slate-600">Our systematic approach to ensuring you land the perfect role.</p>
          </div>
          
          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-800"></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {placementSteps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/10">
                    <step.icon className="text-red-500" size={36} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}