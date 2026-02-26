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
    fetchTeamMedia();
  }, []);

  // Helper to fetch images. Matches the filenames provided in your DB snippet.
  const getImg = (key) => media[key] || "https://placehold.co/400x500?text=Member+Photo";

  const team = [
    {
      name: "Mrs. Neena Priya",
      position: "Bluestone Overseas Co-ordinator",
      image: getImg("Neena.jpeg"), // Ensure DB alt_text matches this or update to "neena.png"
      bio: "Expert in international relations and global mobility, streamlining cross-border transitions for students and professionals.",
    },
    {
      name: "Mr. Tamil Selvan",
      position: "Bluestone IAS Academy Co-ordinator",
      image: getImg("Tamil.jpeg"),
      bio: "Dedicated educator specializing in civil service curriculum design and competitive examination strategy.",
    },
    {
      name: "Mr. Dharani Kumaresan",
      position: "Corresponded of Bluestone International Preschool",
      image: getImg("Dharani.jpeg"),
      bio: "Specialist in early childhood development, implementing world-class Montessori and play-based learning frameworks.",
    },
    {
      name: "Mr. Saravanan",
      position: "Bluestone Placement Co-ordinator",
      image: getImg("Saravanan.jpeg"),
      bio: "Bridging the gap between talent and industry through strategic corporate partnerships and career coaching.",
    },
    {
      name: "Mr. Mani",
      position: "Bluestone Tech-Park Co-ordinator",
      image: getImg("Mani.png"), // Updated to match your specific DB upload
      bio: "Managing high-tech workspace infrastructure and fostering an ecosystem for startups and digital innovation.",
    },
    {
      name: "Mr. Divit",
      position: "Elite Sports Co-ordinator",
      image: getImg("Divit.jpg"),
      bio: "Driving athletic excellence through specialized training programs and professional sports management.",
    },
  ];

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
                    <div className="h-80 overflow-hidden flex-shrink-0 bg-gray-200">
                      <img
                        src={member.image}
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