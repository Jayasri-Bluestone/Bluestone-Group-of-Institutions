"use client";

import * as React from "react";
import { useNavigate } from 'react-router-dom'; 
import { 
  ArrowLeft, GraduationCap, Star, ShieldCheck, Sun, Music, Palette, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

// Slick Imports
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// --- IMAGE IMPORTS ---
import schoolHero from "../../assets/School.jpg";
import scl1 from "../../assets/scl1.jpg";
import scl6 from "../../assets/scl6.jpg";
import scl7 from "../../assets/scl7.jpg";
import scl8 from "../../assets/scl8.jpg";

// Custom Arrow Components
function NextArrow(props) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors hidden md:flex"
    >
      <ChevronRight size={24} />
    </button>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors hidden md:flex"
    >
      <ChevronLeft size={24} />
    </button>
  );
}

export function InternationalPreschool() {
  const navigate = useNavigate();

  const programs = [
    { 
      age: '2-3 Years', 
      name: 'NESTLERS', 
      focus: 'Our Nestlers program provides a safe, caring, and stimulating environment where children take their first steps into structured learning.',
      link: 'https://bluestoneinternationalpreschool.com/program/nestlers'
    },
    { 
      age: '3-4 Years', 
      name: 'BAMBINO', 
      focus: 'The Bambino program nurtures natural curiosity through play-based and experiential learning for foundational growth.',
      link: 'https://bluestoneinternationalpreschool.com/program/bambino'
    },
    { 
      age: '4-5 Years', 
      name: 'B JUNIOR', 
      focus: 'B Junior offers a balanced blend of guided instruction and exploratory play to develop problem-solving skills.',
      link: 'https://bluestoneinternationalpreschool.com/program/b-junior'
    },
    { 
      age: '5-6 Years', 
      name: 'B SENIOR', 
      focus: 'The B Senior program equips children with the academic and emotional readiness required for primary school.',
      link: 'https://bluestoneinternationalpreschool.com/program/b-senior'
    },
  ];

  const pillars = [
    { icon: Sun, label: 'Nature Play' },
    { icon: Music, label: 'Rhythm & Arts' },
    { icon: Palette, label: 'Creative Expression' },
    { icon: ShieldCheck, label: 'Emotional Safety' }
  ];

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, arrows: false, centerMode: true, centerPadding: "20px" } }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <motion.button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 mb-8 group font-medium"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </motion.button>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full mb-6">
                <GraduationCap size={18} />
                <span className="text-xs font-bold uppercase">Premium Early Education</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Where Young Minds <br />
                <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">Truly Blossom</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-lg">
                Nurturing curiosity through an international curriculum designed to build confidence and creativity.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-red-100 transition-all">
                <a href="https://bluestoneinternationalpreschool.com/" target="_blank" rel="noopener noreferrer">Visit Our Website</a>
              </Button>
            </motion.div>

            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img src={schoolHero} alt="Children learning" className="w-full h-[500px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 max-w-7xl bg-gradient-to-br from-red-600 to-black/50 rounded-4xl mx-auto px-4 shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-red-500 group-hover:bg-black group-hover:text-white transition-all duration-300">
                <pillar.icon size={28} />
              </div>
              <span className="font-bold text-white uppercase text-xs tracking-widest">{pillar.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Philosophy */}
      <section className="py-24 max-w-7xl mx-auto px-4 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 order-2 lg:order-1">
            <h2 className="text-4xl font-bold text-red-600 mb-8">Our Developmental Philosophy</h2>
            <p className="text-slate-600 text-lg leading-relaxed mt-6">
              We follow the <strong className="text-red-600">Whole Child</strong> approach, ensuring that physical health, social-emotional well-being, and academic curiosity are all nurtured in parallel.
            </p>
          </div>

          <div className="flex-1 order-1 lg:order-2 grid grid-cols-2 gap-4 w-full">
            {[
              { title: "Safety First", img: scl7 },
              { title: "Global Standards", img: scl6 },
              { title: "Creative Play", img: scl8 },
              { title: "Native Fluency", img: scl1 },
            ].map((item, idx) => (
              <div key={idx} className="relative h-48 rounded-2xl overflow-hidden group shadow-md">
                <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="text-white font-bold text-xl relative z-10">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Slider */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16">
            <h2 className="text-4xl font-bold mb-4">Tailored Learning Programs</h2>
            <p className="text-slate-400">Age-appropriate curriculum for every milestone.</p>
          </div>

          <div className="relative px-2">
            <Slider {...settings}>
              {programs.map((program, index) => (
                <div key={index} className="px-3 pb-10">
                  <motion.div whileHover={{ y: -10 }} className="h-[420px] bg-white border rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-bl-full"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="inline-flex items-center gap-2 px-4 py-1 bg-black rounded-full text-xs text-white font-bold mb-6 w-fit">
                        <Star size={14} />
                        <span>{program.age}</span>
                      </div>
                      <h3 className="text-2xl text-red-600 font-bold mb-4">{program.name}</h3>
                      <p className="text-black leading-relaxed text-sm mb-8 flex-grow">{program.focus}</p>
                      
                      <Button asChild variant="outline" className="w-full bg-red-600 text-white hover:bg-black hover:text-white border-none mt-auto">
                        <a href={program.link} target="_blank" rel="noopener noreferrer">Program Details</a>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-5xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-red-600 to-black rounded-[3rem] p-16 text-white shadow-2xl relative overflow-hidden">
          <h2 className="text-4xl font-bold mb-6">Give Your Child the Best Start</h2>
          <p className="text-xl mb-10 text-red-50 max-w-2xl mx-auto">Admission is open for the new session. Limited seats available.</p>
        </motion.div>
      </section>
    </div>
  );
}