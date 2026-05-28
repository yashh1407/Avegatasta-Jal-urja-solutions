import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Avegatasta Jal-Urja Solutions',
  description: 'Read the latest insights, tips, and news about water heating, solar energy, and pumping solutions from Avegatasta in Nashik.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <h1 className="text-4xl md:text-5xl font-black text-blue-950 mb-4 font-serif">Our Blog</h1>
      <p className="text-lg text-slate-500 max-w-2xl mb-8">
        We're working on bringing you the best insights and guides on water heating, solar energy, and pumping solutions. Stay tuned!
      </p>
      <div className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30">
        Coming Soon
      </div>
    </div>
  );
}
