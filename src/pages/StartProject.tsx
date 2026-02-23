import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft } from 'lucide-react';

const StartProject = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        budget: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setFormData({ name: '', email: '', company: '', budget: '', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="mb-16 md:mb-24">
                        <motion.h1
                            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            בואו ניצור <br />
                            <span className="text-neutral-500">משהו בלתי נשכח.</span>
                        </motion.h1>
                        <p className="text-xl text-neutral-400 max-w-xl leading-relaxed">
                            אנחנו עובדים עם מותגים שרוצים לפרוץ גבולות. ספרו לנו על החזון שלכם, ואנחנו נדאג לכל השאר.
                        </p>
                    </div>

                    {isSubmitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-12 text-center"
                        >
                            <h3 className="text-4xl font-bold mb-4">תודה רבה!</h3>
                            <p className="text-xl text-neutral-400">קיבלנו את ההודעה שלך. נחזור אליך בהקדם האפשרי.</p>
                            <Button
                                onClick={() => setIsSubmitted(false)}
                                variant="outline"
                                className="mt-8 rounded-full border-white/20 hover:bg-white/10"
                            >
                                שלח הודעה נוספת
                            </Button>
                        </motion.div>
                    ) : (
                        <form className="space-y-12" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-neutral-800 pt-12">
                                <InputField label="איך קוראים לכם?" name="name" value={formData.name} onChange={handleChange} placeholder="ישראל ישראלי" required />
                                <InputField label="המייל שלכם?" name="email" value={formData.email} onChange={handleChange} placeholder="hello@example.com" type="email" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-neutral-800 pt-12">
                                <InputField label="שם החברה / מותג" name="company" value={formData.company} onChange={handleChange} placeholder="שם העסק" />
                                <div className="space-y-4">
                                    <label className="text-2xl font-bold block text-neutral-500">תקציב משוער</label>
                                    <select
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-neutral-700 py-4 text-3xl focus:border-white focus:outline-none transition-colors appearance-none cursor-pointer text-white"
                                    >
                                        <option value="" className="bg-neutral-900 text-neutral-500">בחר תקציב...</option>
                                        <option value="15-30k" className="bg-neutral-900">15,000 - 30,000 ₪</option>
                                        <option value="30-60k" className="bg-neutral-900">30,000 - 60,000 ₪</option>
                                        <option value="60-100k" className="bg-neutral-900">60,000 - 100,000 ₪</option>
                                        <option value="100k+" className="bg-neutral-900">100,000 ₪ +</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-neutral-800 pt-12 space-y-4">
                                <label className="text-2xl font-bold block text-neutral-500">על הפרויקט</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full bg-transparent border-b border-neutral-700 py-4 text-3xl focus:border-white focus:outline-none transition-colors resize-none placeholder-neutral-800"
                                    placeholder="ספרו לנו בקצרה..."
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-12">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    variant="primary"
                                    className="bg-white text-black hover:bg-neutral-200 text-xl px-12 py-8 rounded-full w-full md:w-auto flex items-center justify-between gap-8 group disabled:opacity-50"
                                >
                                    <span>{isSubmitting ? 'שולח...' : 'שלח הודעה'}</span>
                                    {!isSubmitting && <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />}
                                </Button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, placeholder, type = "text" }: any) => (
    <div className="space-y-4">
        <label className="text-2xl font-bold block text-neutral-500">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-neutral-700 py-4 text-3xl focus:border-white focus:outline-none transition-colors placeholder-neutral-800"
            placeholder={placeholder}
        />
    </div>
);

export default StartProject;
