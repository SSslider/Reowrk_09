import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-24 pb-8 rounded-t-[3rem] mx-2 md:mx-4 mt-4 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 mb-24">
          {/* Left Column (Right in RTL): Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8">
              Let's<br /> talk
            </h2>
            <div className="w-12 h-1 bg-white mb-8"></div>
            <p className="text-neutral-400 max-w-md mb-12">
              נחזור אליכם תוך 24 שעות לדון בפרטי הפרויקט. לאחר השיחה, נספק לכם תוכנית מפורטת ולוחות זמנים.
            </p>

            {/* Team Card Small */}
            <div className="bg-neutral-900 rounded-2xl p-4 flex items-center gap-4 max-w-xs border border-neutral-800">
              <img src="https://picsum.photos/60/60?random=20" alt="Arsen" className="w-12 h-12 rounded-full" />
              <div>
                <div className="text-xs text-neutral-500">Chief Officer</div>
                <div className="font-bold">Arsen</div>
              </div>
              <button className="mr-auto bg-neutral-800 text-xs px-3 py-1 rounded-full flex items-center gap-1 hover:bg-neutral-700 transition-colors">
                פנו ישירות <ArrowUpRight size={10} />
              </button>
            </div>
          </motion.div>

          {/* Right Column (Left in RTL): Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white text-black rounded-[2rem] p-8 md:p-12"
          >
            <h3 className="text-2xl font-bold mb-1">יש לכם פרויקט בראש?</h3>
            <p className="text-sm text-neutral-500 mb-8">איך נוכל ליצור איתכם קשר?</p>

            <form className="space-y-4">
              <input type="text" placeholder="שם מלא" className="w-full bg-neutral-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black/10 transition-all" />
              <input type="email" placeholder="אימייל" className="w-full bg-neutral-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black/10 transition-all" />
              <textarea placeholder="הודעה" rows={4} className="w-full bg-neutral-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black/10 resize-none transition-all"></textarea>

              <Button variant="primary" className="w-full justify-center">
                שלח הודעה
              </Button>
            </form>
            <p className="text-[10px] text-neutral-400 mt-4 text-center">
              בלחיצה על שלח אתם מסכימים למדיניות הפרטיות שלנו.
            </p>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-500">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Dribbble</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <span>© 2024 REWORK. כל הזכויות שמורות.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">מדיניות פרטיות</a>
              <a href="#" className="hover:text-white">קובצי Cookie</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;