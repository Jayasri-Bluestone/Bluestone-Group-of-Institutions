"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Image as ImageIcon } from 'lucide-react';

// --- IMAGE IMPORTS ---
import ias1 from "../../assets/ias1.png";
import ias2 from "../../assets/ias2.png";
import ias4 from "../../assets/ias4.png";
import ias5 from "../../assets/ias5.png";
import scl1 from "../../assets/scl1.jpg";
import scl2 from "../../assets/scl2.jpeg";
import scl3 from "../../assets/scl3.JPG";
import scl4 from "../../assets/scl4.jpg";
import scl6 from "../../assets/scl6.JPG";
import scl7 from "../../assets/scl7.JPG";
import scl8 from "../../assets/scl8.jpg";
import sport1 from "../../assets/sport1.JPG";
import sport2 from "../../assets/sport2.jpg";
import ocs1 from "../../assets/ocs1.png";
import ocs3 from "../../assets/ocs3.png";
import ocs4 from "../../assets/ocs4.png";
import ocs6 from "../../assets/ocs6.png";

export function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const [selectedImg, setSelectedImg] = useState(null);

  const categories = ['All', 'IAS Academy', 'Technology', 'Preschool', 'Sports', 'Overseas Consulting', 'Events'];

  const photos = [
    { id: 1, category: 'IAS Academy', title: 'Strategy Session', src: ias1 },
    { id: 2, category: 'Technology', title: 'Tech Park Campus', src: scl4 },
    { id: 3, category: 'Sports', title: 'Elite Training', src: sport1 },
    { id: 4, category: 'Overseas Consulting', title: 'Global Opportunities', src: ocs1 },
    { id: 5, category: 'IAS Academy', title: 'Seminar Hall', src: ias2 },
    { id: 6, category: 'Events', title: 'Corporate Meet', src: scl3 },
    { id: 7, category: 'Technology', title: 'Innovation Lab', src: ocs3 },
    { id: 8, category: 'IAS Academy', title: 'Graduation Day', src: ias4 },
    { id: 9, category: 'Overseas Consulting', title: 'Student Guidance', src: ocs4 },
    { id: 10, category: 'IAS Academy', title: 'Expert Talk', src: ias5 },
    { id: 11, category: 'Preschool', title: 'Creative Learning', src: scl1 },
    { id: 12, category: 'Preschool', title: 'Play Area', src: scl2 },
    { id: 13, category: 'Preschool', title: 'Classroom Fun', src: scl4 },
    { id: 14, category: 'Overseas Consulting', title: 'Visa Workshop', src: ocs6 },
    { id: 15, category: 'Sports', title: 'Athletic Meet', src: sport2 },
    { id: 16, category: 'Preschool', title: 'Story Time', src: scl6 },
    { id: 17, category: 'Preschool', title: 'Art & Craft', src: scl7 },
    { id: 18, category: 'Preschool', title: 'School Event', src: scl8 },
  ];

  const filteredPhotos = useMemo(() => 
    filter === 'All' ? photos : photos.filter(p => p.category === filter)
  , [filter]);

  return (
    <main className="min-h-screen pt-28 pb-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4 block">Visual Archive</span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Moments</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Explore the milestones and memories across Bluestone Group's diverse ecosystem.
            </p>
          </motion.div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-12 overflow-x-auto pb-4 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-7 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95 ${
                filter === cat 
                ? 'bg-gray-900 text-white shadow-xl scale-105' 
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="group relative h-[350px] rounded-[2rem] overflow-hidden cursor-pointer bg-white shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100"
                onClick={() => setSelectedImg(photo)}
              >
                <img 
                  src={photo.src} 
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-bold text-lg leading-tight">{photo.title}</p>
                      <Maximize2 className="text-red-400 shrink-0" size={18} />
                    </div>
                    <span className="text-red-300 text-xs font-bold uppercase tracking-wider">{photo.category}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        {filteredPhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-gray-400">
            <ImageIcon size={64} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-xl font-medium">No images found in this category.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/95 backdrop-blur-xl"
            onClick={() => setSelectedImg(null)}
          >
            <button className="absolute top-10 right-10 z-[110] p-3 bg-white/5 hover:bg-red-500 rounded-full text-white transition-all group">
              <X size={32} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-6xl w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImg.src} 
                className="w-full h-auto max-h-[75vh] object-contain rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" 
                alt="Selected"
              />
              <div className="mt-8 flex flex-col items-center">
                <span className="px-4 py-1 bg-red-600 text-white text-xs font-black uppercase rounded-full mb-3 shadow-lg shadow-red-600/20">
                    {selectedImg.category}
                </span>
                <h3 className="text-white text-3xl font-black text-center">{selectedImg.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}