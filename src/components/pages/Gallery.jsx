"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';

export function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);

  const categories = ['All', 'IAS Academy', 'Technology', 'Preschool', 'Overseas Consulting', 'Events'];

  // --- 1. Fetch ALL Gallery Images once ---
  const fetchGallery = async () => {
    try {
      setLoading(true);
      // We fetch all images where category is gallery
      const res = await fetch(`${API_BASE_URL}/api/media?category=gallery`);
      const data = await res.json();
      const finalData = Array.isArray(data) ? data : data.data || [];
      setPhotos(finalData);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // --- 2. Smart Filtering Logic ---
  const filteredPhotos = useMemo(() => {
    // If 'All' is selected, return the full array
    if (filter === 'All') return photos;
    
    // Otherwise, filter by the 'caption' column we updated in SQL
    return photos.filter(p => p.caption === filter);
  }, [filter, photos]);

  return (
    <main className="min-h-screen pt-28 pb-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">Gallery</h1>
          <p className="text-gray-500">Showing {filter} moments ({filteredPhotos.length})</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === cat 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative aspect-square rounded-3xl overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImg(photo)}
                >
                  <img src={photo.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <p className="text-white font-bold">{photo.caption || 'Gallery'}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox Component remains same as previous code... */}
    </main>
  );
}