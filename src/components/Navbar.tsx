import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

// ─── Living + Spinning "R" Logomark ──────────────────────────────────────────
// Spins on mount, and re-spins every time the user scrolls past a threshold.
const ReworkLogo: React.FC<{ scrolled: boolean; spinKey: number }> = ({ scrolled, spinKey }) => {
  const tRef = useRef(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      tRef.current += 0.015;
      setPulse(Math.sin(tRef.current) * 0.5 + 0.5);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    // spinKey change → re-mounts the motion.div → triggers the spin again
    <motion.div
      key={spinKey}
      initial={{ rotate: -360, scale: 0.6 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
      className={`shrink-0 transition-all duration-500 ${scrolled ? 'w-7 h-7' : 'w-9 h-9'}`}
    >
      <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
        {/* Breathing ring */}
        <circle
          cx="18" cy="18" r="16.5"
          stroke={scrolled
            ? `rgba(0,0,0,${0.10 + pulse * 0.10})`
            : `rgba(255,255,255,${0.14 + pulse * 0.12})`}
          strokeWidth={0.7}
          fill="none"
        />
        {/* Inner fill */}
        <circle
          cx="18" cy="18" r={11.5 + pulse * 0.5}
          fill={scrolled
            ? `rgba(0,0,0,${0.05 + pulse * 0.04})`
            : `rgba(255,255,255,${0.06 + pulse * 0.05})`}
        />
        {/* R letterform */}
        <path
          d="M12 9 L12 27 M12 9 L20 9 Q26 9 26 15 Q26 21 20 21 L12 21 M20 21 L26 27"
          stroke={scrolled ? '#000' : '#fff'}
          strokeWidth={2.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
};

// ─── Nav link: vertical text-flip hover ──────────────────────────────────────
const NavLink: React.FC<{ to: string; label: string; dark?: boolean }> = ({ to, label, dark }) => {
  const [hovered, setHovered] = useState(false);
  const color = dark ? 'text-black/80' : 'text-white/85';
  const colorHover = dark ? 'text-black' : 'text-white';

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden h-[1.4em] flex items-center"
      dir="ltr"
    >
      <motion.span
        animate={{ y: hovered ? '-100%' : '0%' }}
        transition={{ duration: 0.26, ease: [0.33, 1, 0.68, 1] }}
        className={`text-sm font-semibold tracking-wide block ${color}`}
        style={{ letterSpacing: '0.04em' }}
      >
        {label}
      </motion.span>
      <motion.span
        animate={{ y: hovered ? '0%' : '100%' }}
        transition={{ duration: 0.26, ease: [0.33, 1, 0.68, 1] }}
        className={`absolute text-sm font-semibold tracking-wide ${colorHover}`}
        style={{ letterSpacing: '0.04em' }}
      >
        {label}
      </motion.span>
    </Link>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setMobile] = useState(false);
  const [spinKey, setSpinKey] = useState(0);   // increment to re-trigger spin
  const prevScrollRef = useRef(0);
  const lastSpinScrollRef = useRef(0);
  const spinCooldown = useRef(false);

  useEffect(() => {
    const SCROLL_THRESHOLD = 60;   // px before floating pill
    const SPIN_EVERY = 300;  // spin again every 300px scrolled

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > SCROLL_THRESHOLD);

      // Spin logo every SPIN_EVERY px of scroll distance
      if (!spinCooldown.current && Math.abs(y - lastSpinScrollRef.current) > SPIN_EVERY) {
        lastSpinScrollRef.current = y;
        spinCooldown.current = true;
        setSpinKey(k => k + 1);
        setTimeout(() => { spinCooldown.current = false; }, 900); // cooldown
      }

      prevScrollRef.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'צור קשר', href: '/contact' },
    { label: 'שירותים', href: '/services' },
    { label: 'סטודיו', href: '/studio' },
    { label: 'פרויקטים', href: '/projects' },
  ];

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          HERO NAVBAR — full-width, dramatic, striking
          ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.header
            key="hero-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="fixed top-0 left-0 right-0 z-[200]"
          >
            {/* ── Deep gradient smoke (taller, more dramatic) ── */}
            <div
              className="absolute inset-x-0 top-0 h-40 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 65%, transparent 100%)',
              }}
            />

            {/* ── Hairline border bottom glow ── */}
            <div
              className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 70%, transparent)',
              }}
            />

            {/* ── Content ── */}
            <div className="relative flex items-center justify-between px-8 md:px-14 py-6">

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
              >
                <Link to="/" className="flex items-center gap-3 group">
                  <ReworkLogo scrolled={false} spinKey={spinKey} />
                  <span
                    className="text-white font-black text-lg tracking-[-0.04em] group-hover:opacity-80 transition-opacity"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                    dir="ltr"
                  >
                    REWORK
                  </span>
                </Link>
              </motion.div>

              {/* Center links — with a subtle mid-separator line */}
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.55 }}
                className="hidden md:flex items-center gap-1"
                dir="ltr"
              >
                {navItems.map((item, i) => (
                  <React.Fragment key={item.href}>
                    <div className="px-4">
                      <NavLink to={item.href} label={item.label} dark={false} />
                    </div>
                    {i < navItems.length - 1 && (
                      <div className="w-px h-3.5 bg-white/15" />
                    )}
                  </React.Fragment>
                ))}
              </motion.nav>

              {/* CTA + Mobile */}
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="hidden md:block"
                  dir="ltr"
                >
                  <Link to="/start-project">
                    <motion.button
                      whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,1)' }}
                      whileTap={{ scale: 0.97 }}
                      className="relative rounded-full border border-white/35 text-white text-sm font-semibold px-6 py-2.5 overflow-hidden group"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                      }}
                    >
                      <motion.span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      <span className="relative z-10 group-hover:text-black transition-colors duration-200">
                        בואו נדבר
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>

                <button
                  className="md:hidden text-white p-2 z-10"
                  onClick={() => setMobile(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          FLOATING PILL NAVBAR — scrolled state
          ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            key="pill-nav"
            initial={{ y: -120, opacity: 0, scale: 0.85, rotateX: 45 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ y: -100, opacity: 0, scale: 0.9, rotateX: -20 }}
            transition={{ type: "spring", stiffness: 240, damping: 20, mass: 1 }}
            className="fixed top-5 left-0 right-0 mx-auto w-max z-[200]"
            style={{ perspective: 1000 }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 4px 28px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(0,0,0,0.08)',
                  '0 8px 40px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.12)',
                  '0 4px 28px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(0,0,0,0.08)',
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-5 pl-4 pr-5 py-2.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.93)',
                backdropFilter: 'blur(22px) saturate(200%)',
                WebkitBackdropFilter: 'blur(22px) saturate(200%)',
                border: '0.5px solid rgba(255,255,255,0.65)',
              }}
            >
              <Link to="/" className="flex items-center gap-2.5 shrink-0">
                <ReworkLogo scrolled={true} spinKey={spinKey} />
                <span
                  className="font-black text-[14px] text-black tracking-[-0.04em]"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                  dir="ltr"
                >
                  REWORK
                </span>
              </Link>

              <div className="w-px h-4 bg-black/12 shrink-0" />

              <nav className="hidden md:flex items-center gap-6" dir="ltr">
                {navItems.map(item => (
                  <NavLink key={item.href} to={item.href} label={item.label} dark={true} />
                ))}
              </nav>

              <div className="hidden md:block w-px h-4 bg-black/12 shrink-0" />

              <Link to="/start-project" className="hidden md:block shrink-0" dir="ltr">
                <motion.button
                  whileHover={{ scale: 1.04, backgroundColor: '#222' }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full bg-black text-white text-xs font-bold px-5 py-2.5 transition-colors"
                  style={{ letterSpacing: '0.02em' }}
                  dir="ltr"
                >
                  בואו נדבר
                </motion.button>
              </Link>

              <button
                className="md:hidden text-black p-1 ml-1"
                onClick={() => setMobile(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          MOBILE MENU
          ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className="fixed top-20 inset-x-4 z-[199] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 12px 60px rgba(0,0,0,0.22)',
            }}
          >
            <div className="flex flex-col p-6 gap-5">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.055, duration: 0.28 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setMobile(false)}
                    className="text-xl font-bold text-black hover:opacity-55 transition-opacity"
                    dir="ltr"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Link to="/start-project" onClick={() => setMobile(false)} dir="ltr">
                <button className="w-full mt-2 rounded-full bg-black text-white font-bold py-3.5 text-sm">
                  בואו נדבר →
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;