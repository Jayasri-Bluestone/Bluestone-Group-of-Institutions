"use client";

import * as React from "react";
// 1. Import useNavigate
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, MoreHorizontal, Sparkles, Layers, Zap, CheckCircle2, Globe2, ShieldCheck, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export function OtherServices() { // Removed { onBack } from props
  // 2. Initialize the hook
  const navigate = useNavigate();

  const services = [
    { icon: Sparkles, title: 'Consulting Services', description: 'Strategic business consulting across industries to optimize growth.' },
    { icon: Layers, title: 'Digital Solutions', description: 'Cutting-edge technology and digital transformation for the modern age.' },
    { icon: Zap, title: 'Innovation Labs', description: 'R&D and innovation centers focused on creating breakthrough solutions.' },
    { icon: Globe2, title: 'Global Logistics', description: 'Seamless supply chain and international trade management services.' },
  ];

  const highlights = [
    { icon: ShieldCheck, text: "Certified Quality Standards" },
    { icon: Headphones, text: "24/7 Dedicated Support" },
    { icon: CheckCircle2, text: "Tailored Project Scoping" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-r from-red-200 to-purple-200 rounded-full filter blur-3xl"
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
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg mb-6 shadow-xl">
                <Sparkles size={18} className="text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Premium Ecosystem</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                Comprehensive <span className="bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">Business Solutions</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Beyond our core offerings, we provide a diverse range of professional services tailored to meet evolving market needs and deliver exceptional value.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                {/* <Button className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg shadow-red-200">
                  Explore Catalog
                </Button>
                <Button variant="outline" className="text-lg px-8 py-7 rounded-xl border-slate-200 hover:bg-slate-50">
                  Download Brochure
                </Button> */}
              </div>

              <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-8">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <h.icon size={18} className="text-green-500" />
                    {h.text}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-red-100 to-purple-100 rounded-[3rem] rotate-3 scale-105"></div>
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src="https://images.unsplash.com/photo-1640323240640-ee731d18dcb1?auto=format&fit=crop&q=80&w=1080"
                  alt="Business Solutions"
                  className="w-full h-[550px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What We Offer</h2>
            <p className="text-slate-500">Specialized divisions dedicated to your company's unique trajectory.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -12 }}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:rotate-12 transition-all duration-300">
                  <service.icon className="text-red-600 group-hover:text-white transition-colors" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Diagram Placeholder */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]"></div>
          
          <div className="flex-1 space-y-8 relative z-10">
            <h2 className="text-4xl font-bold">The Strategic Lifecycle</h2>
            <p className="text-slate-400 text-lg">We don't just provide a service; we integrate with your existing workflow to create a feedback loop of continuous improvement.</p>
            
            <div className="grid gap-4">
              {['Discovery & Analysis', 'Custom Development', 'Scalable Implementation'].map((step, i) => (
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

 
    </div>
  );
}