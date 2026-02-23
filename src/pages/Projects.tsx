import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const projects = [
    {
        title: 'Dental Clinic Premium',
        category: 'Web Design & Branding',
        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80',
        description: 'מיתוג יוקרתי ועיצוב אתר למרפאת שיניים מובילה, עם דגש על חווית משתמש מרגיעה ונגישות.',
        link: '/project/dental' // Placeholder link
    },
    {
        title: 'Neon Nights',
        category: 'Brand Identity',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        description: 'מיתוג מלא לחיי הלילה של תל אביב.',
        link: '#'
    },
    {
        title: 'Future Tech',
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
        description: 'פיתוח פלטפורמה טכנולוגית מתקדמת.',
        link: '#'
    },
    {
        title: 'Eco Life',
        category: 'App Design',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?auto=format&fit=crop&q=80&w=800',
        description: 'עיצוב אפליקציה לאורח חיים ירוק.',
        link: '#'
    }
];

const Projects = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-32 px-6">
            <div className="container mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-7xl md:text-9xl font-black mb-16 tracking-tighter"
                >
                    WORK
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                    {projects.map((project, idx) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative group rounded-[2rem] overflow-hidden ${project.size === 'large' ? 'md:row-span-2 aspect-[3/4]' : 'aspect-square'}`}
                        >
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                                <span className="text-sm font-mono text-neutral-300 mb-2">{project.category}</span>
                                <div className="flex justify-between items-end">
                                    <h3 className="text-3xl font-bold">{project.title}</h3>
                                    <div className="bg-white text-black p-3 rounded-full">
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Projects;
