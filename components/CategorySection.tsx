'use client';

import { motion } from 'motion/react';
import { staggerContainer, fadeUp } from '@/lib/motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getTopLevelCategories } from '@/lib/productHierarchy';

export default function CategorySection() {
  const categories = getTopLevelCategories();

  return (
    <section id="categories" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        {/* Section header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="text-xs font-black text-brand-500 uppercase tracking-[0.2em] mb-3"
            >
              Our Solutions
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-black text-brand-950 tracking-tight"
            >
              Specialized Water &amp; Energy Solutions
            </motion.h2>
          </div>
          <motion.p variants={fadeUp} className="text-brand-500 max-w-md font-medium">
            From heat pumps to water purifiers — complete solutions for every need.
          </motion.p>
        </motion.div>

        {/* 3-col premium category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link
                href={cat.href || `/products?category=${encodeURIComponent(cat.name)}`}
                className="motion-card motion-media group relative block rounded-[1.75rem] overflow-hidden aspect-[4/3] bg-brand-950"
                aria-label={`Browse ${cat.name}`}
              >
                {/* Background image */}
               <Image
  src={cat.image ?? "/placeholder-product.jpg"}
  alt={cat.name}
  fill
  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
  referrerPolicy="no-referrer"
  unoptimized={
    (cat.image ?? "").includes("lh3.googleusercontent.com") ||
    (cat.image ?? "").includes("vguard.in")
  }
/>

                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />

                {/* Hover overlay — brand tint */}
                <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/20 transition-colors duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  <h3 className="text-xl font-black text-white tracking-tight mb-2 leading-tight">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-accent-400 text-sm font-bold translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Browse products
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
