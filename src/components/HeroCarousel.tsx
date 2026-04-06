import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';
import hero3 from '../assets/hero3.png';

const slides = [
  { id: 1, img: hero1 },
  { id: 2, img: hero2 },
  { id: 3, img: hero3 },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "linear" }}
            className="w-full h-full relative"
          >
            <img
              src={slides[current].img}
              alt="Nova Deco Hero"
              className="w-full h-full object-cover block"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10 pointer-events-none">
        <motion.div
          key={`text-${current}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.2 }}
          className="max-w-4xl"
        >
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
            NOVA DECO
          </h1>
          <p className="text-white/80 text-xl md:text-2xl mb-12 font-light uppercase tracking-[0.4em] drop-shadow-lg">
            Excellence & Design
          </p>

          <a
            href="#content"
            className="inline-block bg-white text-black px-12 py-4 text-sm font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 pointer-events-auto shadow-2xl transform hover:scale-105 active:scale-95"
          >
            Découvrir
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 transition-all duration-500 rounded-full shadow-lg ${i === current ? 'bg-white w-12' : 'bg-white/30 w-3 hover:bg-white/60'
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-[5]" />
    </div>
  );
}
