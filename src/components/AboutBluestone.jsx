"use client";

import { motion } from "framer-motion";

export default function AboutBluestone() {
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

  return (
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
  );
}