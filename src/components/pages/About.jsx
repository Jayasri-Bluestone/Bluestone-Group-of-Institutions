"use client";

import React from 'react';
import { 
  Award, Users, Globe, TrendingUp, Target, Eye, 
  Compass, Sparkles, Shield, Rocket, Heart 
} from 'lucide-react';
import { motion } from 'framer-motion';


export function AboutPage() {
  const stats = [
    { icon: Award, value: '25+', label: 'Years of Excellence', color: 'from-red-500 to-rose-600' },
    { icon: Users, value: '500+', label: 'Dedicated Team Members', color: 'from-rose-500 to-pink-600' },
    { icon: Globe, value: '15+', label: 'Countries Worldwide', color: 'from-red-600 to-red-700' },
    { icon: TrendingUp, value: '$2B+', label: 'Annual Revenue', color: 'from-rose-600 to-red-700' },
  ];

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
      description:
        "Bluestone launched its flagship overseas consultancy, dedicated to bridging the gap between local talent and global education opportunities.",
      image: "./src/assets/ocs.png" // Replace with local path
    },
    {
      year: "2016",
      title: "The Language Hub",
      description:
        "Recognizing communication as a barrier, we established the Language Hub to provide expert training in IELTS, OET, and international languages.",
      image: "./src/assets/ocs3.png"
    },
    {
      year: "2024",
      title: "Elite Sports Academy",
      description:
        "Diversifying into physical excellence, Bluestone Elite Sports was founded to nurture professional athletes and foster a culture of fitness.",
      image: "./src/assets/sport1.JPG"
    },
    {
      year: "2025",
      title: "Bluestone IAS Academy",
      description:
        "We took a massive step into civil services coaching, bringing together top-tier mentors to train the next generation of administrators.",
      image: "./src/assets/ias1.png"
    },
    {
      year: "2026",
      title: "Preschool & Tech Park Launch",
      description:
        "A landmark year: Launching our International Preschool for early childhood and the Bluestone Tech Park to drive industrial innovation.",
      image: "./src/assets/scl1.jpg"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
  
    <main className="pt-16">
      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-20 bg-gradient-to-b from-white via-red-50/30 to-white relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-red-200/30 to-rose-200/30 rounded-full filter blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                About Bluestone
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-900 to-red-800 bg-clip-text text-transparent mb-6">
                A Legacy of Excellence and Innovation
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded with a vision to create lasting value, Bluestone Groups has grown into a diversified business conglomerate with a strong presence across multiple industries. 
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe in building sustainable businesses that not only generate profits but also contribute positively to society. Our diverse portfolio spans technology, real estate, healthcare, and manufacturing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl relative group">
                <img
                  src="./src/assets/bluestone.png"
                  alt="Business Partnership"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl -z-10 animate-pulse"></div>
            </motion.div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="text-center relative group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl mb-4 shadow-lg`}>
                  <stat.icon className="text-white" size={32} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- VISION & MISSION SECTION --- */}
      <section id="vision" className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.15)_0%,transparent_50%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 backdrop-blur-md text-red-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-red-500/30">
              <Sparkles size={14} />
              <span>Our Foundation</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Built on <span className="text-red-500">Purpose</span>,<br />Driven by <span className="text-rose-400">Values</span>.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-24">
            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800"
            >
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-8">
                <Eye className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">The Vision</h3>
              <p className="text-slate-400 leading-relaxed italic">
                "To be a globally recognized conglomerate that sets industry benchmarks through innovation, sustainability, and unwavering commitment to excellence."
              </p>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 bg-gradient-to-br from-red-600 to-rose-700 rounded-[2.5rem] shadow-2xl"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8">
                <Target className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">The Mission</h3>
              <p className="text-red-50 leading-relaxed font-medium">
                "To create sustainable value for all stakeholders through strategic business operations, foster innovation, and contribute positively to communities."
              </p>
            </motion.div>

            {/* Compass Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800"
            >
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mb-8">
                <Compass className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">The Compass</h3>
              <p className="text-slate-400 leading-relaxed">
                Our values guide every decision. We prioritize long-term impact over short-term gains, ensuring trust and excellence in every relationship.
              </p>
            </motion.div>
          </div>

          {/* Values Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-600 transition-all duration-300">
                  <v.icon size={24} className="text-slate-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-white mb-1">{v.name}</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
          <section className="bg-white text-black">

          {/* ================= LEADERSHIP SECTION ================= */}
      <div className="bg-gradient-to-br from-red-600 via-black to-red-600 py-28">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {/* MD Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-14 items-center"
          >
            <div className="flex justify-center">
              <div className="relative group">
                <img
                  src="./src/assets/MD.jpeg"
                  alt="Managing Director"
                  className="w-80 h-96 object-cover rounded-3xl border-4 border-white shadow-2xl transition-transform group-hover:scale-105"
                />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 text-nowrap rounded-full text-sm font-bold shadow-xl">
                  Managing Director
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <h2 className="text-3xl font-black text-white mb-4">
                Mr. Kumaresan Thangavel
              </h2>
              <p className="text-white/80 leading-relaxed mb-4">
                 Mr. Kumaresan Thangavel is a dynamic visionary and transformative leader, dedicated to shaping the future of young minds and propelling them toward prosperity and success. With over a decade of impactful leadership at Bluestone Overseas Consultants, he has been the driving force guiding countless students to realize their global education and career aspirations with integrity, excellence, and personalized care. He continues to ignite change and build futures, blending the best of education, inspiration, and human values.
              </p>
              <p className="text-white/70 leading-relaxed">
                A transformative leader with over a decade of experience, Mr. Thangavel has been the catalyst for countless success stories in global education and professional growth.
              </p>
            </div>
          </motion.div>

          {/* GM Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-14 items-center"
          >
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 md:order-1 order-2">
              <h2 className="text-3xl font-black text-white mb-4">
                Mr. Sadanandan
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                As the General Manager of Bluestone Groups, Mr. Sadhanandhan serves as the strategic architect behind our multi-sector operations. With a sharp focus on organizational scaling and operational integrity, he ensures that the vision of Bluestone is translated into consistent, high-quality results across every vertical—from early childhood education to technology innovation.
              </p>
              <p className="text-white/70 leading-relaxed">
               His leadership is defined by a "people-first" philosophy, fostering a collaborative ecosystem where talent thrives and institutional goals are met with precision. By bridging the gap between high-level strategy and day-to-day execution, he maintains Bluestone’s reputation as a leader in global standards and ethical enterprise.              </p>
            </div>

            <div className="flex justify-center md:order-2 order-1">
              <div className="relative group">
                <img
                  src="./src/assets/sadha.jpeg"
                  alt="General Manager"
                  className="w-80 h-96 object-cover rounded-3xl border-4 border-white shadow-2xl transition-transform group-hover:scale-105"
                />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-nowrap px-6 py-2 rounded-full text-sm font-bold shadow-xl">
                  General Manager
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================= TIMELINE SECTION ================= */}
     <div className="max-w-7xl mx-auto px-6 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-32"
        >
          <span className="text-red-600 font-black tracking-widest uppercase text-sm">Our Legacy</span>
          <h2 className="text-5xl md:text-7xl font-black mt-2">Evolution <span className="text-red-600">Timeline</span></h2>
        </motion.div>

        <div className="relative">
          {/* Central Vertical Line */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-[1px] bg-slate-200 -translate-x-1/2" />

          <div className="space-y-40">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* IMAGE SIDE */}
                <div className="w-full md:w-1/2">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-video md:aspect-square lg:aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white"
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                    <div className="absolute bottom-6 left-6 md:hidden">
                      <span className="text-white font-black text-3xl italic">{item.year}</span>
                    </div>
                  </motion.div>
                </div>

                {/* CENTER YEAR BUBBLE */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-white border-4 border-red-600 rounded-full items-center justify-center z-10 shadow-xl">
                  <span className="font-black text-sm text-gray-900">{item.year}</span>
                </div>

                {/* TEXT SIDE */}
                <div className={`w-full md:w-1/2 space-y-4 ${index % 2 === 0 ? "md:pl-10" : "md:pr-10 md:text-right"}`}>
                  <span className="hidden md:block text-red-600 font-black text-6xl opacity-10 mb-2 leading-none">
                    {item.year}
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">
                    {item.title}
                  </h3>
                  <div className={`h-1 w-20 bg-red-600 rounded-full ${index % 2 === 0 ? "" : "md:ml-auto"}`} />
                  <p className="text-gray-500 text-lg leading-relaxed pt-2">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
     
          </main>
    
  );
}