/**
 * Initial service catalogue. Content is original copy written for HIKE UP and is fully editable
 * in Admin → Services after seeding. Images are original SVG illustrations shipped with the web app.
 */

export interface SeedService {
  slug: string;
  title: string;
  icon: string;
  featured: boolean;
  shortDescription: string;
  introduction: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  coverage: string[];
  benefits: { title: string; description: string }[];
  process: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

const standardProcess = (subject: string): SeedService['process'] => [
  {
    title: 'Tell us what you need',
    description: `Share the ${subject} issue through our quote form, WhatsApp or a quick call. Photos help us understand the job.`,
  },
  {
    title: 'Assessment & quotation',
    description: 'Our team reviews the details, asks any follow-up questions and prepares a clear quotation.',
  },
  {
    title: 'Scheduled visit',
    description: 'Once you approve, we agree a convenient time and a qualified technician attends with the right tools.',
  },
  {
    title: 'Completion & follow-up',
    description: 'We complete the work, walk you through what was done and remain available for any follow-up.',
  },
];

export const services: SeedService[] = [
  {
    slug: 'electrical-services',
    title: 'Electrical Services',
    icon: 'zap',
    featured: true,
    shortDescription:
      'Safe, reliable electrical repairs, installations and fault finding for homes and businesses in Abu Dhabi.',
    introduction:
      'From a tripping breaker to new lighting, our electrical maintenance team keeps your property powered safely and efficiently.',
    description:
      '<p>Electrical faults are disruptive and can be dangerous if left unattended. HIKE UP provides electrical maintenance across residential and commercial properties in Abu Dhabi, combining careful fault diagnosis with tidy, standards-minded workmanship.</p><p>Whether you need a single socket replaced, a lighting upgrade or a planned electrical maintenance programme for a building, we assess the root cause first and recommend the right fix — not just a temporary patch.</p>',
    seoTitle: 'Electrical Maintenance Abu Dhabi | HIKE UP General Maintenance',
    seoDescription:
      'Electrical repairs, fault diagnosis, lighting and socket installation and preventive electrical maintenance for homes and businesses in Abu Dhabi.',
    coverage: [
      'Electrical repairs',
      'Electrical fault diagnosis',
      'Lighting installation',
      'Switch and socket installation',
      'Electrical maintenance',
      'Power troubleshooting',
      'Preventive electrical maintenance',
    ],
    benefits: [
      { title: 'Root-cause diagnosis', description: 'We trace faults properly so problems do not keep coming back.' },
      { title: 'Safety first', description: 'Work is carried out carefully with isolation and testing procedures.' },
      { title: 'Clean finish', description: 'Neat installations and a tidy work area once the job is done.' },
      { title: 'Planned maintenance', description: 'Scheduled checks help catch wear before it becomes a failure.' },
    ],
    process: standardProcess('electrical'),
    faqs: [
      {
        question: 'Can you find the cause of a breaker that keeps tripping?',
        answer:
          'Yes. Our technicians test circuits and connected appliances to identify overloads, faulty devices or wiring issues, then recommend the appropriate repair.',
      },
      {
        question: 'Do you install new light fittings and sockets?',
        answer:
          'Yes, we install and replace lighting, switches and sockets for apartments, villas, offices and commercial units.',
      },
    ],
  },
  {
    slug: 'plumbing-services',
    title: 'Plumbing Services',
    icon: 'droplets',
    featured: true,
    shortDescription:
      'Leak repairs, blocked drains, fixture installation and water system maintenance by experienced plumbers.',
    introduction:
      'Leaks and blockages can damage your property quickly. Our plumbing team responds promptly and fixes problems properly.',
    description:
      '<p>Water damage is one of the most common — and most avoidable — causes of costly property repairs. HIKE UP handles plumbing maintenance for villas, apartments, offices and commercial buildings in Abu Dhabi.</p><p>We repair leaks, clear blockages, replace fixtures and maintain water systems, and we can set up preventive plumbing checks so small drips are caught before they become major issues.</p>',
    seoTitle: 'Plumbing Services Abu Dhabi | HIKE UP General Maintenance',
    seoDescription:
      'Leak and pipe repair, drain blockages, faucet installation, bathroom plumbing and preventive plumbing maintenance in Abu Dhabi.',
    coverage: [
      'Leak repair',
      'Pipe repair',
      'Faucet installation',
      'Drain blockage',
      'Water system maintenance',
      'Bathroom plumbing',
      'Preventive plumbing maintenance',
    ],
    benefits: [
      { title: 'Prompt response', description: 'Leaks are prioritised to limit damage to your property.' },
      { title: 'Lasting repairs', description: 'Quality fittings and careful workmanship for repairs that hold.' },
      { title: 'Less disruption', description: 'We work cleanly and keep you informed throughout.' },
      { title: 'Preventive checks', description: 'Routine inspections reduce the risk of sudden failures.' },
    ],
    process: standardProcess('plumbing'),
    faqs: [
      {
        question: 'Do you handle blocked drains?',
        answer:
          'Yes. We clear blocked sinks, showers, floor drains and toilets and advise on how to prevent the blockage from returning.',
      },
      {
        question: 'Can you replace bathroom and kitchen fixtures?',
        answer: 'Yes, we install and replace faucets, mixers, shower sets, toilets and related fittings.',
      },
    ],
  },
  {
    slug: 'ac-hvac-services',
    title: 'AC & HVAC Services',
    icon: 'air-vent',
    featured: true,
    shortDescription:
      'AC servicing, troubleshooting and HVAC maintenance to keep your property cool and efficient all year.',
    introduction:
      'In the UAE climate, dependable cooling is essential. We keep AC and HVAC systems clean, efficient and running smoothly.',
    description:
      '<p>Air conditioning works hard in Abu Dhabi, and a poorly maintained unit uses more energy, cools less effectively and is more likely to break down in peak summer. HIKE UP provides AC and HVAC maintenance for residential and commercial properties.</p><p>Our services range from routine servicing and filter cleaning to troubleshooting cooling problems and planned preventive maintenance for larger HVAC systems.</p>',
    seoTitle: 'AC & HVAC Maintenance Abu Dhabi | HIKE UP General Maintenance',
    seoDescription:
      'AC maintenance, servicing, troubleshooting, filter cleaning and preventive HVAC maintenance for homes and businesses in Abu Dhabi.',
    coverage: [
      'AC maintenance',
      'AC troubleshooting',
      'AC servicing',
      'HVAC maintenance',
      'Filter cleaning',
      'Cooling performance inspection',
      'Preventive HVAC maintenance',
    ],
    benefits: [
      { title: 'Better cooling', description: 'Clean coils and filters help your system cool as designed.' },
      { title: 'Energy efficiency', description: 'Well-maintained units typically consume less power.' },
      { title: 'Healthier air', description: 'Regular filter cleaning reduces dust circulating indoors.' },
      { title: 'Fewer breakdowns', description: 'Preventive servicing reduces the risk of failures in summer.' },
    ],
    process: standardProcess('AC'),
    faqs: [
      {
        question: 'How often should my AC be serviced?',
        answer:
          'For most UAE properties we recommend periodic servicing and filter cleaning, with frequency depending on usage and environment. We can advise after an inspection.',
      },
      {
        question: 'My AC is running but not cooling. Can you help?',
        answer:
          'Yes. We inspect airflow, filters, coils and system performance to diagnose the cause and recommend the right repair.',
      },
    ],
  },
  {
    slug: 'painting-services',
    title: 'Painting Services',
    icon: 'paint-roller',
    featured: true,
    shortDescription:
      'Interior and exterior painting with proper surface preparation for a clean, durable finish.',
    introduction:
      'A fresh coat of paint transforms a space. We focus on preparation and detail for results that look great and last.',
    description:
      '<p>Good painting starts long before the first coat. HIKE UP prepares surfaces properly — filling, sanding and priming where needed — so the finish is smooth and durable.</p><p>We paint villas, apartments, offices and commercial spaces, from full repaints and move-out refreshes to touch-ups that keep a property looking its best between tenancies.</p>',
    seoTitle: 'Painting Services Abu Dhabi | HIKE UP General Maintenance',
    seoDescription:
      'Interior and exterior painting, wall preparation, touch-ups and residential and commercial painting in Abu Dhabi.',
    coverage: [
      'Interior painting',
      'Exterior painting',
      'Wall preparation',
      'Touch-up painting',
      'Commercial painting',
      'Residential painting',
    ],
    benefits: [
      { title: 'Proper preparation', description: 'Surfaces are repaired and primed for an even finish.' },
      { title: 'Protected spaces', description: 'Floors and furniture are covered and protected.' },
      { title: 'Neat detailing', description: 'Clean cut-in lines around edges, frames and fittings.' },
      { title: 'Tenancy ready', description: 'Ideal for move-in and move-out refreshes.' },
    ],
    process: standardProcess('painting'),
    faqs: [
      {
        question: 'Do you repair cracks before painting?',
        answer: 'Yes, minor cracks and holes are filled and sanded as part of surface preparation.',
      },
      {
        question: 'Can you paint occupied homes and offices?',
        answer:
          'Yes. We plan the work in sections, protect furniture and keep the area tidy to minimise disruption.',
      },
    ],
  },
  {
    slug: 'handyman-services',
    title: 'Handyman Services',
    icon: 'wrench',
    featured: true,
    shortDescription:
      'General repairs, installations and odd jobs handled quickly by a skilled, well-equipped handyman.',
    introduction:
      'Small jobs add up. Our handyman service takes care of the repairs and installations on your list.',
    description:
      '<p>Loose door handles, shelves to mount, furniture to assemble — the small jobs around a property are easy to postpone. HIKE UP handyman services take care of them efficiently, so your home or workplace stays in good order.</p><p>Our technicians arrive with the tools needed for common repairs and installations and can bundle several tasks into one visit.</p>',
    seoTitle: 'Handyman Services Abu Dhabi | HIKE UP General Maintenance',
    seoDescription:
      'General repairs, furniture assembly, fixture installation, door repairs and hardware replacement in Abu Dhabi.',
    coverage: [
      'General repairs',
      'Furniture assembly',
      'Fixtures installation',
      'Minor property repairs',
      'Door repairs',
      'Hardware replacement',
      'General maintenance',
    ],
    benefits: [
      { title: 'One visit, many tasks', description: 'Combine several small jobs into a single appointment.' },
      { title: 'Well equipped', description: 'Technicians carry tools for common repairs and installations.' },
      { title: 'Careful work', description: 'We respect your space and clean up afterwards.' },
      { title: 'Flexible support', description: 'Suitable for homes, rentals, offices and retail units.' },
    ],
    process: standardProcess('repair'),
    faqs: [
      {
        question: 'Can I book several small jobs together?',
        answer:
          'Yes. List all the tasks in your quote request and we will plan them into one visit wherever possible.',
      },
      {
        question: 'Do you assemble furniture?',
        answer: 'Yes, we assemble and install flat-pack furniture, shelving, curtain rails and similar items.',
      },
    ],
  },
  {
    slug: 'preventive-maintenance',
    title: 'Preventive Maintenance',
    icon: 'shield-check',
    featured: true,
    shortDescription:
      'Planned inspections and servicing that keep systems reliable and reduce the cost of unexpected repairs.',
    introduction:
      'The best repair is the one you never need. Preventive maintenance protects your property and your budget.',
    description:
      '<p>Preventive maintenance means checking and servicing key systems on a schedule — before something fails. HIKE UP builds preventive maintenance plans covering electrical, plumbing, AC and general building elements.</p><p>Regular visits help identify wear early, extend equipment life and reduce emergency call-outs. Preventive visits are included in our maintenance packages.</p>',
    seoTitle: 'Preventive Maintenance Abu Dhabi | HIKE UP General Maintenance',
    seoDescription:
      'Planned preventive maintenance for electrical, plumbing, AC/HVAC and building systems in Abu Dhabi homes and commercial properties.',
    coverage: [
      'Scheduled property inspections',
      'AC and HVAC servicing',
      'Electrical system checks',
      'Plumbing and water system checks',
      'Minor repairs identified during visits',
      'Inspection reporting',
    ],
    benefits: [
      { title: 'Fewer surprises', description: 'Catch issues early, before they become emergencies.' },
      { title: 'Longer asset life', description: 'Well-maintained equipment lasts longer.' },
      { title: 'Predictable costs', description: 'Planned work is easier to budget for than breakdowns.' },
      { title: 'Peace of mind', description: 'Know your property is being looked after.' },
    ],
    process: standardProcess('maintenance'),
    faqs: [
      {
        question: 'What is checked during a preventive maintenance visit?',
        answer:
          'Typically AC units, electrical points, plumbing fixtures and general building elements. The checklist is agreed with you based on your property.',
      },
      {
        question: 'Is preventive maintenance included in your packages?',
        answer: 'Yes, preventive maintenance services and visits are included in our maintenance packages.',
      },
    ],
  },
  {
    slug: 'property-maintenance',
    title: 'Property Maintenance',
    icon: 'house',
    featured: false,
    shortDescription:
      'Ongoing maintenance support for villas, apartments and commercial units — one team for every trade.',
    introduction:
      'One point of contact for all the maintenance your property needs, from routine upkeep to urgent repairs.',
    description:
      '<p>Managing several contractors for one property takes time. HIKE UP offers complete property maintenance with a single team covering electrical, plumbing, AC, painting and handyman work.</p><p>Property owners, landlords and tenants can rely on us for routine upkeep, repairs between tenancies and long-term maintenance packages tailored to the property.</p>',
    seoTitle: 'Property Maintenance Abu Dhabi | HIKE UP General Maintenance',
    seoDescription:
      'Complete property maintenance for villas, apartments, offices and commercial properties in Abu Dhabi with one reliable team.',
    coverage: [
      'Routine property upkeep',
      'Multi-trade repairs',
      'Between-tenancy maintenance',
      'Maintenance packages',
      'Landlord and tenant support',
      'Condition reporting',
    ],
    benefits: [
      { title: 'Single point of contact', description: 'One team coordinates every trade.' },
      { title: 'Consistent standards', description: 'The same quality across every job.' },
      { title: 'Package options', description: 'Bronze, Silver and Gold plans to suit your needs.' },
      { title: 'Clear communication', description: 'Updates from request to completion.' },
    ],
    process: standardProcess('property'),
    faqs: [
      {
        question: 'Do you work with landlords and property managers?',
        answer: 'Yes, we support owners, landlords, property managers and tenants.',
      },
      {
        question: 'Can you maintain more than one property?',
        answer: 'Yes. Contact us with the details and we will propose a suitable maintenance arrangement.',
      },
    ],
  },
  {
    slug: 'move-in-move-out-inspection',
    title: 'Move-In & Move-Out Inspection',
    icon: 'clipboard-check',
    featured: false,
    shortDescription:
      'Detailed property condition inspections at the start and end of a tenancy, with clear reporting.',
    introduction:
      'Start and end every tenancy with clarity. Our inspections record the property condition so everyone knows where they stand.',
    description:
      '<p>A thorough inspection at move-in and move-out protects landlords and tenants alike. HIKE UP inspects electrical points, plumbing, AC, walls, doors, fixtures and fittings and records the condition of the property.</p><p>Where issues are found, we can quote for repairs and handle the work so the property is ready for the next occupant.</p>',
    seoTitle: 'Move-In & Move-Out Inspection Abu Dhabi | HIKE UP',
    seoDescription:
      'Move-in and move-out property inspections in Abu Dhabi covering electrical, plumbing, AC, walls and fixtures, with repair support.',
    coverage: [
      'Electrical points and lighting check',
      'Plumbing and fixtures check',
      'AC operation check',
      'Walls, doors and windows check',
      'Condition notes and photos',
      'Repair recommendations',
    ],
    benefits: [
      { title: 'Clear records', description: 'Documented condition at handover.' },
      { title: 'Fewer disputes', description: 'Shared understanding between landlord and tenant.' },
      { title: 'Repair ready', description: 'We can fix identified issues quickly.' },
      { title: 'Included in packages', description: 'Part of every HIKE UP maintenance package.' },
    ],
    process: standardProcess('inspection'),
    faqs: [
      {
        question: 'What do I receive after the inspection?',
        answer: 'You receive a summary of the property condition with notes on any issues found.',
      },
      {
        question: 'Can you carry out the repairs found during inspection?',
        answer: 'Yes. We can quote for and complete the repairs so the property is ready for handover.',
      },
    ],
  },
  {
    slug: 'emergency-maintenance',
    title: 'Emergency Maintenance',
    icon: 'siren',
    featured: false,
    shortDescription:
      'Urgent help for leaks, power failures, AC breakdowns and other problems that cannot wait — 24/7.',
    introduction:
      'When something goes wrong unexpectedly, contact us any time. We aim to respond quickly and make the situation safe.',
    description:
      '<p>Burst pipes, power outages and AC failures do not wait for business hours. HIKE UP provides emergency maintenance support 24/7 for residential and commercial properties in Abu Dhabi.</p><p>Call or WhatsApp us with the details. Our team will advise on immediate safety steps and arrange a technician as quickly as possible.</p>',
    seoTitle: 'Emergency Maintenance Abu Dhabi 24/7 | HIKE UP',
    seoDescription:
      '24/7 emergency maintenance in Abu Dhabi for leaks, electrical failures, AC breakdowns and urgent property repairs.',
    coverage: [
      'Water leaks and burst pipes',
      'Power failures and electrical faults',
      'AC breakdowns',
      'Blocked drains and overflows',
      'Door and lock issues',
      'Making the area safe',
    ],
    benefits: [
      { title: 'Available 24/7', description: 'Contact us any time, day or night.' },
      { title: 'Fast coordination', description: 'We prioritise urgent issues to limit damage.' },
      { title: 'Safety guidance', description: 'Immediate advice while a technician is on the way.' },
      { title: 'Follow-up repairs', description: 'Permanent fixes arranged after the emergency.' },
    ],
    process: [
      { title: 'Call or WhatsApp us', description: 'Contact us directly for emergencies — it is the fastest route.' },
      { title: 'Immediate guidance', description: 'We advise on safety steps such as isolating water or power.' },
      { title: 'Technician dispatched', description: 'A technician is arranged as quickly as possible.' },
      { title: 'Repair & follow-up', description: 'We resolve the issue and arrange any follow-up work.' },
    ],
    faqs: [
      {
        question: 'How do I report an emergency?',
        answer:
          'Call or WhatsApp us directly for emergencies — this is the fastest way to reach the team. Online forms are best for non-urgent requests.',
      },
      {
        question: 'Is emergency maintenance included in packages?',
        answer: 'Yes, emergency maintenance is included in all HIKE UP maintenance packages.',
      },
    ],
  },
  {
    slug: 'building-maintenance',
    title: 'Building Maintenance',
    icon: 'building-2',
    featured: false,
    shortDescription:
      'Maintenance support for residential buildings, offices and commercial premises across Abu Dhabi.',
    introduction:
      'Keep common areas, building systems and tenant spaces in good working order with planned and reactive maintenance.',
    description:
      '<p>Buildings need consistent care to stay safe, comfortable and attractive to tenants. HIKE UP provides building maintenance covering MEP elements, common areas, painting and general repairs.</p><p>We combine planned preventive maintenance with responsive repairs, helping owners and facility managers maintain their properties to a consistent standard.</p>',
    seoTitle: 'Building Maintenance Abu Dhabi | HIKE UP General Maintenance',
    seoDescription:
      'Building maintenance in Abu Dhabi: electrical, plumbing, HVAC, painting and general repairs for residential and commercial buildings.',
    coverage: [
      'Common area maintenance',
      'Electrical and lighting maintenance',
      'Plumbing and drainage maintenance',
      'HVAC maintenance',
      'Painting and touch-ups',
      'General building repairs',
    ],
    benefits: [
      { title: 'Planned & reactive', description: 'Scheduled maintenance plus responsive repairs.' },
      { title: 'Multi-trade team', description: 'One provider for the building’s core systems.' },
      { title: 'Tenant satisfaction', description: 'Well-kept buildings keep occupants happy.' },
      { title: 'Transparent updates', description: 'Track requests from submission to completion.' },
    ],
    process: standardProcess('building'),
    faqs: [
      {
        question: 'Do you maintain commercial buildings?',
        answer: 'Yes, we support residential buildings, offices and commercial premises.',
      },
      {
        question: 'Can you provide a maintenance plan for our building?',
        answer: 'Yes. Contact us with the building details and we will discuss a suitable plan.',
      },
    ],
  },
];
