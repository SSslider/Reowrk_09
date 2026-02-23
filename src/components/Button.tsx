import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'dark';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-colors duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-black text-white hover:bg-neutral-800",
    outline: "border border-neutral-300 text-black hover:bg-neutral-100",
    dark: "bg-white text-black hover:bg-neutral-200"
  };

  return (
    <motion.button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props as any}
    >
      {children}
    </motion.button>
  );
};

export default Button;