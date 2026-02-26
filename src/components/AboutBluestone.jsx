"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react"; // Added for a better loader
import { API_BASE_URL } from "../apiConfig";

export default function AboutBluestone() {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutMedia = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/media?category=about_us`);
        const data = await response.json();
        const finalData = Array.isArray(data) ? data : data.data || [];

        const mappedImages = {};
        finalData.forEach((item) => {
          const key = item.alt_text?.trim();
          if (key) {
            // Check if it's a Base64 string
            if (item.url.startsWith('data:')) {
              mappedImages[key] = item.url;
            } else {
              // Standard URL logic
              const fullUrl = item.url.startsWith('http') ? item.url : `${API_BASE_URL}/${item.url}`;
              mappedImages[key] = `${fullUrl}?v=${Date.now()}`;
            }
          }
        });

        setImages(mappedImages);
      } catch (error) {
        console.error("Error fetching about_us media:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutMedia();
  }, []);

  // Helper to get image from state or fallback to a placeholder
  const getImg = (key) => images[key] || `https://placehold.co/800x600?text=${key}`;
 const timeline = [
    {
      year: "2015",
      title: "Global Beginnings: Overseas Consulting",
      description: "Bluestone launched its flagship overseas consultancy, dedicated to bridging the gap between local talent and global education opportunities.",
      image: getImg("ias3.png") 
    },
    {
      year: "2016",
      title: "The Language Hub",
      description: "Recognizing communication as a barrier, we established the Language Hub to provide expert training in IELTS, OET, and international languages.",
      image: getImg("start.png")
    },
    {
      year: "2024",
      title: "Elite Sports Academy",
      description: "Diversifying into physical excellence, Bluestone Elite Sports was founded to nurture professional athletes and foster a culture of fitness.",
      image: getImg("sport1.JPG")
    },
    {
      year: "2025",
      title: "Bluestone IAS Academy",
      description: "We took a massive step into civil services coaching, bringing together top-tier mentors to train the next generation of administrators.",
      image: getImg("ias1.png")
    },
    {
      year: "2026",
      title: "Preschool & Tech Park Launch",
      description: "A landmark year: Launching our International Preschool for early childhood and the Bluestone Tech Park to drive industrial innovation.",
      image: getImg("scl1.jpg")
    },
  ];


  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <section className="bg-white text-black">
      {/* LEADERSHIP SECTION */}
      <div className="bg-gradient-to-br from-red-600 via-black to-red-600 py-28">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="text-white font-black tracking-widest uppercase text-sm">Our Legacy</span>
            <h2 className="text-5xl md:text-7xl font-black text-white mt-2">About <span className="text-red-600">Bluestone</span></h2>
          </motion.div>

          {/* MD Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-14 items-center">
            <div className="flex justify-center">
              <div className="relative group">
                <img 
                  src={getImg("MD.jpeg")} 
                  alt="MD.jpeg" 
                  className="w-80 h-96 object-cover rounded-3xl border-4 border-white shadow-2xl transition-transform group-hover:scale-105"
                  onError={(e) => { e.target.src = "https://placehold.co/400x500?text=MD+Photo"; }}
                />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 text-nowrap rounded-full text-sm font-bold shadow-xl">Managing Director</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <h2 className="text-3xl font-black text-white mb-4">Mr. Kumaresan Thangavel</h2>
              <p className="text-white/80 leading-relaxed mb-4">

                Mr. Kumaresan Thangavel is a dynamic visionary and

                transformative leader, dedicated to shaping the future of young

                minds and propelling them toward prosperity and success. With

                over a decade of impactful leadership at Bluestone Overseas

                Consultants, he has been the driving force guiding countless

                students to realize their global education and career

                aspirations with integrity, excellence, and personalized care.

                He continues to ignite change and build futures, blending the

                best of education, inspiration, and human values.{" "}

              </p>

              <p className="text-white/70 leading-relaxed">

                A transformative leader with over a decade of experience, Mr.

                Thangavel has been the catalyst for countless success stories in

                global education and professional growth.{" "}

              </p>           
            </div>
          </motion.div>

          {/* GM Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-14 items-center">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 md:order-1 order-2">
              <h2 className="text-3xl font-black text-white mb-4">Mr. Sadanandan</h2>
             <p className="text-white/70 leading-relaxed mb-4">

                With an illustrious career spanning over four decades in the

                Central Government, he brings a wealth of administrative,

                leadership, and strategic experience. His professional journey

                includes 20 years of distinguished service in the Indian Air

                Force, where he developed strong competencies in discipline,

                operations management, and organizational leadership. This was

                followed by another 20 years with the Ministry of Statistics,

                Government of India, where he played a key role in data-driven

                governance, policy support, and institutional management.{" "}

              </p>

              <p className="text-white/70 leading-relaxed">

                His extensive experience in government service, combined with

                his ability to manage complex organizations, has significantly

                contributed to strengthening systems, improving efficiency, and

                fostering a culture of professionalism and accountability within

                the institution.{" "}

              </p>         
            </div>
            <div className="flex justify-center md:order-2 order-1">
              <div className="relative group">
                <img 
                  src={getImg("sadha.jpeg")} 
                  alt="GM" 
                  className="w-80 h-96 object-cover rounded-3xl border-4 border-white shadow-2xl transition-transform group-hover:scale-105" 
                  onError={(e) => { e.target.src = "https://placehold.co/400x500?text=GM+Photo"; }}
                />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-nowrap px-6 py-2 rounded-full text-sm font-bold shadow-xl">General Manager</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* TIMELINE SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-28">
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-[1px] bg-slate-200 -translate-x-1/2" />
          <div className="space-y-40">
            {timeline.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-10 md:gap-20 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-white border-4 border-red-600 rounded-full items-center justify-center z-10 shadow-xl">
                  <span className="font-black text-sm text-gray-900">{item.year}</span>
                </div>
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pl-10" : "md:pr-10 md:text-right"}`}>
                  <h3 className="text-3xl font-black text-slate-900">{item.title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed pt-2">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}