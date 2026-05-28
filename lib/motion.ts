import type { Variants, Transition } from 'motion/react';

type BezierEase = [number, number, number, number];

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] } },
};

export const slideRight: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const wordReveal: Variants = {
  hidden:  { opacity: 0, y: '115%', rotateX: -18 },
  visible: {
    opacity: 1,
    y: '0%',
    rotateX: 0,
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] },
  },
};

export const pageTransition: {
  initial:    Record<string, number>;
  animate:    Record<string, number>;
  exit:       Record<string, number>;
  transition: Transition;
} = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as BezierEase },
};

export const cardHover = {
  rest:  { y: 0,   boxShadow: 'var(--shadow-card)' },
  hover: { y: -6,  boxShadow: 'var(--shadow-card-hover)', transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const counterVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } },
};
