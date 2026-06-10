'use client'

import dynamic from 'next/dynamic'

const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), {
  ssr: false,
})

export default function TestimonialsSectionClient(props: any) {
  return <TestimonialsSection {...props} />
}
