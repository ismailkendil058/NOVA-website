import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { bg: 'linear-gradient(135deg, hsl(0 0% 10%), hsl(0 0% 20%))' },
  { bg: 'linear-gradient(135deg, hsl(0 0% 15%), hsl(0 0% 5%))' },
  { bg: 'linear-gradient(135deg, hsl(150 30% 10%), hsl(0 0% 8%))' },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
          style={{ background: slides[current].bg }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-black tracking-wider text-white mb-2"
        >
          NOVA DECO
        </motion.h1>
        <p className="text-white/70 text-lg mb-8 font-light" dir="rtl">
          ديكور راقٍ لمنزلك
        </p>
        <a
          href="#content"
          className="bg-primary text-primary-foreground px-10 py-3 text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Découvrir
        </a>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 transition-all ${i === current ? 'bg-primary w-6' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
