"use client";

import * as React from "react";
// 1. Import useNavigate
import { useNavigate } from 'react-router-dom'; 
import { ArrowLeft, Languages, Globe, Users, BookOpen, Mic, Video, MessageSquare, Headphones, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import heroImage from "../../assets/ocs5.png";

export function LanguageHub() { // Removed { onBack } from props
  // 2. Initialize the hook
  const navigate = useNavigate();

  const languages = [
    { name: 'English', flag: '🇬🇧', level: 'IELTS/TOEFL' },
    { name: 'Spanish', flag: '🇪🇸', level: 'DELE' },
    { name: 'French', flag: '🇫🇷', level: 'DELF' },
    { name: 'German', flag: '🇩🇪', level: 'Goethe-Zertifikat' },
    { name: 'Mandarin', flag: '🇨🇳', level: 'HSK' },
    { name: 'Japanese', flag: '🇯🇵', level: 'JLPT' },
    { name: 'Korean', flag: '🇰🇷', level: 'TOPIK' },
    { name: 'Arabic', flag: '🇸🇦', level: 'ALPT' },
  ];

  const methods = [
    { icon: Mic, title: 'Speech Recognition', desc: 'Real-time feedback on your pronunciation.' },
    { icon: Users, title: 'Native Tutors', desc: '1-on-1 sessions with certified native speakers.' },
    { icon: MessageSquare, title: 'Cultural Immersion', desc: 'Learn idioms and local customs through dialogue.' },
    { icon: Video, title: 'Live Workshops', desc: 'Weekly group sessions for interactive learning.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-slate-50">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-50"
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full mb-6 shadow-lg shadow-indigo-200">
                <Globe size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Global Communication</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.1]">
                Speak the World's <br />
                <span className="bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent">Languages Fluently</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Master a new language through scientific immersion. Our native coaches use interactive methods to get you speaking from day one.
              </p>
              <div className="flex flex-wrap gap-4">
                 <Button 
        asChild
        className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg shadow-red-200"
      >
        <a href="https://www.bluestoneoverseas.com/" target="_blank" rel="noopener noreferrer">
          Visit Our Website
        </a>
      </Button>
              
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Student" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">5k+ Active Polyglots</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl z-10 border-8 border-white">
                <img
                 src={heroImage}
                  alt="Language Learning Environment"
                  className="w-full h-[550px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-indigo-600 rounded-3xl -z-0 rotate-12 opacity-20 blur-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Languages Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Master Your Choice</h2>
            <p className="text-slate-500">Pick a language and start your path to global fluency.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {languages.map((lang, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                className="bg-red-300 rounded-3xl p-8 border border-red-600 border-2 text-center cursor-pointer transition-all group"
              >
                <div className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-300 inline-block">{lang.flag}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{lang.name}</h3>
                <p className="text-red-600 text-xs font-bold uppercase tracking-wider">{lang.level} Prep</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Methodology Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">The CEFR Learning Path</h2>
              <p className="text-slate-400 mb-12 text-lg">We structure our curriculum based on the Common European Framework of Reference for Languages (CEFR).</p>
              
              

              <div className="grid sm:grid-cols-2 gap-8">
                {methods.map((item, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                      <item.icon size={24} />
                    </div>
                    <h4 className="text-xl font-bold">{item.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
               <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2rem] p-8 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-500 rounded-lg">
                       <BarChart3 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold">Progress Analytics</h4>
                      <p className="text-xs text-slate-400">Track your vocabulary & grammar</p>
                    </div>
                  </div>
                  {/* Mock progress bars */}
                  <div className="space-y-6">
                    {['Vocabulary', 'Listening', 'Speaking'].map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-2">
                          <span>{skill}</span>
                          <span className="text-indigo-400">{85 - (i * 10)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${85 - (i * 10)}%` }}
                            className="h-full bg-red-500"
                           />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Headphones className="text-red-600" size={32} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to break the language barrier?</h2>
          <p className="text-slate-500 text-xl mb-10">Sign up for a free 30-minute assessment with a native tutor.</p>
          {/* <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-8 text-xl rounded-2xl shadow-xl shadow-indigo-100">
            Book Free Assessment
          </Button> */}
        </div>
      </section>
    </div>
  );
}