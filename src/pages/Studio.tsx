import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft } from 'lucide-react';
import ceoPng from '@/assets/team/ceo.png';
import leadDesignerJpg from '@/assets/team/lead-designer.jpg';

const teamMembers = [
    {
        name: 'אנטולי קיזוב',
        role: 'CEO & Founder',
        image: ceoPng,
    },
    {
        name: 'תומר הרץ',
        role: 'Lead Designer',
        image: leadDesignerJpg,
    },
    {
        name: 'Michael Chen',
        role: 'Lead Developer',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    },
    {
        name: 'Anna Smith',
        role: 'Head of Strategy',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    },
    {
        name: 'James Wilson',
        role: 'Motion Designer',
        image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80',
    },
    {
        name: 'Emily Davis',
        role: 'Product Manager',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
];

const Studio = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20">
            <div className="container mx-auto">

                {/* Massive Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-32 border-b border-white/10 pb-12"
                >
                    <h1 className="text-[12vw] font-black leading-none tracking-tighter mb-8">
                        WE ARE <br />
                        <span className="text-neutral-500">REWORK.</span>
                    </h1>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <p className="text-2xl md:text-3xl font-light max-w-2xl leading-relaxed">
                            אנחנו לא עוד סוכנות דיגיטל. אנחנו מעבדת ניסויים שבה טכנולוגיה פוגשת אומנות כדי ליצור חוויות שמשנות את החוקים.
                        </p>
                        <ArrowDownLeft size={48} className="text-neutral-500 hidden md:block" />
                    </div>
                </motion.div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.12 }}
                            className="group cursor-pointer"
                        >
                            <div className="overflow-hidden rounded-[2rem] mb-6 aspect-[3/4]">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
                                />
                            </div>
                            <h3 className="text-3xl font-bold mb-2">{member.name}</h3>
                            <p className="text-neutral-500 text-lg uppercase tracking-widest">{member.role}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Philosophy / Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-white/10 pt-20">
                    <div>
                        <h2 className="text-6xl font-black tracking-tighter mb-8">OUR <br />DNA</h2>
                    </div>
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Obsession with Quality</h3>
                            <p className="text-neutral-400 text-lg leading-relaxed">
                                אנחנו לא מתפשרים על בינוניות. כל פיקסל, כל אנימציה וכל שורת קוד נבדקים בקפדנות כדי לוודא שהתוצאה הסופית היא לא פחות ממושלמת.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-white">User Centric</h3>
                            <p className="text-neutral-400 text-lg leading-relaxed">
                                הטכנולוגיה נועדה לשרת אנשים. אנחנו מתחילים מהמשתמש ומהצרכים שלו, ורק אז בוחרים את הכלים הטכנולוגיים המתאימים.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Future Ready</h3>
                            <p className="text-neutral-400 text-lg leading-relaxed">
                                העולם הדיגיטלי משתנה במהירות. אנחנו דואגים שהמותג שלכם יהיה מוכן לא רק להיום, אלא גם למחר.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Studio;
