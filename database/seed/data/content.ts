/** Editable page content (Admin → Page Content). Original copy written for HIKE UP. */

export interface SeedContentSection {
  key: string;
  title?: string;
  subtitle?: string;
  body?: string;
  items?: { title: string; description?: string; icon?: string }[];
}

export const contentSections: SeedContentSection[] = [
  {
    key: 'home.hero',
    title: 'Reliable General Maintenance for Homes & Businesses',
    subtitle:
      'Professional electrical, plumbing, HVAC, painting and handyman services across Abu Dhabi — available 24/7.',
    items: [
      { title: '24/7 support', icon: 'clock' },
      { title: 'Residential & commercial', icon: 'building-2' },
      { title: 'Preventive maintenance plans', icon: 'shield-check' },
    ],
  },
  {
    key: 'home.why_choose',
    title: 'Why Choose HIKE UP?',
    subtitle: 'Dependable maintenance built on clear communication and quality workmanship.',
    items: [
      { title: '24/7 Availability', description: 'Reach us any time for urgent maintenance needs.', icon: 'clock' },
      { title: 'Professional Team', description: 'Skilled technicians who respect your property.', icon: 'hard-hat' },
      { title: 'Fast Response', description: 'Requests are reviewed promptly and emergencies prioritised.', icon: 'zap' },
      { title: 'Quality Work', description: 'Careful workmanship and a tidy finish on every job.', icon: 'badge-check' },
      { title: 'Preventive Maintenance', description: 'Planned care that reduces costly breakdowns.', icon: 'shield-check' },
      { title: 'Residential & Commercial', description: 'Villas, apartments, offices and buildings.', icon: 'building-2' },
      { title: 'Reliable Service', description: 'We do what we say, when we say we will.', icon: 'handshake' },
      { title: 'Customer Focused', description: 'Clear quotes, updates and follow-up after every job.', icon: 'heart-handshake' },
    ],
  },
  {
    key: 'about.intro',
    title: 'About HIKE UP General Maintenance',
    subtitle: 'Property care you can rely on — for homes and businesses across Abu Dhabi.',
    body:
      '<p>HIKE UP General Maintenance is an Abu Dhabi based maintenance company providing electrical, plumbing, AC & HVAC, painting and handyman services for residential and commercial properties.</p><p>We believe property maintenance should be simple: one trusted team, clear communication, honest recommendations and work that is done properly the first time. From a single repair to a full preventive maintenance package, we look after your property as if it were our own.</p>',
  },
  {
    key: 'about.mission',
    title: 'Our Mission',
    body:
      '<p>To keep homes and businesses safe, comfortable and fully functional through responsive, high-quality maintenance and proactive property care.</p>',
  },
  {
    key: 'about.vision',
    title: 'Our Vision',
    body:
      '<p>To be the maintenance partner property owners and occupants in the UAE trust first — known for reliability, professionalism and long-term relationships.</p>',
  },
  {
    key: 'about.values',
    title: 'Our Values',
    items: [
      { title: 'Reliability', description: 'We show up, communicate clearly and follow through.', icon: 'handshake' },
      { title: 'Professionalism', description: 'Respect for your time, your property and your privacy.', icon: 'badge-check' },
      { title: 'Quality', description: 'We fix the root cause and finish every job neatly.', icon: 'sparkles' },
      { title: 'Safety', description: 'Safe working practices on every visit.', icon: 'shield-check' },
      { title: 'Transparency', description: 'Clear quotations and honest recommendations.', icon: 'eye' },
      { title: 'Care', description: 'Long-term relationships built on looking after customers.', icon: 'heart-handshake' },
    ],
  },
  {
    key: 'about.approach',
    title: 'Our Approach',
    body:
      '<p>Every job starts with understanding the problem. We review your request, ask the right questions and recommend a practical solution before any work begins. Our technicians then complete the job carefully and keep you informed throughout.</p><p>For ongoing peace of mind, our preventive maintenance packages combine scheduled inspections with responsive repairs, helping you avoid unexpected breakdowns and protect the value of your property.</p>',
  },
  {
    key: 'about.why_trust',
    title: 'Why Customers Trust Us',
    items: [
      { title: 'One team for every trade', description: 'Electrical, plumbing, AC, painting and handyman work under one roof.', icon: 'wrench' },
      { title: 'Licensed in Abu Dhabi', description: 'A registered Abu Dhabi business providing building maintenance.', icon: 'file-check' },
      { title: 'Clear communication', description: 'Track your requests online or speak to us directly.', icon: 'message-circle' },
      { title: 'Long-term care', description: 'Maintenance packages designed for ongoing property care.', icon: 'calendar-clock' },
    ],
  },
  {
    key: 'home.how_it_works',
    title: 'How It Works',
    subtitle: 'No online booking or payment — just tell us what you need and our team takes it from there.',
    items: [
      { title: 'Tell Us What You Need', description: 'Describe the issue and add photos if you can.', icon: 'message-square-text' },
      { title: 'Submit Your Request', description: 'Use the quote form, WhatsApp or a phone call.', icon: 'send' },
      { title: 'Our Team Reviews It', description: 'We assess the details and prepare next steps.', icon: 'search-check' },
      { title: 'We Contact You', description: 'We confirm scope, quotation and timing with you.', icon: 'phone-call' },
      { title: 'Service Is Arranged', description: 'A qualified technician is scheduled for the job.', icon: 'calendar-check' },
      { title: 'Job Completed', description: 'Work is finished, checked and followed up.', icon: 'circle-check-big' },
    ],
  },
];
