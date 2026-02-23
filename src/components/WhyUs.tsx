import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  number: string;
  suffix?: string;
  title: string;
  description: string;
  footerContent?: React.ReactNode;
  delay?: number;
}

interface UserAvatar {
  src: string;
  alt: string;
}

const users: UserAvatar[] = [
  {
    src: "https://framerusercontent.com/images/6At2kpZI4VyWbY6eqzyeXgxnBJ8.webp?width=80&height=80",
    alt: "Brano Ruscak"
  },
  {
    src: "https://framerusercontent.com/images/hPjGLFXthYjOphDmjbqi6jHSE.png?width=100&height=100",
    alt: "Torstein Gustavsen"
  },
  {
    src: "https://framerusercontent.com/images/EMeqpjkmg2PZ8c5Rs3HMycpXY.png?width=100&height=100",
    alt: "Vishrut Malhotra"
  },
  {
    src: "https://framerusercontent.com/images/7rTd7Qfinig0mDpK8HDrKgiA7L4.webp?width=80&height=80",
    alt: "Alex Chieng"
  }
];

const StatCard = ({
  number,
  suffix,
  title,
  description,
  footerContent,
  delay = 0
}: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true }} 
    transition={{ duration: 0.6, delay }} 
    className="flex flex-col flex-1 min-w-[280px] h-full bg-white rounded-[25px] overflow-hidden shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
  >
    <div className="p-8 flex flex-col gap-5 flex-grow">
      <div className="flex items-baseline text-[45px] font-semibold tracking-tighter text-[#0A0A0A]">
        <span>{number}</span>
        {suffix && <span className="text-[#0A0A0A] mr-1">{suffix}</span>}
      </div>
      <p className="text-[18px] font-medium leading-[1.3] text-[#0A0A0A] max-w-[240px]">
        {title}
      </p>
    </div>
    
    <div className="px-8 pb-8 pt-0 flex flex-col justify-end min-h-[140px]">
      <div className="text-[16px] font-medium leading-[1.4] text-[#0A0A0A]/60 mb-8">
        {description}
      </div>
      {footerContent && (
        <div className="mt-auto">
          {footerContent}
        </div>
      )}
    </div>
  </motion.div>
);

const UserStack = () => (
  <div className="flex items-center">
    <div className="flex -space-x-4 space-x-reverse">
      {users.map((user, i) => (
        <div 
          key={i} 
          className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-neutral-100" 
          style={{ zIndex: 10 - i }}
        >
          <img src={user.src} alt={user.alt} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="relative w-10 h-10 rounded-full border-2 border-white bg-black flex items-center justify-center text-white text-[11px] font-semibold z-0">
        17+
      </div>
    </div>
  </div>
);

const UpworkLogo = () => (
  <div className="w-10 h-10 flex items-center justify-center rounded-lg">
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <path fill="#4EA52F" d="M 13.161 1.918 C 14.981 0.868 15.891 0.342 16.859 0.136 C 17.715 -0.045 18.6 -0.045 19.456 0.136 C 20.423 0.342 21.333 0.868 23.153 1.918 L 31.318 6.632 C 33.138 7.683 34.048 8.209 34.71 8.944 C 35.296 9.595 35.738 10.361 36.009 11.193 C 36.314 12.133 36.314 13.184 36.314 15.286 L 36.314 24.714 C 36.314 26.816 36.314 27.866 36.009 28.807 C 35.738 29.64 35.296 30.407 34.71 31.057 C 34.048 31.791 33.138 32.317 31.318 33.367 L 23.153 38.082 C 21.333 39.132 20.423 39.658 19.456 39.864 C 18.6 40.047 17.715 40.047 16.859 39.864 C 15.891 39.658 14.981 39.132 13.161 38.082 L 4.996 33.368 C 3.176 32.317 2.266 31.791 1.604 31.056 C 1.019 30.406 0.576 29.64 0.306 28.807 C 0 27.867 0 26.816 0 24.714 L 0 15.286 C 0 13.184 0 12.134 0.306 11.193 C 0.576 10.361 1.018 9.594 1.604 8.943 C 2.266 8.209 3.176 7.683 4.996 6.633 Z" />
      <path fill="#EDF6EA" d="M 24.94 22.36 C 23.873 22.36 22.874 21.907 21.965 21.172 L 22.186 20.132 L 22.196 20.094 C 22.394 18.987 23.018 17.129 24.94 17.129 C 26.384 17.132 27.553 18.303 27.554 19.747 C 27.548 21.188 26.381 22.355 24.94 22.36 Z M 24.94 14.477 C 22.485 14.477 20.58 16.076 19.807 18.703 C 18.625 16.927 17.731 14.795 17.207 13 L 14.565 13 L 14.565 19.886 C 14.563 21.245 13.463 22.346 12.104 22.349 C 10.746 22.346 9.646 21.244 9.644 19.886 L 9.644 13 L 7 13 L 7 19.886 C 6.99 22.706 9.283 25.021 12.1 25.021 C 14.915 25.021 17.208 22.706 17.208 19.886 L 17.208 18.73 C 17.722 19.802 18.352 20.885 19.116 21.848 L 17.496 29.47 L 20.203 29.47 L 21.376 23.942 C 22.404 24.601 23.586 25.014 24.942 25.014 C 27.841 25.014 30.2 22.637 30.2 19.735 C 30.194 16.833 27.842 14.482 24.94 14.476 Z" />
    </svg>
  </div>
);

const WhyUs: React.FC = () => {
  return (
    <div className="w-full bg-[#F5F5F7] py-20 px-4 md:px-10 font-sans text-neutral-900 rounded-[3rem] mx-2 md:mx-4 my-4">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Right Column (Video) - In RTL grid, this is the first child (Starts on Right) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8 }} 
          className="relative lg:col-span-1 h-[500px] lg:h-[670px] bg-neutral-200 rounded-[25px] overflow-hidden group shadow-lg"
        >
          <video 
            src="https://framerusercontent.com/assets/sZBsDHohN5mbY2Z9rDMpE8P3U.mp4" 
            loop 
            muted 
            autoPlay 
            playsInline 
            poster="https://framerusercontent.com/images/JpIkFpbJurAHb9VFNqzceHxUsE.webp?width=950&height=1714" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </motion.div>

        {/* Left Content Area (Columns 2-4) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-8 py-2">
          {/* Headline Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }} 
            className="w-full"
          >
            <h2 className="text-[32px] md:text-[40px] font-medium leading-[1.1] text-[#0A0A0A] max-w-[800px] tracking-tight">
              ממשקים קלים לשימוש, פיתוח חלק ורושם מתמשך שגורמים למשתמשים שלכם לחזור שוב ושוב.
            </h2>
          </motion.div>

          {/* Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Card 1: Projects */}
            <StatCard 
              number="600" 
              suffix="+" 
              title="פרויקטים מוצלחים שהושלמו" 
              description="עזרנו להשיק למעלה מ-600 מוצרים דיגיטליים וחוויות שגורמות למותגים לבלוט ולהרגיש אנושיים." 
              delay={0.1} 
            />

            {/* Card 2: Rating */}
            <StatCard 
              number="100" 
              suffix="%" 
              title="דירוג UpWork" 
              description="המחויבות שלנו לאיכות זיכתה אותנו במוניטין מושלם בפלטפורמות גלובליות." 
              delay={0.2} 
              footerContent={
                <div className="flex items-center justify-between w-full pt-4">
                  <UpworkLogo />
                  <UserStack />
                </div>
              } 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUs;