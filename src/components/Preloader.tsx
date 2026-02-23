import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// ─── SVG "R" logomark with progress arc ──────────────────────────────────────
const ReworkMark: React.FC<{ progress: number }> = ({ progress }) => {
    const CIRC = 138.2; // 2 * PI * 22
    return (
        <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
            {/* Dim track ring */}
            <circle cx="25" cy="25" r="22" stroke="rgba(255,255,255,0.12)" strokeWidth={0.8} fill="none" />
            {/* Animated progress arc */}
            <motion.circle
                cx="25" cy="25" r="22"
                stroke="white"
                strokeOpacity={0.7}
                strokeWidth={1}
                fill="none"
                strokeLinecap="round"
                style={{ transformOrigin: '25px 25px', rotate: '-90deg' }}
                initial={{ strokeDasharray: CIRC, strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: CIRC - CIRC * (progress / 100) }}
                transition={{ duration: 0.04 }}
            />
            {/* R letterform — draws in */}
            <motion.path
                d="M15 10 L15 40 M15 10 L26 10 Q34 10 34 19 Q34 27 26 27 L15 27 M26 27 L34 40"
                stroke="white"
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                    pathLength: progress > 15 ? 1 : progress / 15,
                    opacity: progress > 8 ? 1 : 0,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />
        </svg>
    );
};

const LETTERS = ['R', 'E', 'W', 'O', 'R', 'K'];

// ─── Preloader ─────────────────────────────────────────────────────────────────
// Module-level flag: reset to false on every true page load / hard refresh
// (JS re-executes from scratch on refresh), but stays true during SPA navigation.
let hasShownPreloader = false;

const Preloader: React.FC = () => {
    const location = useLocation();

    // Only show on the first true page load — not on SPA navigation back to '/'
    const [isLoading] = useState<boolean>(() => {
        if (location.pathname !== '/') return false;
        if (hasShownPreloader) return false;
        return true; // will be marked done after preloader finishes
    });

    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'intro' | 'counting' | 'exit'>('intro');
    const [visible, setVisible] = useState(isLoading);

    useEffect(() => {
        if (!isLoading) return;

        // Phase 1: brief pause so logo springs in first
        const t1 = setTimeout(() => {
            setPhase('counting');
            let current = 0;
            const tick = () => {
                current += 1;
                setProgress(current);
                if (current < 100) {
                    const delay = current < 55 ? 20 : current < 88 ? 13 : 7;
                    setTimeout(tick, delay);
                } else {
                    // Phase 3: curtain exit
                    setTimeout(() => {
                        setPhase('exit');
                        setTimeout(() => {
                            setVisible(false);
                            hasShownPreloader = true;
                        }, 850);
                    }, 350);
                }
            };
            tick();
        }, 700);

        return () => clearTimeout(t1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="preloader"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="fixed inset-0 z-[9999] bg-black overflow-hidden select-none"
                style={{ cursor: 'wait' }}
            >
                {/* Subtle dot-grid */}
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                        backgroundSize: '44px 44px',
                    }}
                />

                {/* Curtain exit */}
                {phase === 'exit' && (
                    <motion.div
                        className="absolute inset-0 bg-black z-10"
                        style={{ transformOrigin: 'top' }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                    />
                )}

                {/* Center stage */}
                <div className="relative z-20 flex flex-col items-center justify-center h-full gap-10">

                    {/* Logo mark */}
                    <motion.div
                        initial={{ scale: 0.55, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
                        className="relative w-28 h-28 md:w-36 md:h-36"
                    >
                        {/* Glow halo */}
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ boxShadow: '0 0 70px 16px rgba(255,255,255,0.07)' }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        {/* Spinning Rework Mark */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            className="w-full h-full"
                            style={{ transformOrigin: 'center' }}
                        >
                            <ReworkMark progress={progress} />
                        </motion.div>
                    </motion.div>

                    {/* ── REWORK letters — force LTR so RTL CSS doesn't reverse them ── */}
                    <div
                        className="flex gap-[0.12em] overflow-hidden"
                        // Issue #1: website is RTL — force letters left-to-right
                        dir="ltr"
                        style={{ direction: 'ltr' }}
                    >
                        {LETTERS.map((letter, i) => (
                            <div key={i} className="overflow-hidden">
                                <motion.span
                                    initial={{ y: '110%' }}
                                    animate={phase !== 'intro' ? { y: '0%' } : { y: '110%' }}
                                    transition={{
                                        duration: 0.65,
                                        delay: i * 0.065,
                                        ease: [0.33, 1, 0.68, 1],
                                    }}
                                    className="block text-[13vw] md:text-[9vw] font-black text-white leading-none"
                                    style={{
                                        letterSpacing: '-0.05em',
                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                    }}
                                >
                                    {letter}
                                </motion.span>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar + counter */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: phase === 'counting' ? 1 : 0.25 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center gap-2.5"
                    >
                        <div className="w-40 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
                            <div
                                className="absolute left-0 top-0 h-full bg-white rounded-full transition-all"
                                style={{ width: `${progress}%`, transitionDuration: '60ms' }}
                            />
                        </div>
                        <span className="text-[10px] font-mono text-white/30 tabular-nums tracking-[0.25em]">
                            {String(progress).padStart(3, '0')}
                        </span>
                    </motion.div>
                </div>

                {/* Bottom tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 0.3, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="absolute bottom-7 left-0 right-0 text-center text-[10px] tracking-[0.45em] uppercase text-white font-light"
                    dir="ltr"
                >
                    Design Studio · Tel Aviv
                </motion.p>

                {/* Corner brackets */}
                {(['top-5 left-5 border-t border-l', 'top-5 right-5 border-t border-r',
                    'bottom-5 left-5 border-b border-l', 'bottom-5 right-5 border-b border-r'] as const
                ).map((cls, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 0.18, scale: 1 }}
                        transition={{ delay: 0.25 + i * 0.05, duration: 0.45 }}
                        className={`absolute w-5 h-5 border-white ${cls}`}
                    />
                ))}
            </motion.div>
        </AnimatePresence>
    );
};

export default Preloader;
