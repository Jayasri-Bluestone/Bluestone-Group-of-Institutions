"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../apiConfig";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function OurPeople() {
  const sliderRef = useRef(null);
  const [media, setMedia] = useState({});
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMedia = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/media?category=our_teams`);
        const data = await response.json();
        const finalData = Array.isArray(data) ? data : data.data || [];

        const mappedMedia = {};
        finalData.forEach(item => {
          const key = item.alt_text?.trim();
          if (key) {
            // FIX: Don't add ?v= timestamp if the URL is a Base64 string
            if (item.url.startsWith('data:')) {
              mappedMedia[key] = item.url;
            } else {
              const fullUrl = item.url.startsWith('http') ? item.url : `${API_BASE_URL}/${item.url}`;
              mappedMedia[key] = `${fullUrl}?v=${Date.now()}`;
            }
          }
        });
        setMedia(mappedMedia);
      } catch (error) {
        console.error("Error fetching our_teams media:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/our_people`);
        const data = await response.json();
        setTeam(data);
      } catch (error) {
        console.error("Error fetching our_people:", error);
      }
    };

    Promise.all([fetchTeamMedia(), fetchTeamMembers()]).finally(() => setLoading(false));
  }, []);

  // Helper to fetch images. Matches the filenames provided in your DB snippet.
  const getImg = (key) => media[key] || "https://placehold.co/400x500?text=Member+Photo";

  const settings = {
    dots: true,
    infinite: team.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="py-20 bg-gradient-to-br from-red-500 via-black to-red-500 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-white font-black tracking-widest uppercase text-sm">Our people</span>
          <h2 className="text-5xl md:text-7xl font-black text-white mt-2">Meet Our <span className="text-red-600">Leadership</span></h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" size={48} /></div>
        ) : (
          <div className="relative">
            <button onClick={() => sliderRef.current?.slickPrev()} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg hover:bg-red-50 transition-colors"><ChevronLeft /></button>
            <button onClick={() => sliderRef.current?.slickNext()} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg hover:bg-red-50 transition-colors"><ChevronRight /></button>
            
            <Slider ref={sliderRef} {...settings}>
              {team.map((member, index) => (
                <div key={index} className="px-4 h-full outline-none">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl h-full flex flex-col min-h-[550px]"
                  >
                    <div className="w-full aspect-square overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={member.image_data ? member.image_data : getImg(member.image_key)}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://placehold.co/400x500?text=Image+Error"; }}
                      />
                    </div>

                    <div className="p-6 text-center flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-[10px] font-bold text-red-600 mb-4 uppercase tracking-wider h-8">
                        {member.position}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        "{member.bio}"
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </section>
  );
}