"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; 
import { 
  ArrowLeft, GraduationCap, Star, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { API_BASE_URL } from '../../apiConfig';

// Custom Arrow Components (Remain the same)
function NextArrow({ onClick }) {
  return (
    <button onClick={onClick} className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 hidden md:flex">
      <ChevronRight size={24} />
    </button>
  );
}

function PrevArrow({ onClick }) {
  return (
    <button onClick={onClick} className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 hidden md:flex">
      <ChevronLeft size={24} />
    </button>
  );
}

export function InternationalPreschool() {
  const navigate = useNavigate();
  const [images, setImages] = useState({}); // Changed to object for key-value mapping
  const [loading, setLoading] = useState(true);

  // --- FETCH PRESCHOOL IMAGES ---
  useEffect(() => {
    const fetchPreschoolData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media?category=focus`);
        const data = await res.json();
        const finalData = Array.isArray(data) ? data : data.data || [];
        
        const mappedMedia = {};
        finalData.forEach(item => {
          const key = item.alt_text?.trim();
          if (key) {
            // BASE64 LOGIC: Use the data string if available, 
            // otherwise build the URL with cache-busting
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
        console.error("Preschool Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPreschoolData();
  }, []);

  // Image Mapping Helper (Fetches by Alt Text Key)
  const getImg = (altKey) => images[altKey] || "https://placehold.co/800x600?text=Upload+Image";

  const programs = [
    { age: '2-3 Years', name: 'NESTLERS', focus: 'Our Nestlers program provides a safe, caring, and stimulating environment.', link: 'https://bluestoneinternationalpreschool.com/program/nestlers' },
    { age: '3-4 Years', name: 'BAMBINO', focus: 'The Bambino program nurtures natural curiosity through play-based learning.', link: 'https://bluestoneinternationalpreschool.com/program/bambino' },
    { age: '4-5 Years', name: 'B JUNIOR', focus: 'B Junior offers a balanced blend of guided instruction and exploratory play.', link: 'https://bluestoneinternationalpreschool.com/program/b-junior' },
    { age: '5-6 Years', name: 'B SENIOR', focus: 'The B Senior program equips children with academic and emotional readiness.', link: 'https://bluestoneinternationalpreschool.com/program/b-senior' },
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-600 hover:text-red-600 mb-8 font-medium">
            <ArrowLeft /> <span>Back to Home</span>
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
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-red-100">
                <a href="https://bluestoneinternationalpreschool.com/" target="_blank">Visit Our Website</a>
              </Button>
            </motion.div>

            {/* DYNAMIC HERO IMAGE (Key: hero_preschool) */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img src={getImg("Drow.jpg")} alt="Children learning" className="w-full h-[500px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Educational Philosophy (Dynamic Grid) */}
      <section className="py-24 max-w-7xl mx-auto px-4 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-red-600 mb-8">Our Developmental Philosophy</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              We follow the <strong className="text-red-600">Whole Child</strong> approach, ensuring physical health and academic curiosity.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {[
              { title: "Safety First", key: "scl1.jpg" },
              { title: "Global Standards", key: "scl3.JPG" },
              { title: "Creative Play", key: "scl8.jpg" },
              { title: "Campus Life", key: "scl7.JPG" },
            ].map((item, idx) => (
              <div key={idx} className="relative h-48 rounded-2xl overflow-hidden group shadow-md">
                <img 
                   src={getImg(item.key)} 
                   alt={item.title} 
                   className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="text-white font-bold text-xl relative z-10">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Slider (Remain the same) */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-4xl font-bold mb-16">Tailored Learning Programs</h2>
           <Slider {...settings}>
              {programs.map((program, index) => (
                <div key={index} className="px-3 pb-10">
                  <motion.div whileHover={{ y: -10 }} className="h-[420px] bg-white border rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col text-slate-900">
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="inline-flex items-center gap-2 px-4 py-1 bg-black rounded-full text-xs text-white font-bold mb-6 w-fit">
                        <Star size={14} />
                        <span>{program.age}</span>
                      </div>
                      <h3 className="text-2xl text-red-600 font-bold mb-4">{program.name}</h3>
                      <p className="text-slate-700 leading-relaxed text-sm mb-8 flex-grow">{program.focus}</p>
                      <Button asChild className="w-full bg-red-600 text-white hover:bg-black border-none">
                        <a href={program.link} target="_blank">Program Details</a>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>
        </div>
      </section>
    </div>
  );
}