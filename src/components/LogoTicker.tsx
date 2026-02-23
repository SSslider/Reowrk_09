import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

// Client data — real logos via letter/SVG + description per client
const clients = [
  {
    name: 'Apple',
    since: '2019',
    industry: 'Consumer Technology',
    description: 'שיתוף פעולה בפיתוח ממשקי משתמש מתקדמים ועיצוב חוויית משתמש עבור מוצרים פנימיים.',
    color: '#1d1d1f',
    logo: 'AAPL',
    bgImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  },
  {
    name: 'Google',
    since: '2020',
    industry: 'Technology & Cloud',
    description: 'עיצוב ופיתוח דשבורדים ומערכות ניתוח נתונים פנימיות לצוות ה-Growth.',
    color: '#1a73e8',
    logo: 'GOOG',
    bgImage: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&q=80',
  },
  {
    name: 'Microsoft',
    since: '2021',
    industry: 'Enterprise Software',
    description: 'בניית ממשקי ניהול משימות משולבים ב-Azure DevOps ואינטגרציה עם מוצרי 365.',
    color: '#0078d4',
    logo: 'MSFT',
    bgImage: 'https://images.unsplash.com/photo-1642132652806-c7de3e498ae2?w=800&q=80',
  },
  {
    name: 'Airbnb',
    since: '2020',
    industry: 'Travel & Hospitality',
    description: 'עיצוב מחדש של תהליכי ה-Onboarding למארחים ושיפור נתוני ההמרה ב-34%.',
    color: '#ff5a5f',
    logo: 'ABNB',
    bgImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  },
  {
    name: 'Spotify',
    since: '2022',
    industry: 'Music & Audio',
    description: 'פיתוח כלים לניתוח נתוני Podcast ועיצוב חוויית מאזין עבור פלטפורמת היוצרים.',
    color: '#1db954',
    logo: 'SPOT',
    bgImage: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80',
  },
  {
    name: 'Figma',
    since: '2021',
    industry: 'Design Tools',
    description: 'שיתוף פעולה בפיתוח פלאגינים ומערכות עיצוב מותאמות לצוותי מוצר גדולים.',
    color: '#f24e1e',
    logo: 'FIG',
    bgImage: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80',
  },
  {
    name: 'Stripe',
    since: '2022',
    industry: 'Fintech & Payments',
    description: 'עיצוב לוחות בקרה פיננסיים ומרכזי תשלומים עם דגש על בטיחות ו-UX מוסדי.',
    color: '#6772e5',
    logo: 'STRP',
    bgImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  },
  {
    name: 'Notion',
    since: '2023',
    industry: 'Productivity & SaaS',
    description: 'פיתוח הרחבות ותבניות מותאמות ויצירת חוויית Workspace מותאמת אישית.',
    color: '#191919',
    logo: 'NOT',
    bgImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
  },
];

const marqueeItems = [...clients, ...clients, ...clients];

interface ClientCardProps {
  client: typeof clients[0];
  index: number;
  onOpen: (c: typeof clients[0]) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, index, onOpen }) => (
  <motion.button
    key={index}
    onClick={() => onOpen(client)}
    whileHover={{ y: -4, scale: 1.03 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    className="w-44 h-28 bg-white rounded-2xl border border-neutral-100
               flex flex-col items-center justify-center gap-2 cursor-pointer
               hover:shadow-xl hover:border-neutral-200 transition-shadow duration-300 flex-shrink-0"
    aria-label={`פתח מידע על ${client.name}`}
  >
    <span
      className="text-lg font-black tracking-tighter"
      style={{ color: client.color }}
    >
      {client.logo}
    </span>
    <span className="text-xs text-neutral-400 font-medium">{client.name}</span>
  </motion.button>
);

// Premium popup/modal for each client
interface ClientModalProps {
  client: typeof clients[0] | null;
  onClose: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {client && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />

          {/* Panel — slides up from bottom */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-50 bottom-0 inset-x-0 md:inset-auto md:top-1/2 md:left-1/2
                       md:-translate-x-1/2 md:-translate-y-1/2
                       w-full md:w-[680px] md:max-w-[95vw]
                       bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Hero image */}
            <div className="relative h-52 md:h-64 overflow-hidden">
              <img
                src={client.bgImage}
                alt={client.name}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.72)' }}
              />
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md
                           flex items-center justify-center text-white hover:bg-white/35 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Logo badge */}
              <div
                className="absolute bottom-5 right-6 text-2xl font-black tracking-tighter"
                style={{ color: '#ffffff' }}
              >
                {client.logo}
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-7 text-right" dir="rtl">
              {/* Meta */}
              <div className="flex items-center gap-4 mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: `${client.color}18`, color: client.color }}
                >
                  {client.industry}
                </span>
                <span className="text-xs text-neutral-400">לקוח מ-{client.since}</span>
              </div>

              <h3 className="text-2xl font-black tracking-tighter mb-3">{client.name}</h3>

              <p className="text-neutral-500 text-base leading-relaxed mb-6">
                {client.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <button className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black transition-colors">
                  <ExternalLink size={13} />
                  פרטים נוספים
                </button>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: client.color }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const LogoTicker: React.FC = () => {
  const [activeClient, setActiveClient] = useState<typeof clients[0] | null>(null);

  return (
    <>
      <section className="bg-neutral-50 py-20 overflow-hidden text-black">
        <div className="container mx-auto px-6 mb-10">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                הלקוחות שלנו
              </span>
              <p className="text-neutral-300 text-xs mt-1">לחץ על לוגו לפרטים</p>
            </div>
            <div className="text-xs text-neutral-400">2015–2024</div>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative w-full">
          {/* Row 1 */}
          <div className="flex overflow-hidden mb-4">
            <motion.div
              className="flex gap-5 w-max"
              animate={{ x: [0, -clients.length * 196] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 38 }}
            >
              {marqueeItems.map((c, i) => (
                <ClientCard key={i} client={c} index={i} onOpen={setActiveClient} />
              ))}
            </motion.div>
          </div>

          {/* Row 2 — reversed scroll for depth */}
          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-5 w-max"
              animate={{ x: [-clients.length * 196, 0] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 44 }}
            >
              {[...marqueeItems].reverse().map((c, i) => (
                <ClientCard key={i} client={c} index={i} onOpen={setActiveClient} />
              ))}
            </motion.div>
          </div>

          {/* Edge fades */}
          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-neutral-50 to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-neutral-50 to-transparent pointer-events-none z-10" />
        </div>
      </section>

      <ClientModal client={activeClient} onClose={() => setActiveClient(null)} />
    </>
  );
};

export default LogoTicker;