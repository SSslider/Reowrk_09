import React from 'react';
import { ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import HeroEliteGlass from './HeroEliteGlass';

const Hero: React.FC = () => {
  return (
    <section className="bg-[#010103] text-white min-h-[100svh] flex flex-col relative overflow-hidden rounded-b-[3rem]">

      <HeroEliteGlass />

      <div className="relative z-10 flex-grow flex flex-col pointer-events-none">

        {/* 1. Services List — On Left Edge, Bigger, Tighter */}
        <div className="absolute top-36 left-10 md:left-24 z-20 pointer-events-auto mix-blend-difference">
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } }
            }}
            className="text-lg md:text-2xl font-bold space-y-2 text-neutral-300 leading-none tracking-tighter"
          >
            {['מיתוג מותאם אישית', 'עיצוב אתרים ואפליקציות', 'פיתוח', 'פתרונות תלת-ממד'].map((item, i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }
                }}
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div className="absolute top-28 right-6 md:right-12 pointer-events-auto z-10 flex flex-col items-end mix-blend-difference">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -40, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[15vw] font-black tracking-tighter leading-none text-white/50 blur-sm hover:text-white hover:blur-none transition-all duration-700 select-none relative group mix-blend-screen">
              REWORK
              <span className="absolute inset-0 bg-white/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full mix-blend-screen" />
            </h1>
          </motion.div>
        </div>

        {/* 2. Company Stats — Vertically Centered, Single Line, Bold White */}
        <div className="absolute inset-y-0 right-6 md:right-12 pointer-events-none flex flex-col justify-center items-end z-10 mix-blend-difference">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex flex-row-reverse gap-4 md:gap-6 text-sm md:text-xl font-bold text-white tracking-widest items-center uppercase"
          >
            <span>נוסד ב-2015</span>
            <span className="text-white/40 text-xs md:text-sm">◆</span>
            <span>10 אנשי צוות</span>
            <span className="text-white/40 text-xs md:text-sm">◆</span>
            <span>פועלים ב-3 מדינות</span>
          </motion.div>
        </div>

        {/* ── Bottom-Right hero copy ── */}
        <div className="absolute bottom-12 right-6 md:right-12 z-20 pointer-events-auto max-w-xl text-right rtl mix-blend-difference">

          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-end gap-3 mb-6"
          >
            <span className="h-[1px] w-12 bg-neutral-400" />
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-300 font-semibold">
              סטודיו לעיצוב ופיתוח · תל אביב
            </p>
          </motion.div>

          {/* Main hero headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight text-white mb-6"
          >
            אנחנו הופכים{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-neutral-300 to-neutral-500 italic font-medium pr-1">
              חזונות
            </span>
            <br />
            למציאויות דיגיטליות.
          </motion.h2>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-base md:text-xl text-neutral-400 font-light leading-relaxed mb-10 max-w-md ml-auto"
          >
            אנחנו שוברים מוסכמות, מאתגרים את הקיים ומביאים
            את העתיד אליכם — פיקסל אחר פיקסל.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-end"
          >
            <Button
              onClick={() => window.location.href = '/start-project'}
              variant="primary"
              className="rounded-full px-10 py-7 text-lg bg-white text-black hover:bg-neutral-200 transition-all font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center">
                בואו נבנה משהו
                <ArrowDownLeft className="mr-3 group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform duration-300" size={20} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;