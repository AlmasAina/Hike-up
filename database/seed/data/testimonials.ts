/**
 * SAMPLE testimonials written for launch so the layout can be reviewed.
 * They are seeded with isSample = true and status = DRAFT so they are NOT shown publicly until an
 * admin reviews them. Replace them with genuine customer reviews in Admin → Testimonials.
 */
export const sampleTestimonials: { name: string; company: string | null; rating: number; review: string }[] = [
  {
    name: 'Sample Customer A',
    company: 'Villa owner (sample)',
    rating: 5,
    review:
      'Sample review: The team explained the issue clearly, arrived on time and left everything clean. Exactly the kind of service we were looking for.',
  },
  {
    name: 'Sample Customer B',
    company: 'Property manager (sample)',
    rating: 5,
    review:
      'Sample review: Having one company handle electrical, plumbing and AC makes managing our units much easier. Communication was excellent.',
  },
  {
    name: 'Sample Customer C',
    company: 'Office tenant (sample)',
    rating: 5,
    review:
      'Sample review: Quick response to an AC problem in our office and a professional technician who fixed it properly.',
  },
];
