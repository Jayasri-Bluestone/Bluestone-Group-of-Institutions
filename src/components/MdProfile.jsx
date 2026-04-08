import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Quote, MapPin, Phone, Mail, Globe, Users, GraduationCap, Briefcase, 
  Languages, Trophy, Cpu, Plus, Minus, Star, Award, Sparkles, Building2, 
  ArrowRight, ExternalLink, Calendar, CheckCircle2, History, Link as LinkIcon
} from 'lucide-react';

// BROCHURE IMAGERY
import MDImage from "../assets/MD.jpeg";
import BGIHead from "../assets/md gallery2.png";
import Logo from "../assets/logo.png";
import OCSImage from "../assets/ocs.png";
import IASImage from "../assets/ias1.png";
import mdgallery1 from "../assets/md gallery1.png";
import mdgallery2 from "../assets/md gallery2.png";
import mdgallery3 from "../assets/md gallery3.png";
import mdgallery5 from "../assets/md gallery5.png";
import mdgallery6 from "../assets/md gallery6.png";

import TechImage from "../assets/innovation.png";
import SchoolImage from "../assets/scl1.jpg";
import SportImage from "../assets/sport1.JPG";
import PlacementImage from "../assets/placement2.png";
import LangImage from "../assets/start.png";

// LOGO ASSETS
import LogoIAS from "../assets/IAS.png";
import LogoSports from "../assets/elite sports.png";
import LogoLang from "../assets/lang hub.png";
import LogoPlacements from "../assets/placement.png";
import LogoTech from "../assets/tech park.png";
import LogoOverseas from "../assets/overseas.png";
import LogoPreschool from "../assets/preschool.png";

