import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModernCardProps {
  children: ReactNode;
  variant?: 'glass' | 'elevated' | 'minimal';
  className?: string;
  hover?: boolean;
}

export function ModernCard({
  children,
  variant = 'elevated',
  className = '',
  hover = true
}: ModernCardProps) {
  const baseClasses = 'rounded-xl transition-all duration-300';

  const variantClasses = {
    glass: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-glass',
    elevated: 'bg-white shadow-moai-card hover:shadow-hover-lift',
    minimal: 'bg-white/50 backdrop-blur-sm border border-gray-200/50'
  };

  const hoverClass = hover ? 'hover-lift' : '';

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

