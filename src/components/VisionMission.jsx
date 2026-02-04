"use client";

import * as React from "react";
import { Target, Eye, Compass, Sparkles, Shield, Rocket, Heart, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function VisionMission() {
  const values = [
    { name: 'Integrity', icon: Shield, desc: 'Doing the right thing, always.' },
    { name: 'Innovation', icon: Rocket, desc: 'Challenging the status quo.' },
    { name: 'Excellence', icon: Sparkles, desc: 'Uncompromising quality standards.' },
    { name: 'Sustainability', icon: Globe, desc: 'Building for the next generation.' },
    { name: 'Collaboration', icon: Users, desc: 'Powering progress through unity.' },
  ];

  return (
    <section id="vision" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(244,63,94,0.1)_0%,transparent_50%)]"></div>
      </div>

      {/* Animated Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/4 right-10 w-64 h-64 bg-red-600 rounded-full filter blur-[100px]"
      ></motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 backdrop-blur-md text-red-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-red-500/30">
            <Sparkles size={14} />
            <span>Our Foundation</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Built on <span className="text-red-500">Purpose</span>,<br />Driven by <span className="text-rose-400">Values</span>.
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We aren't just building businesses; we are creating a legacy of excellence that transcends industries and empowers communities.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative p-10 bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 hover:border-red-500/50 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform">
              <Eye className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">The Vision</h3>
            <p className="text-slate-400 leading-relaxed italic">
              "To be a globally recognized conglomerate that sets industry benchmarks through innovation, sustainability, and unwavering commitment to excellence in every venture we undertake."
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative p-10 bg-gradient-to-br from-red-600 to-rose-700 rounded-[2.5rem] shadow-2xl shadow-red-900/20"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform">
              <Target className="text-red-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">The Mission</h3>
            <p className="text-red-50 leading-relaxed font-medium">
              "To create sustainable value for all stakeholders through strategic business operations, foster innovation, and contribute positively to communities while maintaining ethical standards."
            </p>
          </motion.div>

          {/* Core Values Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative p-10 bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 hover:border-rose-500/50 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-rose-900/20 group-hover:scale-110 transition-transform">
              <Compass className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">The Compass</h3>
            <p className="text-slate-400 leading-relaxed">
              Our values guide every decision. We prioritize long-term impact over short-term gains, ensuring that every relationship we build is rooted in trust and excellence.
            </p>
          </motion.div>
        </div>

        {/* Stakeholder Value Logic Section */}
        

        {/* Values Grid */}
        <div className="relative mt-20">
          <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800 -z-10 hidden lg:block"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300 shadow-xl group-hover:shadow-red-900/40">
                  <v.icon size={28} className="text-slate-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">{v.name}</h4>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}