const MdProfile = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const stats = [
    { label: "Success Stories", value: "10,000+", icon: Users },
    { label: "Countries", value: "25+", icon: Globe },
    { label: "Universities", value: "700+", icon: GraduationCap },
    { label: "Excellence", value: "10+ Years", icon: Award },
  ];

  const verticals = [
    { title: "Overseas Consultants", logo: LogoOverseas, url: "https://bluestoneoverseas.com" },
    { title: "IAS Academy", logo: LogoIAS, url: "https://bluestoneiasacademy.com" },
    { title: "Elite Sports", logo: LogoSports, url: "https://bluestoneelitesports.com" },
    { title: "Preschool", logo: LogoPreschool, url: "https://bluestoneinternationalpreschool.com" },
    { title: "Tech Park", logo: LogoTech, url: "https://bluestonetechpark.com" },
    { title: "Placements", logo: LogoPlacements, url: "https://bluestoneplacements.com" },
    { title: "Language Hub", logo: LogoLang, url: "https://bluestonelanguagehub.com" },
  ];

  const ecosystem = [
    {
      title: "Overseas Consultants",
      image: OCSImage,
      desc: "Top-tier visa & immigration consultancy since 2015, bridging the gap between local talent and global education.",
      icon: Globe,
      details: ["25+ Countries", "Expert Visa Processing", "700+ Partners"]
    },
    {
      title: "IAS Academy",
      image: IASImage,
      desc: "Transforming aspirants into distinguished civil servants through strategic preparation and expert mentorship.",
      icon: GraduationCap,
      details: ["UPSC / TNPSC", "Prelims & Mains", "Interview Guidance"]
    },
    {
      title: "Tech Park",
      image: TechImage,
      desc: "Premier Software Excellence Center bridging the gap with technical labs and global mentorship.",
      icon: Cpu,
      details: ["App Development", "AI & Automation", "Industrial IOT"]
    },
    {
      title: "International Preschool",
      image: SchoolImage,
      desc: "Child-centric early learning institution committed to nurturing young minds in an inclusive environment.",
      icon: Sparkles,
      details: ["Nestlers & Bambino", "Experiential Learning", "Franchise Options"]
    },
    {
      title: "Language Hub",
      image: LangImage,
      desc: "Leading training centre offering world-class language and test-prep programs.",
      icon: Languages,
      details: ["IELTS / TOEFL", "German & French", "Globally Aligned"]
    },
    {
      title: "Elite Sports",
      image: SportImage,
      desc: "Premier academy focused on identifying and nurturing young talent through modern facilities.",
      icon: Trophy,
      details: ["Cricket Training", "Silambam Coaching", "Yoga & Fitness"]
    },
    {
      title: "Placements",
      image: PlacementImage,
      desc: "Recruitment partner helping job seekers build careers and employers find skilled talent.",
      icon: Briefcase,
      details: ["Career Guidance", "Domestic & Overseas", "Hiring Solutions"]
    }
  ];

  const timeline = [
    { 
      year: "2015-17", 
      title: "THE GENESIS", 
      desc: "Inception of Bluestone Overseas Consultants in Race Course, Coimbatore, pioneering a personalized bridge between local ambition and global university access.",
      images: [OCSImage, MDImage, mdgallery5] 
    },
    { 
      year: "2018-19", 
      title: "GOVERNANCE & LEADERSHIP", 
      desc: "Launch of Bluestone IAS Academy, creating a high-performance environment for aspirants of the UPSC and TNPSC civil services.",
      images: [IASImage, mdgallery2, mdgallery1]
    },
    { 
      year: "2020-21", 
      title: "TECHNICAL HUB", 
      desc: "Establishment of the Software Excellence Center and Bluestone Tech Park, bridging the gap between classroom theory and industry production.",
      images: [TechImage, mdgallery3, BGIHead]
    },
    { 
      year: "2022-23", 
      title: "HOLISTIC ECOSYSTEM", 
      desc: "Integrated expansion into early childhood with International Preschool and athletic excellence with the Elite Sports Academy.",
      images: [SchoolImage, SportImage, mdgallery3]
    },
    { 
      year: "2024-26", 
      title: "A DECADE OF EXCELLENCE", 
      desc: "Celebrating 10 years of consistent institutional impact, now serving thousands across 7 multifaceted business verticals.",
      images: [mdgallery5, MDImage, mdgallery6]
    }
  ];

  const awards = [
    { 
      title: "Decade of Excellence", 
      org: "Institutional Summit 2024", 
      desc: "Celebrating 10 years of consistent leadership and impactful institutional transformation across multiple sectors.", 
      icon: Award,
      img: BGIHead 
    },
    { 
      title: "Visionary Leader Award", 
      org: "Asian Edu Forum", 
      desc: "Awarded for the unique model of merging academic preparation with cross-sector global opportunities.", 
      icon: Star,
      img: MDImage 
    },
    { 
      title: "Enterprise Innovation Hub", 
      org: "Digital Success Hub", 
      desc: "Special recognition for the MD's role in creating a technical bridge for aspirants to excel in industry world-ready roles.", 
      icon: Cpu,
      img: mdgallery5 
    },
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 overflow-x-hidden pt-16 font-sans">
      
      {/* Editorial Header */}
      <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden">
        <div className="max-w-9xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div style={{ opacity: opacityHero, scale: scaleHero }} className="lg:col-span-7 z-10">
            <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-6 py-2.5 bg-red-50 text-red-600 rounded-full border border-red-100 mb-8 font-black uppercase text-[10px] tracking-widest shadow-sm">
              <Award size={16} /> Founder Portfolio
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-5xl lg:text-7xl font-black leading-[0.8] tracking-tighter mb-12 uppercase italic">
              KUMARESAN <br /><span className="text-red-600">THANGAVEL</span>
            </motion.h1>
            <motion.p className="text-2xl text-slate-500 max-w-xl leading-relaxed mb-12 font-medium italic  decoration-red-100 decoration-8 -offset-10">
              Transforming institutional excellence and global education since 2015.
            </motion.p>
            <button className="h-16 px-12 bg-red-600 text-white font-black rounded-2xl hover:bg-black transition-all shadow-3xl shadow-red-600/30 uppercase text-xs tracking-widest flex items-center gap-3 group">
               VISIONARY LEADERSHIP <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>

          {/* Portrait Image */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-12 lg:absolute lg:right-[5%] lg:top-1/2 lg:-translate-y-1/2 lg:w-[42%] mt-20 lg:mt-0 z-0">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border-[1.5rem] border-slate-50 shadow-3xl bg-slate-100 group relative">
               <img src={MDImage} alt="Founder portrait" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
               <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-red-900/10 to-transparent"></div>
            </div>
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -top-12 -right-12 bg-white p-10 rounded-[3rem] shadow-3xl border border-slate-100 z-20 pointer-events-none">
               <div className="text-5xl font-black text-red-600 leading-none tracking-tighter italic">10+</div>
               <div className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-[0.3em]">Vertical Impact</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* VISIONARY OVERVIEW BIOGRAPHY */}
      <section className="py-40 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-2 gap-24 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                 <div className="aspect-square rounded-[4rem] overflow-hidden shadow-3xl transition-all duration-1000 border-8 border-white bg-white group">
                    <img src={BGIHead} alt="The Founder at BGI" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                 </div>
                 <div className="absolute -bottom-16 -right-16 bg-red-600 text-white p-14 rounded-full w-56 h-56 flex items-center justify-center text-center font-black text-xs uppercase z-20 border-8 border-white shadow-3xl shadow-red-600/30 tracking-[0.2em] leading-loose italic">
                    VISIONARY <br /> PERSPECTIVE
                 </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-12">
                 <div className="p-12 border-l-[12px] border-red-600 rounded-r-[3rem] shadow-2xl shadow-slate-200/50">
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-10 leading-[0.85] tracking-tighter uppercase italic">VISIONARY <br /><span className="text-red-600">OVERVIEW</span></h2>
                    <div className="space-y-8 text-slate-600 text-2xl leading-[1.6] font-medium italic opacity-90">
                       <p>
                         A dynamic visionary and transformative leader, dedicated to shaping the future of young minds and propelling them toward prosperity and success.
                       </p>
                       <p>
                         With over a decade of impactful leadership at <span className="text-red-600 font-black  decoration-red-100 decoration-[14px]">Bluestone Overseas Consultants</span>, Kumaresan Thangavel has been the driving force guiding thousands.
                       </p>
                       <p>
                         He ignited change and established a launchpad where innovation meets empathy, encouraging every learner to dream bigger.
                       </p>
                    </div>
                 </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* INTERACTIVE VERTICAL REDIRECTS */}
      <section className="py-24 bg-slate-900 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 opacity-50"></div>
        <div className="container mx-auto px-6">
           <div className="text-center mb-16 px-4">
              <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-4 opacity-50 italic">Global Institutional Hub</h3>
              <div className="w-16 h-1 bg-red-600 mx-auto"></div>
           </div>
           <div className="flex flex-wrap justify-center gap-10 lg:gap-16 items-center">
              {verticals.map((v, i) => (
                <motion.a 
                  key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -8 }}
                  className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 hover:border-red-600/40 hover:bg-white/10 transition-all group relative overflow-hidden"
                >
                   <img src={v.logo} alt={v.title} className="h-16 lg:h-20 w-auto object-contain opacity-70 transition-all duration-700" />
                   <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><LinkIcon size={12} /></div>
                </motion.a>
              ))}
           </div>
        </div>
      </section>

      {/* MULTI-IMAGE GALLERY HISTORY (ROADMAP) */}
      <section className="py-48 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-7xl mb-44 text-center">
             <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 text-red-600 rounded-full border border-red-100 mb-8 font-black uppercase text-[10px] tracking-widest">
                <History size={16} /> Decades of Excellence
             </div>
             <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.8] tracking-tighter uppercase mb-6 italic">THE <br /><span className="text-red-600">LEGACY</span> HISTORY</h2>
             <p className="text-slate-500 text-2xl font-semibold italic max-w-7xl px-2 opacity-80 decoration-red-600/10">A visual narrative of transformation and institutional expansion since 2015.</p>
          </div>

          <div className="space-y-80 relative">
             <div className="absolute top-0 left-0 lg:left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-100 hidden lg:block opacity-50" />
             
             {timeline.map((item, i) => (
               <div key={i} className={`flex flex-col lg:flex-row gap-20 items-start ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                  <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="lg:w-1/2 lg:sticky lg:top-40 space-y-12">
                     <div className="flex items-end gap-6 mb-12">
                        <span className="text-[8rem] font-black text-red-600 tracking-tighter leading-none italic opacity-10 select-none">{item.year.split('-')[0]}</span>
                        <div className="mb-10">
                        </div>
                     </div>
                     <h3 className="text-4xl lg:text-5xl font-black uppercase text-slate-900 tracking-tighter italic">{item.title}</h3>
                     <p className="text-2xl text-slate-500 italic font-semibold leading-relaxed  decoration-red-100 decoration-8 -offset-[12px] opacity-80">
                        {item.desc}
                     </p>
                  </motion.div>

                  <div className="lg:w-1/2 grid grid-cols-2 gap-8 lg:gap-12 relative">
                     {item.images.map((img, idx) => (
                       <motion.div 
                        key={idx} initial={{ opacity: 0, scale: 0.9, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }} viewport={{ once: true, margin: "-100px" }}
                        className={`rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white group relative ${idx % 3 === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}
                       >
                          <img src={img} alt="Leadership Moment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2.5s]" />
                          <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       </motion.div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL VERTICLES (ACCORDION) */}
      <section className="py-40 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-24">
             <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-[0.4em] mb-4">
                <Sparkles size={16} fill="currentColor" /> Premium Impact
             </div>
             <h2 className="text-5xl lg:text-6xl font-black text-slate-900 leading-none mb-6 italic tracking-tighter uppercase px-2">OUR <br /><span className="text-red-600">CORE</span> VERTICLES</h2>
          </div>

          <div className="max-w-6xl mx-auto space-y-5">
            {ecosystem.map((item, index) => (
              <div key={index} className={`border rounded-[3.5rem] overflow-hidden transition-all duration-500 ${activeIndex === index ? 'border-red-600 bg-white shadow-3xl shadow-red-600/10' : 'border-slate-100 bg-white hover:bg-red-100'}`}>
                <button onClick={() => setActiveIndex(activeIndex === index ? null : index)} className="w-full flex items-center justify-between p-10 text-left group">
                  <div className="flex items-center gap-8">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${activeIndex === index ? 'bg-red-600 text-white rotate-12' : 'bg-slate-50 text-red-600'}`}>
                      {React.createElement(item.icon, { size: 28 })}
                    </div>
                    <div>
                      <h3 className={`text-2xl lg:text-4xl font-black uppercase italic tracking-tighter ${activeIndex === index ? 'text-red-600' : 'text-red-500 opacity-90'}`}>{item.title}</h3>
                      <div className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-[0.2em] px-2 opacity-60">Strategic BGI Branch-0{index + 1}</div>
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeIndex === index ? 'bg-red-600 text-white rotate-180' : 'bg-slate-100 text-slate-400 shadow-sm border border-slate-50'}`}>
                    {activeIndex === index ? <Minus size={28} /> : <Plus size={28} />}
                  </div>
                </button>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5 }}>
                      <div className="p-12 lg:px-20 lg:pb-20 border-t border-slate-200/20">
                        <div className="grid lg:grid-cols-2 gap-24 items-center">
                           <div className="space-y-12">
                             <p className="text-xl lg:text-2xl text-slate-600 italic font-black leading-[1.3]  decoration-red-100 decoration-[14px] -offset-[16px]">
                               {item.desc}
                             </p>
                             <div className="grid sm:grid-cols-2 gap-6">
                                {item.details.map((detail, idx) => (
                                  <div key={idx} className="flex items-center gap-3 px-4 py-4 bg-slate-50 rounded-[2rem] border border-slate-100 text-[11px] font-black uppercase text-red-700 shadow-sm hover:scale-105 transition-transform duration-500 cursor-default">
                                     <CheckCircle2 size={18} /> {detail}
                                  </div>
                                ))}
                             </div>
                           </div>
                           <div className="rounded-[5rem] overflow-hidden shadow-3xl border-[12px] border-white relative group min-h-[200px]">
                              <img src={item.image} alt="BGI Institution" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                              <div className="absolute inset-0 bg-red-900/10 group-hover:opacity-0 transition-opacity"></div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: REWARDS AND RECOGNITION (ALTERNATING LAYOUT) */}
      <section className="py-48 bg-slate-900 border-y border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
           <div className="mb-32 text-center lg:text-left">
              <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                 <div className="h-px w-20 bg-red-600" />
                 <span className="text-red-500 font-black uppercase tracking-[0.5em] text-[10px]">A Legacy of Excellence</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-black text-white uppercase italic decoration-red-600 decoration-[12px] -offset-[16px] mb-8 tracking-tighter opacity-90">REWARDS AND <br /><span className="text-red-600">RECOGNITION</span></h2>
              <p className="text-slate-400 text-2xl font-semibold italic max-w-3xl opacity-60 mt-10">Celebrating a decade of consistent leadership and institutional excellence worldwide.</p>
           </div>

           <div className="space-y-24">
              {awards.map((award, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`bg-white/5 border border-white/10 rounded-[6rem] overflow-hidden hover:bg-white/10 transition-all group flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-stretch shadow-2xl`}
                >
                   {/* Part 1: Visual Anchor */}
                   <div className="lg:w-[38%] relative h-96 lg:h-auto overflow-hidden">
                      <img src={award.img} alt="Leadership Milestone" className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-105" />
                      <div className={`absolute inset-0 bg-gradient-to-t ${i % 2 === 0 ? 'lg:bg-gradient-to-r' : 'lg:bg-gradient-to-l'} from-red-900/40 via-transparent to-transparent`}></div>
                      <div className="absolute top-12 left-12 lg:left-auto lg:right-12 w-24 h-24 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center text-red-600 border border-white/10 shadow-3xl group-hover:scale-110 transition-transform">
                         {React.createElement(award.icon, { size: 40 })}
                      </div>
                   </div>
                   
                   {/* Part 2: Recognition Detail */}
                   <div className="lg:w-[62%] p-14 lg:p-24 flex flex-col justify-center">
                      <div className={`flex flex-col lg:flex-row lg:items-center ${i % 2 === 0 ? 'justify-between' : 'justify-between lg:flex-row-reverse'} gap-8 mb-12`}>
                         <h4 className="text-4xl lg:text-5xl font-black text-white uppercase italic group-hover:text-red-600 transition-colors tracking-tighter leading-none">{award.title}</h4>
                         <span className="text-red-600 font-black uppercase text-xs tracking-[0.4em] px-8 py-4 bg-red-600/10 rounded-full border border-red-600/20 shadow-2xl whitespace-nowrap">
                            {award.org}
                         </span>
                      </div>
                      <p className={`text-2xl lg:text-3xl text-slate-400 leading-[1.6] italic font-black opacity-80 ${i % 2 !== 0 ? 'lg:text-right' : ''}`}>
                         {award.desc}
                      </p>
                      <div className={`mt-14 pt-14 border-t border-white/5 flex items-center ${i % 2 !== 0 ? 'justify-end' : ''} gap-6`}>
                         {i % 2 !== 0 && <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Institutional Recognition Verified</span>}
                         <div className="w-12 h-1 bg-red-600 opacity-30 rounded-full" />
                         {i % 2 === 0 && <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Official Excellence Certification</span>}
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
        <div className="absolute -bottom-40 -left-40 w-[60rem] h-[60rem] bg-red-600/5 rounded-full blur-[140px] pointer-events-none" />
      </section>

      {/* Global Persistence Summary */}
      <section className="bg-slate-50 py-32 border-b border-slate-100">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12 text-center md:text-left">
           {stats.map((stat, i) => (
             <div key={i} className="group">
                <div className="text-red-600 text-6xl font-black italic tracking-tighter mb-4 group-hover:scale-110 transition-transform duration-500  decoration-slate-200 decoration-8 -offset-14 opacity-90">{stat.value}</div>
                <div className="text-[11px] font-black uppercase tracking-[0.8em] text-slate-400 pl-2">{stat.label}</div>
             </div>
           ))}
        </div>
      </section>

      {/* Global Touch Point Hub */}
      <section className="bg-white py-48">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-32">
             <div className="lg:w-1/3">
                <h3 className="text-5xl font-black mb-16 uppercase italic decoration-red-600 lg:decoration-[12px] tracking-widest leading-none">GLOBAL <br /><span className="text-red-600">TOUCH</span></h3>
                <div className="space-y-16">
                   <div className="flex gap-10 group cursor-default">
                      <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-2xl shadow-slate-200/50 rotate-12">
                         <MapPin size={32} />
                      </div>
                      <div className="pt-2">
                         <p className="font-black text-slate-900 uppercase text-xs mb-4 tracking-[0.5em] px-2 opacity-60">C.O.E Location</p>
                         <p className="text-slate-500 text-sm font-black leading-relaxed italic pr-12  decoration-red-100 decoration-4 -offset-4">Renaissance Terrace, 126 L, Race Course, Coimbatore, TN 641018</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="lg:w-2/3">
                <div className="bg-slate-900 rounded-[6rem] p-16 lg:p-24 text-white relative shadow-3xl overflow-hidden group border border-white/5">
                   <div className="flex justify-between items-center mb-20 px-4">
                      <h4 className="text-4xl font-black text-red-600 uppercase italic tracking-tighter shadow-sm">The Global Network Hub</h4>
                      <ExternalLink size={48} className="text-white opacity-20 group-hover:opacity-100 transition-all duration-700 rotate-45" />
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      {['Coimbatore', 'Chennai', 'Salem', 'Erode', 'Namakkal', 'Mumbai', 'Nepal', 'Canada'].map(loc => (
                        <div key={loc} className="flex items-center gap-4 px-8 py-8 bg-white/5 border border-white/5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all cursor-crosshair group/item shadow-xl">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-600 group-hover/item:scale-150 transition-transform"></div>
                           {loc}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Signature Legacy Footer */}
      <footer className="py-24 text-center bg-slate-50 border-t border-slate-100">
         <img src={Logo} alt="Institutional Master Logo" className="h-10 mx-auto opacity-30 mb-14" />
         <div className="flex flex-wrap gap-14 justify-center mb-16 text-[12px] font-black uppercase tracking-[0.6em] text-slate-400 italic">
            <a href="#" className="hover:text-red-600 transition-colors  decoration-transparent hover:decoration-red-600 decoration-4 -offset-8">THE VISION</a>
            <a href="#" className="hover:text-red-600 transition-colors  decoration-transparent hover:decoration-red-600 decoration-4 -offset-8">THE LEGACY</a>
            <a href="#" className="hover:text-red-600 transition-colors  decoration-transparent hover:decoration-red-600 decoration-4 -offset-8">CONNECT</a>
         </div>
         <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] italic leading-loose px-6">
            &copy; 2026 Bluestone Group of Institutions. ARCHITECTING EXCELLENCE WORLDWIDE.
         </div>
      </footer>
    </div>
  );
};

export default MdProfile;