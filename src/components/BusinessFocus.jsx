"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// --- 1. IMPORT ALL IMAGES ---
import drowImg from "../assets/Drow.jpg";
import preschoolThumb from "../assets/preschool.png";
import ocsMain from "../assets/ocs.png";
import overseasThumb from "../assets/overseas.png";
import tnpscMain from "../assets/tnpsc.png";
import iasThumb from "../assets/IAS.png";
import placementMain from "../assets/placement.jpeg";
import placementThumb from "../assets/placement.png";
import techMain from "../assets/tech.png";
import techThumb from "../assets/tech park.png";
import natuMain from "../assets/natu.png";
import eliteThumb from "../assets/elite sports.png";
import langThumb from "../assets/lang hub.png";
import innovationMain from "../assets/innovation.png";
import startupThumb from "../assets/startup.png";
import placement1Main from "../assets/placement1.png";
import generalThumb from "../assets/general.png";

export function BusinessFocus({ onNavigate }) {
  const businesses = [
    {
      title: "Preschool",
      description: "Early learning with global standards.",
      mainImage: drowImg, // Use imported variable
      thumbImage: preschoolThumb,
      page: "https://bluestoneinternationalpreschool.com/",
    },
    {
      title: "Overseas Consulting",
      description: "Guidance for education & careers abroad.",
      mainImage: ocsMain,
      thumbImage: overseasThumb,
      page: "https://www.bluestoneoverseas.com/",
    },
    {
      title: "IAS Academy",
      description: "Civil services coaching excellence.",
      mainImage: tnpscMain,
      thumbImage: iasThumb,
      page: "https://bluestoneiasacademy.com/",
    },
    {
      title: "Placement Services",
      description: "Connecting talent with opportunity.",
      mainImage: placementMain,
      thumbImage: placementThumb,
      page: "https://bluestoneplacements.com/",
    },
    {
      title: "Tech Park",
      description: "Infrastructure for tech innovation.",
      mainImage: techMain,
      thumbImage: techThumb,
      page: "https://bluestonetechpark.com/",
    },
    {
      title: "Sport Academy",
      description: "Elite athletic training programs.",
      mainImage: natuMain,
      thumbImage: eliteThumb,
      page: "https://bluestoneelitesports.com/",
    },
    {
      title: "Language Hub",
      description: "Learn global languages with experts.",
      mainImage: "https://images.unsplash.com/photo-1758270704787-615782711641?auto=format&fit=crop&q=80&w=800",
      thumbImage: langThumb,
      page: "https://www.bluestoneoverseas.com/",
    },
    {
      title: "Bluestone Start-Ups",
      description: "Mentorship for innovative founders.",
      mainImage: innovationMain,
      thumbImage: startupThumb,
      page: "https://bluestonetechpark.com/",
    },
    {
      title: "Bluestone Investment",
      description: "Entertainment and recreational spaces.",
      mainImage: placement1Main,
      thumbImage: generalThumb,
      page: "",
    },
  ];

   
  const handleNavigate = (url) => {
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  };

  return (
    <section id="business-focus" className="min-h-screen bg-white md:m-24 m-6 flex items-center">
      <div className="max-w-5xl mx-auto w-full">

       <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl md:text-7xl font-extrabold text-red-600 mt-2">Business <span className="text-black">Verticals</span></h2>
              </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6">
          {businesses.map((b, i) => (
            <motion.div
              key={i}
              initial="rest"
              whileHover="hover"
              animate="rest"
              onClick={() => handleNavigate(b.page)}
              className="
                relative h-40 md:h-48 rounded-2xl overflow-hidden 
                border-2 border-black cursor-pointer
                bg-gradient-to-br from-red-500 via-black to-red-500
              "
            >
              {/* MOBILE VIEW — ONLY THUMB */}
              <div className="md:hidden w-full h-full flex flex-col items-center justify-center">
                <img src={b.thumbImage} className="w-full h-full mb-0" />
              </div>

              {/* DESKTOP IMAGE (RIGHT HALF → FULL ON HOVER) */}
              <motion.div
                variants={{
                  rest: { width: "50%" },
                  hover: { width: "100%" },
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="hidden md:block absolute right-0 top-0 h-full"
              >
                <img
                  src={b.mainImage}
                  className="w-full h-full object-cover"
                />
                <motion.div
                  variants={{
                    rest: { opacity: 0 },
                    hover: { opacity: 0.45 },
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black"
                />
              </motion.div>

              {/* DESKTOP THUMB (LEFT HALF → SLIDE OUT) */}
              <motion.div
                variants={{
                  rest: { x: 0, opacity: 1 },
                  hover: { x: "-100%", opacity: 0 },
                }}
                transition={{ duration: 0.4 }}
                className="
                  hidden md:flex absolute left-0 top-0 h-full w-1/2 
                  flex-col items-center justify-center
                "
              >
                <img src={b.thumbImage} className="w-full h-full mb-2" />
              
              </motion.div>

              {/* DESKTOP HOVER CONTENT */}
              <motion.div
                variants={{
                  rest: { opacity: 0, y: 20 },
                  hover: { opacity: 1, y: 0 },
                }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="
                  hidden md:flex absolute inset-0 z-20 
                  flex-col justify-center items-start 
                  px-6 pointer-events-none
                "
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {b.title}
                </h3>
                <p className="text-sm text-gray-300 mb-4 max-w-xs">
                  {b.description}
                </p>
                <div className="flex items-center gap-2 text-red-500 font-semibold">
                  Explore <ArrowRight size={18} />
                </div>
              </motion.div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}