"use client";

import React, { useState, useEffect } from 'react';
import { 
  Award, Users, Globe, TrendingUp, Target, Eye, 
  Compass, Sparkles, Shield, Rocket, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from "../../apiConfig";

export function AboutPage() {
  const [media, setMedia] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutMedia = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/media?category=about_us`);
        const data = await response.json();
        const finalData = Array.isArray(data) ? data : data.data || [];

        const mappedMedia = {};
        finalData.forEach(item => {
          const key = item.alt_text?.trim();
          if (key) {
            // LOGIC CHECK: If it's a Base64 string, use it directly. 
            // Otherwise, append the API URL and a timestamp.
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
        console.error("Error fetching about_us media:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutMedia();
  }, []);

  // Helper to get image or placeholder
  const getImg = (key) => media[key] || "https://placehold.co/800x600?text=Upload+In+Admin";

  const values = [
    { name: 'Integrity', icon: Shield, desc: 'Doing the right thing, always.' },
    { name: 'Innovation', icon: Rocket, desc: 'Challenging the status quo.' },
    { name: 'Excellence', icon: Sparkles, desc: 'Uncompromising quality standards.' },
    { name: 'Sustainability', icon: Globe, desc: 'Building for the next generation.' },
    { name: 'Collaboration', icon: Users, desc: 'Powering progress through unity.' },
  ];

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
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-white via-red-50/30 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                About Bluestone
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-900 to-red-800 bg-clip-text text-transparent mb-6">
                A Legacy of Excellence and Innovation
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded with a vision to create lasting value, Bluestone Group Of Institutions has grown into a diversified business conglomerate.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl relative group border-4 border-white">
                <img
                  src={getImg("bluestone.png")}
                  alt="Bluestone Logo"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="bg-gradient-to-br from-red-600 via-black to-red-600 py-28 text-white">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {/* MD */}
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <img src={getImg("MD.jpeg")} className="w-80 h-96 object-cover rounded-3xl border-4 border-white shadow-2xl" alt="MD" />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 px-6 py-2 text-nowrap rounded-full text-sm font-bold shadow-xl">Managing Director</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-4">Mr. Kumaresan Thangavel</h2>
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

              </p>                       </div>
          </div>

          {/* GM */}
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="md:order-1 order-2">
              <h2 className="text-3xl font-black mb-4">Mr. Sadanandan</h2>
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

              </p>                 </div>
            <div className="flex justify-center md:order-2 order-1">
              <div className="relative">
                <img src={getImg("sadha.jpeg")} className="w-80 h-96 object-cover rounded-3xl border-4 border-white shadow-2xl" alt="GM" />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-nowrap px-6 py-2 rounded-full text-sm font-bold shadow-xl">General Manager</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evolution Timeline */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <h2 className="text-5xl md:text-7xl font-black text-center mb-32">Evolution <span className="text-red-600">Timeline</span></h2>
        <div className="space-y-40 relative">
          {timeline.map((item, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-10 md:gap-20 ${index % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
              <div className="w-full md:w-1/2">
                <img 
                   src={item.image} 
                   className="aspect-video rounded-[2.5rem] object-cover shadow-2xl border-4 border-white" 
                   alt={item.title} 
                   onError={(e) => { e.target.src = "https://placehold.co/800x600?text=Image+Missing"; }}
                />
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-3xl font-black text-red-600 mb-2">{item.year}</h3>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="text-gray-500 text-lg mt-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}