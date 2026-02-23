import React from 'react';
import { Star, Linkedin, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  {
    id: '1',
    content: 'REWORK סיפקו לנו שירות מרהיב בכל התוצרים. הם יצרו עיצובים יוצאי דופן הן בפלטפורמה והן במוצר.',
    author: 'טורסטן גוסטבסן',
    role: 'מנכ״ל ב-Trevis',
    company: 'Trevis',
    rating: 5,
    source: 'LinkedIn'
  },
  {
    id: '2',
    content: 'אני אוהב לעבוד עם בוגדן. תמיד מספק בזמן, והם מגיעים עם פתרונות נהדרים. אעבוד איתו ועם הצוות שלו שוב.',
    author: 'אונו מאבריק',
    role: 'יזם',
    company: 'UNO',
    rating: 5,
    source: 'Upwork'
  },
  {
    id: '3',
    content: 'העבודה עם REWORK הייתה חוויה מדהימה מההתחלה ועד הסוף. הם השלימו את כל הפרויקטים בהצלחה ותוצאות יוצאות דופן.',
    author: 'רוברט אברם',
    role: 'מייסד',
    company: 'Avram Inc',
    rating: 5,
    source: 'Clutch'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-neutral-50 text-black">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-16 text-center md:text-right"
        >
          חוויות
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[2rem] flex flex-col justify-between h-full shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-lg font-medium leading-relaxed mb-8">"{item.content}"</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden">
                  <img src={`https://picsum.photos/100/100?random=${item.id}`} alt={item.author} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.author}</h4>
                  <p className="text-xs text-neutral-500">{item.role}</p>
                </div>
                <div className="mr-auto">
                  {item.source === 'LinkedIn' && <Linkedin className="text-[#0077b5]" size={24} />}
                  {item.source === 'Upwork' && <div className="bg-[#14a800] text-white text-[10px] font-bold p-1 rounded-full w-6 h-6 flex items-center justify-center">Up</div>}
                  {item.source === 'Clutch' && <Award className="text-red-500" size={24} />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-neutral-200 pt-16">
          {['337+', '26+', '60%', '42'].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-2">{stat}</h3>
              <p className="text-sm text-neutral-500">
                {i === 0 && 'לקוחות ברחבי העולם'}
                {i === 1 && 'פרויקטים מוצלחים לשנה'}
                {i === 2 && 'לקוחות חוזרים'}
                {i === 3 && 'פרסי עיצוב'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;