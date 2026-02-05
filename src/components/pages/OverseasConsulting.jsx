"use client";

import * as React from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, Globe, Users, Award, TrendingUp, MapPin, Star, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export function OverseasConsulting() {
  const navigate = useNavigate();

  const services = [
    { icon: Globe, title: 'Study Abroad', description: 'Expert guidance for top universities worldwide' },
    { icon: Users, title: 'Career Counseling', description: 'International job placement and career planning' },
    { icon: Award, title: 'Visa Assistance', description: 'Complete support for visa applications and processing' },
    { icon: TrendingUp, title: 'Test Preparation', description: 'IELTS, TOEFL, GRE, GMAT coaching programs' },
  ];

  const countries = [
    { 
      name: 'USA', 
      universities: '4000+', 
      url: 'https://www.bluestoneoverseas.com/usa.php',
      image: './src/assets/usa.png'
    },
    { 
      name: 'UK', 
      universities: '160+', 
      url: 'https://www.bluestoneoverseas.com/uk.php',
      image: './src/assets/uk.png'
    },
    { 
      name: 'Canada', 
      universities: '100+', 
      url: 'https://www.bluestoneoverseas.com/canada.php',
      image: './src/assets/canada.png'
    },
    { 
      name: 'Australia', 
      universities: '40+', 
      url: 'https://www.bluestoneoverseas.com/australia.php',
      image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&q=80&w=800'
    },
    { 
      name: 'Germany', 
      universities: '380+', 
      url: 'https://www.bluestoneoverseas.com/germany.php',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=800'
    },
    { 
      name: 'France', 
      universities: '3500+', 
      url: 'https://www.bluestoneoverseas.com/france.php',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800'
    },
    { 
      name: 'Singapore', 
      universities: '30+', 
      url: 'https://www.bluestoneoverseas.com/singapore.php',
      image: './src/assets/singapore.png'
    },
    { 
      name: 'Ireland', 
      universities: '20+', 
      url: 'https://www.bluestoneoverseas.com/ireland.php',
      image: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&q=80&w=800'
    },
  ];

  const steps = [
    { title: "Profile Evaluation", desc: "Understanding your academic background and goals." },
    { title: "University Selection", desc: "Shortlisting the best-fit institutions for your career." },
    { title: "Application Process", desc: "Handling documentation and SOP/LOR assistance." },
    { title: "Visa & Departure", desc: "Finalizing your visa and pre-departure briefing." }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-slate-50">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-50"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-700 hover:text-red-600 mb-8 group font-medium"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </motion.button>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg mb-6 shadow-xl">
                <Plane size={18} className="text-red-500" />
                <span className="text-xs font-bold tracking-widest uppercase">Global Education Expert</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1]">
                Your Gateway to <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Global Success</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Unlock international education and career opportunities. We navigate the complex process of studying or working abroad so you don't have to.
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
                <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-xl border border-slate-200">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">10k+ Students Placed</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-[12px] border-white">
                <img
                  src="https://images.unsplash.com/photo-1709054172839-17880c040f22?auto=format&fit=crop&q=80&w=1080"
                  alt="Students studying abroad"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Visa Success</p>
                    <p className="text-2xl font-black text-slate-900">99.2%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-600 max-w-xl mx-auto">A systematic 4-step approach to securing your international future.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="text-6xl font-black text-red-600 absolute -top-10 -left-2 group-hover:text-red-100 transition-colors">0{idx + 1}</div>
              <div className="relative z-10 pt-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations Grid with Background Images */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-slate-400">Choose from top-ranking global education hubs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {countries.map((country, index) => (
              <a 
                key={index} 
                href={country.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block relative h-80 w-full rounded-3xl overflow-hidden shadow-2xl transition-transform hover:-translate-y-2"
              >
                {/* Background Image Container */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url(${country.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />

                {/* Overlay for readability */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent group-hover:from-red-950/80 transition-colors duration-500" />

                {/* Text Content */}
                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                  <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-1">{country.name}</h3>
                  <p className="text-slate-300 text-sm font-medium">{country.universities} Universities</p>
                  
                  <div className="mt-4 overflow-hidden">
                    <div className="transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="inline-block py-2 px-4 bg-white text-slate-900 text-xs font-bold rounded-full">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Comprehensive Support For Every Student</h2>
            <div className="space-y-4">
              {services.map((service, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <service.icon className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{service.title}</h4>
                    <p className="text-slate-500 text-sm">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-red-600 rounded-3xl p-12 text-white relative">
            <Star className="absolute top-10 right-10 text-red-400 w-20 h-20 rotate-12" />
            <h3 className="text-3xl font-bold mb-6">Start Your Journey Today</h3>
            <p className="text-red-100 mb-10 text-lg">Speak with our expert counselors and get a personalized roadmap for your career abroad.</p>
          </div>
        </div>
      </section>
    </div>
  );
}