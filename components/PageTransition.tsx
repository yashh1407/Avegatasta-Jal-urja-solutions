'use client';

import { motion, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { pageTransition } from '@/lib/motion';

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div data-motion-root className="motion-page-shell">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      key={pathname}
      data-motion-root
      className="motion-page-shell"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}
