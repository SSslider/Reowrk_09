import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'דניאל כהן',
        role: 'מנכ״ל, TechFlow',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        text: 'הצוות של REWORK לקח את החזון שלנו והפך אותו למציאות דיגיטלית שעולה על כל דמיון. התהליך היה מקצועי, מדויק ומעורר השראה.',
        rating: 5
    },
    {
        name: 'מיכל אברהם',
        role: 'סמנכ״לית שיווק, GreenLoop',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
        text: 'חיפשנו שותף שיוכל להבין את המורכבות של המוצר שלנו ולהנגיש אותו בצורה פשוטה וסקסית. REWORK פיצחו את זה בגדול.',
        rating: 5
    },
    {
        name: 'יוני לוי',
        role: 'Founder, NextGen',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        text: 'העבודה עם הסטודיו הייתה חוויה של יצירה משותפת. הם לא רק מבצעים, הם חושבים יחד איתך ומאתגרים אותך להגיע לתוצאה טובה יותר.',
        rating: 5
    }
];

const LOGOS = [
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/archive/5/53/20210618182605%21H%26M-Logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/NetApp_logo.svg/2560px-NetApp_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png"
];

const ClientsPage = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">הלקוחות שלנו</h1>
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                        אנחנו גאים לעבוד עם מותגים שמעזים לחלום בגדול. הנה מה שהם אומרים עלינו.
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-neutral-900/50 border border-white/5 p-8 rounded-[2rem] relative group hover:bg-neutral-900 transition-colors"
                        >
                            <Quote className="absolute top-8 left-8 text-neutral-800 transform scale-150 rotate-180" />

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-neutral-800" />
                                <div>
                                    <h3 className="font-bold text-lg">{t.name}</h3>
                                    <p className="text-sm text-neutral-500">{t.role}</p>
                                </div>
                            </div>

                            <p className="text-lg text-neutral-300 leading-relaxed mb-6 relative z-10">
                                "{t.text}"
                            </p>

                            <div className="flex gap-1 text-yellow-500">
                                {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Logos Grid */}
                <div className="border-t border-white/10 pt-20">
                    <p className="text-center text-neutral-500 mb-12 uppercase tracking-widest text-sm">נבחרת המותגים שעובדים איתנו</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {LOGOS.map((logo, i) => (
                            <img key={i} src={logo} alt="Client Logo" className="h-8 md:h-12 object-contain brightness-0 invert" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientsPage;
