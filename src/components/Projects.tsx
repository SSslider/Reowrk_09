import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Project {
  id: string;
  name: string;
  year: string;
  categories: string[];
  imageUrl: string;
  hoverImageUrl: string;
  link: string;
}

const PROJECTS: Project[] = [
  {
    id: 'payoneer',
    name: 'Payoneer',
    year: '2025',
    categories: ['עיצוב אתרים', 'אנימציה'],
    imageUrl: 'https://framerusercontent.com/images/GUbDcFIEEb7WZdlIuJ32Hr8LTmA.webp?width=1514&height=1142',
    hoverImageUrl: 'https://framerusercontent.com/images/m5PLXFH74W1WqgYOOIvYvd44ik.webp?width=1514&height=1142',
    link: '#'
  },
  {
    id: 'kazaswap',
    name: 'KazaSwap',
    year: '2024',
    categories: ['עיצוב פלטפורמות', 'עיצוב דפי נחיתה', 'פיתוח', 'זהות מותגית', 'אנימציה'],
    imageUrl: 'https://framerusercontent.com/images/S8bd5xR4VHO9WkbSZbfGbmiAd0Q.webp?width=3200&height=2400',
    hoverImageUrl: 'https://framerusercontent.com/images/G2IMjXfrdnEtvcAqCOcruIQZEvA.webp?width=2400&height=1800',
    link: '#'
  },
  {
    id: 'passion-finder',
    name: 'Passion Finder',
    year: '2023',
    categories: ['עיצוב אפליקציות', 'זהות מותגית', 'רשתות חברתיות', 'אנימציה', 'עיצוב אתרים'],
    imageUrl: 'https://framerusercontent.com/images/20qqrsaEWf7sswqrRj3D5yBKDg.webp?width=3200&height=2400',
    hoverImageUrl: 'https://framerusercontent.com/images/GXZiM0leRCebaqfhUhZQIn6gLQ.jpg?width=3200&height=2400',
    link: '#'
  },
  {
    id: 'linkmatch',
    name: 'LinkMatch',
    year: '2023-2024',
    categories: ['מחקר ואפיון', 'UX ו-Wireframes', 'עיצוב מוצר', 'פיתוח אתרים', 'וורדפרס'],
    imageUrl: 'https://framerusercontent.com/images/SScVyCDvGAjTwFpesl42oSKTcWA.webp?width=3200&height=2400',
    hoverImageUrl: 'https://framerusercontent.com/images/SiwPITaKWerRJxJ0xlusS0vyCQ.jpg?width=3200&height=2400',
    link: '#'
  },
  {
    id: 'xefag',
    name: 'Xefag',
    year: '2023',
    categories: ['עיצוב אתרים', 'אנימציה'],
    imageUrl: 'https://framerusercontent.com/images/FUH7qQwH5Qa7dJ6PmFoFGhUGO10.webp?width=3200&height=2400',
    hoverImageUrl: 'https://framerusercontent.com/images/MtMuuLRfuWCe4Q44OTbPBR63Aw.jpg?width=3200&height=2400',
    link: '#'
  },
  {
    id: 'vetsie',
    name: 'Vetsie',
    year: '2022',
    categories: ['עיצוב אתרים', 'אנימציה', 'פיתוח אתרים', 'זהות מותגית'],
    imageUrl: 'https://framerusercontent.com/images/WG7tDEjw2ky38s0rdepmJYIlCo.webp?width=3200&height=2400',
    hoverImageUrl: 'https://framerusercontent.com/images/F3pnw8xdta04bosZNeLjgu4Fc.webp?width=3200&height=2400',
    link: '#'
  }
];

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer overflow-hidden rounded-[18px] bg-white"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={project.link} className="block w-full h-full" onClick={e => e.preventDefault()}>
        <div className="flex items-center justify-between px-6 py-[18px] bg-white relative z-10">
          <div className="flex items-end gap-[18px] relative h-[24px]">
            <h3 className="text-[18px] font-semibold tracking-[-0.8px] leading-normal text-[#0A0A0A] transition-colors group-hover:text-white duration-300 pb-1">
              {project.name}
            </h3>

            {/* Categories Overlay - Adjusted positioning to ensure it stays within bounds */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute left-0 top-0 flex flex-col gap-1 pointer-events-none"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {project.categories.slice(0, 3).map((cat, idx) => (
                    <span key={idx} className="text-[14px] font-medium text-white whitespace-nowrap leading-tight drop-shadow-sm text-right">
                      {cat}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-[5px] opacity-60">
            <span className="text-[12px] font-medium text-[#090909] leading-[15.6px] tracking-[-0.4px] group-hover:text-white transition-colors duration-300">/</span>
            <span className="text-[12px] font-medium text-[#090909] leading-[15.6px] tracking-[-0.4px] group-hover:text-white transition-colors duration-300">{project.year}</span>
          </div>
        </div>

        <div className="relative aspect-[1.33492/1] overflow-hidden">
          {/* Main Image */}
          <motion.img
            src={project.imageUrl}
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            animate={{ scale: isHovered ? 1.06 : 1, opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          />
          {/* Hover Image */}
          <motion.img
            src={project.hoverImageUrl}
            alt={`${project.name} hover`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 1.15 }}
            transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          />
          {/* Dark Overlay on Hover for Header Area */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </a>
    </motion.div>
  );
};

const Projects: React.FC = () => {
  return (
    <section id="projects" className="w-full bg-[#FFFFFF] py-20 px-4 sm:px-8 md:px-12 lg:px-20 font-sans selection:bg-black selection:text-white">
      <div className="max-w-[1520px] mx-auto flex flex-col gap-[90px]">

        {/* Top Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          <div className="lg:col-span-1 pt-2">
            {/* Increased max-width to prevent Hebrew text clipping */}
            <p className="text-[16px] font-medium text-[#0A0A0A]/60 tracking-[-0.6px] leading-relaxed max-w-[200px] balance">
              פתרונות ייחודיים<br />שמייצרים לידים
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-[40px] md:text-[60px] font-semibold text-[#090909] tracking-[-2px] md:tracking-[-3.6px] leading-tight md:leading-[1.1] pb-2">
              <motion.span
                className="inline-block ml-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                פרויקטים
              </motion.span>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                נבחרים
              </motion.span>
            </h2>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-20">
          {PROJECTS.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Bottom All Projects Button */}
        <div className="flex justify-start">
          <motion.a
            href="#"
            className="group relative flex items-center justify-between w-auto min-w-[150px] bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-white rounded-[50px] px-4 py-2 transition-all duration-300 overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={e => e.preventDefault()}
          >
            <span className="text-[12px] font-semibold tracking-[-0.4px] ml-4 z-10 transition-transform duration-300 group-hover:-translate-y-8 absolute top-1/2 -translate-y-1/2 right-4">
              כל הפרויקטים
            </span>
            <span className="text-[12px] font-semibold tracking-[-0.4px] ml-4 z-10 translate-y-8 transition-transform duration-300 group-hover:translate-y-[-50%] absolute top-1/2 right-4">
              כל הפרויקטים
            </span>

            {/* Visual spacer to keep width correct because of absolute text */}
            <span className="text-[12px] font-semibold tracking-[-0.4px] ml-4 opacity-0 pointer-events-none">
              כל הפרויקטים
            </span>

            <div className="flex items-center gap-2 mr-auto">
              <div className="w-[18px] h-[8px] flex items-center justify-start">
                <div className="w-2 h-2 bg-white rounded-full transition-all duration-300 group-hover:w-full group-hover:h-full" />
              </div>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Projects;