'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleOpen = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
    >
      {items.map((faq, idx) => {
        const isOpen = openId === idx;
        return (
          <motion.div
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
            }}
            className="border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/70 backdrop-blur-md hover:shadow-md transition-all duration-300"
          >
            <button
              onClick={() => toggleOpen(idx)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50/50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="text-[15px] font-bold text-slate-800 leading-snug pr-2">
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="shrink-0 text-blue-500 bg-blue-50 p-1.5 rounded-full"
              >
                <ChevronDown size={18} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-[15px] text-slate-600 font-medium leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
