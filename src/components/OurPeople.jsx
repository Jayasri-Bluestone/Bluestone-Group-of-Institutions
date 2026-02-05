import { useRef } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import Slider from "react-slick";
import { motion } from "framer-motion";

// --- 1. IMPORT TEAM IMAGES ---
import neenaImg from "../assets/Neena.jpeg";
import tamilImg from "../assets/Tamil.jpeg";
import dharaniImg from "../assets/Dharani.jpeg";
import saravananImg from "../assets/saravanan.jpeg";
import maniImg from "../assets/ocs5.png";
import divitImg from "../assets/Divit.jpg";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function OurPeople() {
  const sliderRef = useRef(null);

  const team = [
    {
      name: "Mrs. Neena Priya",
      position: "Bluestone Overseas Co-ordinator",
      image: neenaImg, // Use variable
      bio: "Expert in international relations and global mobility, streamlining cross-border transitions for students and professionals.",
    },
    {
      name: "Mr. Tamil Selvan",
      position: "Bluestone IAS Academy Co-ordinator",
      image: tamilImg,
      bio: "Dedicated educator specializing in civil service curriculum design and competitive examination strategy.",
    },
    {
      name: "Mr. Dharani Kumaresan",
      position: "Corresponded of Bluestone International Preschool",
      image: dharaniImg,
      bio: "Specialist in early childhood development, implementing world-class Montessori and play-based learning frameworks.",
    },
    {
      name: "Mr. Saravanan",
      position: "Bluestone Placement Co-ordinator",
      image: saravananImg,
      bio: "Bridging the gap between talent and industry through strategic corporate partnerships and career coaching.",
    },
    {
      name: "Mr. Mani",
      position: "Bluestone Tech-Park Co-ordinator",
      image: maniImg,
      bio: "Managing high-tech workspace infrastructure and fostering an ecosystem for startups and digital innovation.",
    },
    {
      name: "Mr. Divit",
      position: "Elite Sports Co-ordinator",
      image: divitImg,
      bio: "Driving athletic excellence through specialized training programs and professional sports management.",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="py-20 bg-gradient-to-br from-red-500 via-black to-red-500 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-white font-black tracking-widest uppercase text-sm">Our people</span>
          <h2 className="text-5xl md:text-7xl font-black text-white mt-2">
            Meet Our <span className="text-red-600">Leadership Team</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto mt-6">
            Passionate leaders shaping the future of Bluestone.
          </p>
        </motion.div>

        {/* SLIDER */}
        <div className="relative">
          <button
            onClick={() => sliderRef.current?.slickPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => sliderRef.current?.slickNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <ChevronRight />
          </button>

          <Slider ref={sliderRef} {...settings}>
            {team.map((member, index) => (
              <div key={index} className="px-4">
                <motion.div
                  whileHover={{ scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-lg"
                >
                  {/* IMAGE */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="relative h-80 overflow-hidden"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* CONTENT */}
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold text-red-600 mb-2">
                      {member.position}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style jsx>{`
        :global(.slick-dots) {
          bottom: -45px;
        }
        :global(.slick-dots li button:before) {
          color: white;
          font-size: 10px;
        }
        :global(.slick-dots li.slick-active button:before) {
          color: #ef4444;
        }
      `}</style>
    </section>
  );
}