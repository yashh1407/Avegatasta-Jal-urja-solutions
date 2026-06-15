import Image from 'next/image';
import { query } from '@/lib/db';

interface BrandItem {
  name: string;
  logo?: string;
  tagline?: string;
}

const DEFAULT_BRANDS = [
  {
    name: 'V-Guard',
    logo: '/brands/vguard.png',
    tagline: 'Water Heating & Solar',
  },
  {
    name: 'Zero B',
    logo: '/brands/zerob.png',
    tagline: 'Water Treatment',
  },
  {
    name: 'Bluewave India',
    logo: '/brands/bluewave.png',
    tagline: 'Pool Equipment & Chemicals',
  },
  {
    name: 'Wilo',
    logo: '/brands/wilo.png',
    tagline: 'Wilo pump dealer Nashik',
  },
];

export default async function BrandMarquee() {
  let marqueeTitle = 'Authorized Distributor';
  let brands: BrandItem[] = DEFAULT_BRANDS;

  try {
    const sections = await query(
      `SELECT * FROM page_sections WHERE section_key = 'home-marquee' AND is_active = 1 LIMIT 1`
    );
    if (sections && sections.length > 0) {
      const section = sections[0];
      const data = typeof section.data_json === 'string' ? JSON.parse(section.data_json) : section.data_json;
      if (data) {
        if (data.title) marqueeTitle = data.title;
        if (data.brands && Array.isArray(data.brands) && data.brands.length > 0) {
          brands = data.brands;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load marquee from database:", err);
  }

  // Duplicate for seamless infinite scroll
  const duplicatesNeeded = Math.max(4, Math.ceil(8 / brands.length));
  const track: BrandItem[] = [];
  for (let i = 0; i < duplicatesNeeded; i++) {
    track.push(...brands);
  }

  return (
    <section className="py-10 sm:py-14 bg-surface-subtle border-y border-brand-100/60 overflow-hidden">
      <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-brand-400 mb-8">
        {marqueeTitle}
      </p>

      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--color-surface-subtle), transparent)' }}
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--color-surface-subtle), transparent)' }}
        />

        <div className="flex animate-marquee gap-6 sm:gap-16 w-max">
          {track.map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="flex items-center gap-3 sm:gap-4 px-5 sm:px-8 py-3 bg-white rounded-2xl border border-brand-100/60 shadow-sm shrink-0"
            >
              {brand.logo ? (
                <div className="relative w-24 sm:w-28 h-10 sm:h-12">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-24 sm:w-28 h-10 sm:h-12 flex items-center justify-center">
                  <span className="text-base font-black text-brand-700 tracking-tight">{brand.name}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-black text-brand-950 leading-none">{brand.name}</p>
                {brand.tagline && <p className="text-xs text-brand-500 mt-0.5">{brand.tagline}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
