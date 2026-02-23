import React from 'react';
import { motion } from 'framer-motion';
import { Code, PenTool, Layout, Monitor, Smartphone, Globe } from 'lucide-react';

const services = [
    { icon: Layout, title: 'עיצוב מוצר (UX/UI)', description: 'אנחנו יוצרים ממשקים שלא רק נראים מדהים, אלא מרגישים נכון. מחקר מעמיק, אפיון מדויק ועיצוב שמשאיר חותם.' },
    { icon: Globe, title: 'פיתוח אתרים', description: 'פיתוח אתרי תדמית ומערכות web בטכנולוגיות הקצה (React, Next.js). ביצועים מושלמים, אנימציות חלקות וקידום אורגני.' },
    { icon: Smartphone, title: 'פיתוח אפליקציות', description: 'אפליקציות Native ו-Cross-platform שרצות מהר ונראות מעולה בכל מכשיר. חווית משתמש שגורמת למשתמשים לחזור.' },
    { icon: PenTool, title: 'מיתוג וזהות', description: 'אנחנו בונים שפה ויזואלית שמספרת את הסיפור שלכם. לוגו, צבעוניות וטיפוגרפיה שיוצרים מותג חזק וזכיר.' },
    { icon: Monitor, title: 'אסטרטגיה דיגיטלית', description: 'אנחנו מנתחים את השוק, מבינים את הקהל שלכם ובונים תוכנית פעולה שתביא אתכם ליעדים העסקיים שלכם.' },
    { icon: Code, title: 'מערכות ניהול', description: 'דאשבורדים ומערכות Back-office מותאמות אישית. כלים חכמים לייעול תהליכים, ניהול מידע וקבלת החלטות.' },
];

const ServicesPage = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-32 px-6">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-24"
                >
                    <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter text-right">שירותים</h1>
                    <div className="w-full h-px bg-white/20 mb-8"></div>
                    <p className="text-2xl text-neutral-400 max-w-3xl leading-relaxed text-right mr-auto">
                        אנחנו מספקים מעטפת מלאה למותגים שרוצים להוביל.
                        משלב הרעיון ועד להשקה, אנחנו איתכם בכל פיקסל ושורת קוד.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pb-20">
                    {services.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group border-t border-white/10 pt-8 hover:border-white/50 transition-colors duration-500"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-3xl font-bold leading-tight group-hover:text-neutral-200 transition-colors">{s.title}</h3>
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black transition-all duration-300">
                                    <s.icon size={20} />
                                </div>
                            </div>
                            <p className="text-neutral-500 text-lg leading-relaxed group-hover:text-neutral-300 transition-colors duration-300">{s.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="border-t border-white/10 pt-20 pb-12 flex flex-col md:flex-row justify-between items-center gap-8 text-right md:text-right"
                >
                    <a
                        href="/start-project"
                        className="bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-neutral-200 transition-colors"
                    >
                        התחילו פרויקט
                    </a>
                    <div>
                        <h2 className="text-4xl font-black mb-2">מוכנים לפרוץ גבולות?</h2>
                        <p className="text-neutral-400 text-xl">בואו ניצור ביחד את הדבר הגדול הבא.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ServicesPage;
