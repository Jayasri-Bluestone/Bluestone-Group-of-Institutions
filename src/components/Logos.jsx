import { useRef } from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';


export function Logos() {
  const sliderRef = useRef(null);

  // Mock partner/client logos with placeholder designs
  const partners = [
    { name: 'A Client 1', color: 'from-blue-500 to-blue-600' },
    { name: 'B Client 2', color: 'from-green-500 to-green-600' },
    { name: 'C Client 3', color: 'from-red-500 to-red-600' },
    { name: 'D Client 4', color: 'from-orange-500 to-orange-600' },
    { name: 'E Client 5', color: 'from-yellow-500 to-yellow-600' },
    { name: 'F Client 6', color: 'from-purple-500 to-purple-600' },
    { name: 'G Client 7', color: 'from-indigo-500 to-indigo-600' },
    { name: 'H CLient 8', color: 'from-pink-500 to-pink-600' },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 3000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: 'linear',
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
        }
      }
    ]
  };

  return (
    <section className="py-20 bg-gradient-to-br from-red-500 via-black to-red-500 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-100/40 to-pink-100/40 rounded-full filter blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-white text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            Our Partners
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            We're proud to collaborate with world-class organizations that share our commitment to excellence.
          </p>
        </motion.div>

        {/* Infinite Scrolling Logos */}
        <div className="mb-16">
          <Slider ref={sliderRef} {...settings}>
            {partners.map((partner, index) => (
              <div key={index} className="px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex items-center justify-center p-8 bg-white rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${partner.color} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <span className="text-white font-bold text-2xl">
                        {partner.name.charAt(0)}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-700">
                      {partner.name}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 text-center"
        >
          {[
            { value: '15+', label: 'Global Partners', gradient: 'from-blue-600 to-cyan-600' },
            { value: '98%', label: 'Client Satisfaction', gradient: 'from-purple-600 to-pink-600' },
            { value: '200+', label: 'Successful Projects', gradient: 'from-orange-600 to-red-600' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                viewport={{ once: true }}
                className={`text-5xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
              >
                {stat.value}
              </motion.div>
              <p className="text-gray-600 text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        :global(.slick-track) {
          display: flex !important;
          align-items: center;
        }
        :global(.slick-slide) {
          height: inherit !important;
        }
        :global(.slick-slide > div) {
          height: 100%;
        }
      `}</style>
    </section>
  );
}
