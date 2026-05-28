'use client';

import React from 'react';
import { products } from '@/lib/data';
import { motion } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductGrid() {

  return (
    <section id="products" className="py-16 sm:py-20 lg:py-24 bg-stone-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Top Deals for You</h2>
            <p className="text-stone-500 text-sm">Handpicked water solutions from V-Guard, Zero B, and Wilo.</p>
          </div>
          <Link href="/products" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
            See all deals
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-stone-200 hover:shadow-xl transition-all group flex flex-col h-full"
              >
                <Link href={`/product/${product.id}`} className="relative aspect-square rounded-xl overflow-hidden bg-stone-50 mb-4 block">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    unoptimized={product.image.includes('lh3.googleusercontent.com') || product.image.includes('vguard.in')}
                  />
                </Link>

                <div className="flex-1 flex flex-col">
                  <Link href={`/product/${product.id}`} className="text-sm font-bold text-stone-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </Link>
                  
                  <div className="mt-auto">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold mb-4">
                      <Zap size={10} />
                      <span>Official Partner</span>
                    </div>

                    <Link 
                      href="/contact"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Call Us
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
