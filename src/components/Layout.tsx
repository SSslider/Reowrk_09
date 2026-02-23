import React, { useState, useEffect } from 'react';
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SmartBot from './SmartBot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { scrollY } = useScroll();

  const location = useLocation();



  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-black selection:text-white font-sans text-neutral-900" dir="rtl">

      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate="visible"
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </motion.header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <SmartBot />
    </div>
  );
};

export default Layout;
