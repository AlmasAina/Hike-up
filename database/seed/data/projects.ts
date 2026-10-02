/**
 * DEMO projects (isDemo = true, status = DRAFT). They illustrate the portfolio layout only and are
 * not real completed jobs. Publish them only after replacing with genuine project details & photos.
 */
export const demoProjects: {
  slug: string;
  title: string;
  serviceSlug: string;
  location: string;
  summary: string;
  description: string;
  image: string;
}[] = [
  {
    slug: 'demo-villa-ac-maintenance',
    title: 'Villa AC Preventive Maintenance (Demo)',
    serviceSlug: 'ac-hvac-services',
    location: 'Abu Dhabi',
    summary: 'Demo project showing how an AC preventive maintenance job can be presented.',
    description:
      '<p><strong>Demo content.</strong> Replace with a real project. Describe the property, the problem, the work carried out and the result for the customer.</p>',
    image: '/images/services/ac-hvac-services.svg',
  },
  {
    slug: 'demo-apartment-repaint',
    title: 'Apartment Move-Out Repaint (Demo)',
    serviceSlug: 'painting-services',
    location: 'Abu Dhabi',
    summary: 'Demo project illustrating a painting case study layout.',
    description:
      '<p><strong>Demo content.</strong> Replace with a real project including genuine before/after photos.</p>',
    image: '/images/services/painting-services.svg',
  },
  {
    slug: 'demo-office-electrical-upgrade',
    title: 'Office Lighting Upgrade (Demo)',
    serviceSlug: 'electrical-services',
    location: 'Abu Dhabi',
    summary: 'Demo project illustrating an electrical case study layout.',
    description:
      '<p><strong>Demo content.</strong> Replace with a real project once photos and details are available.</p>',
    image: '/images/services/electrical-services.svg',
  },
];
