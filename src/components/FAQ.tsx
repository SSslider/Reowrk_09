import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { q: "כמה זמן לוקח לבנות אתר?", a: "ציר הזמן לבניית אתר תלוי במורכבות ובדרישות הספציפיות. בממוצע, אתרי תדמית לוקחים 4-6 שבועות, בעוד פלטפורמות מורכבות יכולות לקחת 3-4 חודשים." },
  { q: "האם אתם מציעים עיצובים בהתאמה אישית או תבניות?", a: "אנחנו יוצרים אך ורק עיצובים מותאמים אישית (Custom Made). אנחנו מאמינים שכל מותג הוא ייחודי וזקוק לשפה ויזואלית משלו." },
  { q: "מה כלול בשירותים שלכם?", a: "אנחנו מציעים חבילה מלאה הכוללת: אסטרטגיה, מיתוג, עיצוב UI/UX, פיתוח (Web & Mobile), ובקרת איכות." },
  { q: "איך מתחילים לעבוד יחד?", a: "פשוט מאוד! צרו איתנו קשר דרך הטופס למטה, נתאם שיחת היכרות קצרה להבין את הצרכים שלכם, ומשם נתקדם להצעת מחיר מסודרת." }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white text-black">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-6xl font-black mb-4 tracking-tighter"
          >
            FAQ
          </motion.h2>
          <p className="text-neutral-500 max-w-xs">יש לכם שאלות? יש לנו תשובות. כל מה שצריך לדעת לפני שמתחילים לעבוד יחד.</p>
        </div>
        <div className="lg:col-span-8">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border-b border-neutral-200 py-6 first:border-t"
              >
                <button
                  className="flex justify-between items-center w-full text-right hover:text-neutral-600 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span className="font-bold text-lg">{faq.q}</span>
                  <div className="bg-neutral-100 rounded-full p-1 transition-colors duration-300">
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-neutral-500 text-sm leading-relaxed pl-8 pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;