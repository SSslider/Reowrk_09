import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { findAnswer } from '@/lib/knowledgeBase';

const SmartBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
        { role: 'bot', content: 'היי, אני מאיה, העוזרת החכמה של REWORK. איך אני יכולה לעזור לכם לקחת את המותג שלכם לשלב הבא?' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = findAnswer(userMsg);
            setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -180 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-8 left-8 z-50 w-16 h-16 bg-white text-black rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center hover:bg-neutral-200 transition-colors"
                    >
                        <MessageSquare size={24} fill="currentColor" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.3 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-8 left-8 z-[60] w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-black border border-white/20 flex items-center justify-center relative">
                                    <Sparkles size={16} className="text-white" />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg tracking-wide">MAYA AI</h3>
                                    <span className="text-neutral-400 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        מחוברת
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-white text-black rounded-tr-none shadow-lg shadow-white/5'
                                            : 'bg-white/10 text-neutral-200 border border-white/5 rounded-tl-none backdrop-blur-md'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/5 text-white/50 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-100"></span>
                                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-gradient-to-t from-black/50 to-transparent">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="שאל אותי על מחירים, שירותים..."
                                    className="w-full bg-white/10 border border-white/10 rounded-full pl-4 pr-12 py-4 text-white placeholder-neutral-500 focus:outline-none focus:bg-white/15 focus:border-white/20 transition-all text-right shadow-inner"
                                    dir="rtl"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors shadow-lg"
                                >
                                    <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SmartBot;
