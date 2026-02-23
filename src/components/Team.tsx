import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpLeft, Linkedin, Twitter } from 'lucide-react';
import ceoPng from '@/assets/team/ceo.png';
import leadDesignerJpg from '@/assets/team/lead-designer.jpg';

const teamMembers = [
  {
    name: 'אנטולי קיזוב',
    role: 'מנכ"ל ומייסד',
    image: ceoPng,
    bio: 'מוביל את החזון האסטרטגי עם 15 שנות ניסיון בדיגיטל. בנה מעל 120 מוצרים לחברות Fortune 500.',
  },
  {
    name: 'תומר הרץ',
    role: 'מעצב ראשי',
    image: leadDesignerJpg,
    bio: 'מעצב עטור פרסים עם תשוקה לטיפוגרפיה, מינימליזם ואנימציות שמרגישות חיות.',
  },
  {
    name: 'מיכאל רוס',
    role: 'סמנכ"ל טכנולוגיות',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1000&fit=crop&q=80',
    bio: 'אשף פול-סטאק וקוד פתוח. הופך כל עיצוב למציאות בזמן שיא.',
  },
  {
    name: 'דנה לוי',
    role: 'אסטרטגיה ומוצר',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1000&fit=crop&q=80',
    bio: 'מתרגמת צרכי משתמש למפות דרכים ומוצרים מנצחים שמשיגים תוצאות מדידות.',
  },
];

const Team: React.FC = () => {
  return (
    <section id="team" className="py-24 bg-white text-black rounded-[3rem] mx-2 md:mx-4 mb-4">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Text Content */}
          <div className="flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.9]">
                הצוות שלנו,<br />
                <span className="text-neutral-400">החזון שלכם</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-12 mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h3 className="font-bold text-xl mb-4">הצטרפו למשימה</h3>
                <p className="text-sm text-neutral-500 mb-6 leading-relaxed max-w-md">
                  אנחנו תמיד מחפשים כישרונות חדשים. אם אתם חיים ונושמים עיצוב, קוד או אסטרטגיה — מקומכם איתנו.
                </p>
                <Button variant="primary" className="text-sm px-6">
                  הגישו מועמדות <ArrowUpLeft size={16} />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: 'backOut' }}
                className="group relative rounded-[2rem] overflow-hidden aspect-[3/4] cursor-pointer"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-108 grayscale group-hover:grayscale-0"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold">{member.name}</h3>
                  <p className="text-neutral-300 text-sm">{member.role}</p>
                  <p className="text-neutral-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {member.bio}
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Linkedin className="text-white hover:text-blue-400 cursor-pointer" size={16} />
                    <Twitter className="text-white hover:text-blue-400 cursor-pointer" size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Team;