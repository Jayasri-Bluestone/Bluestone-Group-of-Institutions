"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../apiConfig";

export function BusinessFocus({ onNavigate }) {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/media?category=business_verticals`);
        const data = await response.json();
        const finalData = Array.isArray(data) ? data : data.data || [];

        const mappedImages = {};
        finalData.forEach(item => {
          // Normalizing the alt_text to lowercase to match our object keys
          const key = item.alt_text?.trim().toLowerCase();
          
          if (key) {
            // FIX: If it's Base64 (starts with data:), use it directly. 
            // If it's a file path, append the API_BASE_URL.
            mappedImages[key] = item.url.startsWith('data:') 
              ? item.url 
              : `${API_BASE_URL}/${item.url}`;
          }
        });

        setImages(mappedImages);
      } catch (error) {
        console.error("Error fetching admin images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Update these keys to match exactly what you typed in the "Alt Description" field during upload
  const businesses = [
    {
      title: "Preschool",
      description: "Early learning with global standards.",
      mainImage: images['drow.jpg'], // Matches your DB entry
      thumbImage: images['preschool.png'],
      page: "https://bluestoneinternationalpreschool.com/",
    },
    {
      title: "Overseas Consulting",
      description: "Guidance for education & careers abroad.",
      mainImage: images['ias3.png'],
      thumbImage: images['overseas.png'],
      page: "https://www.bluestoneoverseas.com/",
    },
    {
      title: "IAS Academy",
      description: "Civil services coaching excellence.",
      mainImage: images['ias5.png'],
      thumbImage: images['ias.png'],
      page: "https://bluestoneiasacademy.com/",
    },
    {
      title: "Placement Services",
      description: "Connecting talent with opportunity.",
      mainImage: images['placement1.png'],
      thumbImage: images['placement.png'],
      page: "https://bluestoneplacements.com/",
    },
    {
      title: "Tech Park",
      description: "Infrastructure for tech innovation.",
      mainImage: images['tech.png'],
      thumbImage: images['tech park.png'],
      page: "https://bluestonetechpark.com/",
    },
    {
      title: "Sport Academy",
      description: "Elite athletic training programs.",
      mainImage: images['sport2.jpg'],
      thumbImage: images['elite sports.png'],// Handles mixed case extensions
      page: "https://bluestoneelitesports.com/",
    },
    {
      title: "Language Hub",
      description: "Learn global languages with experts.",
      mainImage: images['ias3.png'],
      thumbImage: images['lang hub.png'],
      page: "https://www.bluestoneoverseas.com/",
    },
    {
      title: "Bluestone Start-Ups",
      description: "Mentorship for innovative founders.",
      mainImage: images['ocs6.png'],
      thumbImage: images['startup.png'],
      page: "https://bluestonetechpark.com/",
    },
    {
      title: "Bluestone Investment",
      description: "Entertainment and recreational spaces.",
      mainImage: images['innovation.png'],
      thumbImage: images['investment.png'],
      page: "",
    },
  ];

  const handleNavigate = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <section id="business-focus" className="min-h-screen bg-white md:m-24 m-6 flex items-center">
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-5xl md:text-7xl font-extrabold text-red-600 text-center mb-16">
          Business <span className="text-black">Verticals</span>
        </h2>

        <div className="grid grid-cols-3 gap-4 md:gap-6 ">
          {businesses.map((b, i) => (
            <motion.div
              key={i}
              initial="rest"
              whileHover="hover"
              animate="rest"
              onClick={() => handleNavigate(b.page)}
              className="relative h-40 md:h-48 rounded-2xl overflow-hidden border-2 border-black cursor-pointer bg-gradient-to-br from-red-500 via-black to-red-500"
            >
              {/* MOBILE VIEW */}
              <div className="md:hidden w-full h-full">
                <img src={b.thumbImage} className="w-full h-full object-cover" alt="" />
              </div>

              {/* DESKTOP IMAGE (RIGHT) */}
              <motion.div
                variants={{ rest: { width: "50%" }, hover: { width: "100%" } }}
                transition={{ duration: 0.5 }}
                className="hidden md:block absolute right-0 top-0 h-full "
              >
                <img src={b.mainImage} className="w-full h-full object-cover" alt="" />
                <motion.div variants={{ rest: { opacity: 0 }, hover: { opacity: 0.45 } }} className="absolute inset-0 bg-black" />
              </motion.div>

              {/* DESKTOP THUMB (LEFT) */}
              <motion.div
                variants={{ rest: { x: 0, opacity: 1 }, hover: { x: "-100%", opacity: 0 } }}
                className="hidden md:flex absolute left-0 top-0 h-full w-1/2 items-center justify-center"
              >
                <img src={b.thumbImage} className="w-full h-full object-cover" alt="" />
              </motion.div>

              {/* HOVER CONTENT */}
              <motion.div
                variants={{ rest: { opacity: 0, y: 20 }, hover: { opacity: 1, y: 0 } }}
                className="hidden md:flex absolute inset-0 z-20 flex-col justify-center px-6 pointer-events-none"
              >
                <h3 className="text-xl font-bold text-white">{b.title}</h3>
                <p className="text-[10px] text-gray-300 mb-2">{b.description}</p>
                <div className="flex items-center gap-2 text-red-500 text-sm font-bold">Explore <ArrowRight size={14} /></div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}