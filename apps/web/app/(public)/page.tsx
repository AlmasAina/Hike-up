import type { Metadata } from 'next';
import { PackageCards } from '@/components/packages/package-cards';
import { ContactSection } from '@/components/sections/contact-section';
import { CtaBand } from '@/components/sections/cta-band';
import { FaqSection } from '@/components/sections/faq-section';
import { HomeHero } from '@/components/sections/home-hero';
import { HowItWorks } from '@/components/sections/how-it-works';
import { ProjectsSection } from '@/components/sections/projects-section';
import { SectionHeading } from '@/components/sections/section-heading';
import { ServiceCategories, ServicesSection } from '@/components/sections/services-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { TrustBadges } from '@/components/sections/trust-badges';
import { WhyChooseSection } from '@/components/sections/why-choose-section';
import { Button } from '@/components/ui/button';
import { pageMetadata } from '@/lib/seo';
import { getContent, getFaqs, getPackages, getProjects, getServices, getSettings, getTestimonials } from '@/lib/server-api';
import Link from 'next/link';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { ...pageMetadata({ title: settings.seoTitle, description: settings.seoDescription, path: '/' }), title: { absolute: settings.seoTitle } };
}

export default async function HomePage() {
  const [settings, services, content, packages, projects, testimonials, faqs] = await Promise.all([
    getSettings(),
    getServices(),
    getContent('home.'),
    getPackages(),
    getProjects(),
    getTestimonials(),
    getFaqs(),
  ]);

  return (
    <>
      <HomeHero settings={settings} content={content['home.hero']} />
      <TrustBadges settings={settings} />
      <ServicesSection services={services} />
      <WhyChooseSection content={content['home.why_choose']} />
      {packages.packages.length > 0 && (
        <section className="section bg-white" aria-labelledby="packages-heading">
          <div className="container-page">
            <SectionHeading
              id="packages-heading"
              eyebrow="Maintenance packages"
              title="Choose the plan that suits your needs"
              subtitle="Annual maintenance packages combining inspections, emergency support and preventive care."
            />
            <div className="mt-14">
              <PackageCards packages={packages.packages} />
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/packages#compare">Compare packages</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
      <HowItWorks content={content['home.how_it_works']} />
      <ServiceCategories services={services} />
      <ProjectsSection projects={projects} />
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection faqs={faqs} />
      <CtaBand settings={settings} />
      <ContactSection settings={settings} />
    </>
  );
}
