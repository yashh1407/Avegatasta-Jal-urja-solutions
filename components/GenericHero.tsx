'use client';

import React from 'react';
import { motion } from 'motion/react';

type GenericHeroProps = {
  title?: string;
  subtitle?: string;
  content?: string | string[];
};

export default function GenericHero({
  title = 'Our Services',
  subtitle = 'Professional Water & Energy Solutions',
  content = 'Avegatasta Solution provides comprehensive services...',
}: GenericHeroProps) {
  // Description can be an array of paragraphs, or a string separated by \n\n
  const paragraphs = Array.isArray(content)
    ? content
    : typeof content === 'string'
      ? content.split('\n\n')
      : [];

  return (
    <section className="pt-28 sm:pt-32 pb-20 bg-blue-950 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[22rem] h-[22rem] sm:w-[800px] sm:h-[800px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[18rem] h-[18rem] sm:w-[600px] sm:h-[600px] bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          {title && (
            <h1 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4">
              {title}
            </h1>
          )}
          
          {subtitle && (
            <h2 
              className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]"
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
          )}
          
          {paragraphs.map((para, i) => (
            <p key={i} className={`text-lg text-blue-100/80 font-medium leading-relaxed ${i !== paragraphs.length - 1 ? 'mb-6' : 'mb-8'}`}>
              {para}
            </p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
