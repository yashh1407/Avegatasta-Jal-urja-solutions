'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Testimonial = {
  id: number;
  name: string;
  role: string | null;
  location: string | null;
  rating: number;
  text: string;
  image_url: string | null;
};

// ── Star rating ───────────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-brand-700'}
        />
      ))}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function TestimonialSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="animate-pulse rounded-[1.75rem] bg-surface-subtle border border-brand-100/60 px-6 sm:px-10 py-12 sm:py-14 text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand-100 mx-auto mb-6" />
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full bg-brand-200" />
          ))}
        </div>
        <div className="space-y-2 mb-8">
          <div className="h-4 bg-brand-100 rounded-full max-w-lg mx-auto" />
          <div className="h-4 bg-brand-100 rounded-full max-w-md mx-auto" />
          <div className="h-4 bg-brand-100 rounded-full max-w-sm mx-auto" />
        </div>
        <div className="h-4 bg-brand-100 rounded-full w-32 mx-auto mb-2" />
        <div className="h-3 bg-brand-100 rounded-full w-24 mx-auto" />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface TestimonialsSectionProps {
  badge?: string;
  titleHtml?: string;
}

export default function TestimonialsSection(props: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  
  const badge = props.badge || 'Testimonials';
  const titleHtml = props.titleHtml || 'What Our Customers Say';

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTestimonials(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const goTo = useCallback((idx: number) => emblaApi?.scrollTo(idx), [emblaApi]);

  // Sync dot indicator with Embla position
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-advance every 5s unless paused or user is dragging
  useEffect(() => {
    if (paused || !emblaApi) return;
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [paused, emblaApi]);

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-white border-t border-brand-100/60"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <p className="text-xs font-black text-brand-500 uppercase tracking-[0.2em] mb-3">
            {badge}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-950 tracking-tight" dangerouslySetInnerHTML={{ __html: titleHtml }} />
        </div>

        {loading ? (
          <TestimonialSkeleton />
        ) : testimonials.length === 0 ? null : (
          /* Embla viewport */
          <div className="max-w-4xl mx-auto relative">
            {/* Quote icon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-brand-100 z-10">
              <Quote size={20} className="text-brand-500 fill-brand-100" />
            </div>

            {/* Embla track */}
            <div
              ref={emblaRef}
              className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white via-surface-subtle to-brand-50/40 border border-brand-100/70 shadow-sm touch-pan-x select-none cursor-grab active:cursor-grabbing"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="flex-[0_0_100%] min-w-0 px-5 sm:px-10 py-12 sm:py-14 text-center"
                  >
                    <div className="flex justify-center mb-5">
                      {t.image_url ? (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 bg-white border border-brand-100 shadow-md shadow-brand-100/50">
                          <img
                            src={t.image_url}
                            alt={`${t.name} testimonial photo`}
                            className="w-full h-full rounded-[1.25rem] object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border border-brand-100 flex items-center justify-center shadow-sm">
                          <Quote size={28} className="text-brand-500 fill-brand-100" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <Stars count={t.rating} />
                    </div>

                    <blockquote className="mt-5 sm:mt-6 text-base sm:text-xl font-medium text-brand-800 leading-relaxed max-w-2xl mx-auto">
                      &ldquo;{t.text}&rdquo;
                    </blockquote>

                    <div className="mt-7 sm:mt-8">
                      <p className="font-black text-brand-950 text-base sm:text-lg">{t.name}</p>
                      {(t.role || t.location) && (
                        <p className="text-sm text-brand-500 mt-1">
                          {[t.role, t.location].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls — 44px minimum touch targets */}
            <div className="flex items-center justify-center gap-4 mt-8">
              {/* Prev — min 44×44 */}
              <button
                onClick={prev}
                className="w-11 h-11 min-w-[44px] rounded-full border border-brand-200 flex items-center justify-center text-brand-600 hover:bg-brand-50 hover:border-brand-300 transition-all active:scale-95"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Dot indicators — min 44×44 hit area */}
              <div className="flex items-center gap-1">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={`Go to testimonial ${i + 1}`}
                  >
                    <span
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === selectedIndex ? 'w-8 bg-brand-500' : 'w-2 bg-brand-200 hover:bg-brand-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Next — min 44×44 */}
              <button
                onClick={next}
                className="w-11 h-11 min-w-[44px] rounded-full border border-brand-200 flex items-center justify-center text-brand-600 hover:bg-brand-50 hover:border-brand-300 transition-all active:scale-95"
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
