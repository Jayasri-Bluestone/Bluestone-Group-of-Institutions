"use client";

import * as React from "react";
// 1. Add useNavigate to your imports
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, Lightbulb, Target, TrendingUp, Users, Rocket, Zap, Search, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export function BusinessIdeas() { // Removed { onBack } from props
  // 2. Initialize the navigate function
  const navigate = useNavigate();

  const features = [
    { icon: Search, title: 'Idea Validation', description: 'Expert analysis and market research to test the viability of your concept.' },
    { icon: Target, title: 'Business Planning', description: 'Comprehensive strategy, financial modeling, and execution roadmaps.' },
    { icon: Users, title: 'Mentorship', description: 'One-on-one guidance from seasoned founders and industry veterans.' },
    { icon: TrendingUp, title: 'Funding Support', description: 'Pitch deck refinement and connections to angel investors and VCs.' },
  ];

  const startupStages = [
    { name: 'Ideation', desc: 'Problem-solution fit and market sizing.' },
    { name: 'MVP', desc: 'Building the Minimum Viable Product.' },
    { name: 'Growth', desc: 'Customer acquisition and scaling operations.' },
    { name: 'Exit', desc: 'M&A preparation or IPO strategy.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* 3. Update the onClick event */}
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-yellow-400 rounded-lg mb-6 shadow-xl">
                <Rocket size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Startup Incubator</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Transform Ideas into <br />
                <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Successful Ventures</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Stop wondering "what if." We provide the capital, mentorship, and strategic framework to turn your innovative concepts into market-leading businesses.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {/* <Button className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-7 rounded-2xl shadow-xl shadow-red-100 transition-transform active:scale-95">
                  Submit Your Idea
                </Button> */}
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Zap className="text-yellow-500" size={20} />
                  <span className="text-sm font-bold text-slate-700">Next Cohort: March 2026</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-500/10 rounded-[2.5rem] -rotate-3 scale-105"></div>
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src="https://images.unsplash.com/photo-1758873268146-638ea4d99325?auto=format&fit=crop&q=80&w=1000"
                  alt="Founder brainstorming"
                  className="w-full h-[550px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Venture Lifecycle / Framework */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
          <div className="flex-1 space-y-8 relative z-10">
            <h2 className="text-4xl font-bold">The Incubation Framework</h2>
            <p className="text-slate-400 text-lg">We use a data-driven approach to minimize risk and maximize valuation during the critical first 18 months.</p>
            
            
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {startupStages.map((stage, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-red-500 font-black text-xl mb-2 block">0{i+1}</span>
                  <h4 className="font-bold text-white mb-1">{stage.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col gap-6">
            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-10">
                <PieChart size={32} />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">Market Analysis</span>
              </div>
              <p className="text-3xl font-black mb-2">$4.2B</p>
              <p className="text-sm text-red-100 opacity-80 font-medium tracking-wide">Total Addressable Market Available for Portfolio Ventures</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
                <p className="text-2xl font-bold mb-1">120+</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active Mentors</p>
              </div>
              <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
                <p className="text-2xl font-bold mb-1">85%</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Follow-on Funding</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How We Support You</h2>
            <p className="text-slate-500">A full-stack ecosystem designed to turn founders into leaders.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="bg-slate-50 rounded-3xl p-8 border border-slate-100 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-red-600 transition-all duration-300">
                  <feature.icon className="text-red-600 group-hover:text-white transition-colors" size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
            <Lightbulb className="text-yellow-600" size={32} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Have the next big idea?</h2>
          <p className="text-slate-500 text-xl mb-10 max-w-2xl mx-auto">We are looking for visionary founders to join our Summer 2026 incubation batch. Application deadline is approaching.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 px-12 py-8 text-xl rounded-2xl transition-all shadow-xl">
              Apply to Incubator
            </Button>
            <Button size="lg" variant="outline" className="border-slate-200 px-12 py-8 text-xl rounded-2xl hover:bg-slate-50">
              Download Success Stories
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}