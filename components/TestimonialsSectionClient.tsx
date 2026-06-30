'use client'

import dynamic from 'next/dynamic'

const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), {
  ssr: false,
})

export default function TestimonialsSectionClient({ badge, titleHtml }: { badge?: string; titleHtml?: string } = {}) {
  return <TestimonialsSection badge={badge} titleHtml={titleHtml} />
}
