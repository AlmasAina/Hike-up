/* HIKE UP website — the things you are most likely to edit are at the top of this file. */

// Contact details. The number is written without "+" or spaces.
const CONFIG = {
  whatsapp: '971547884035',
  whatsappDisplay: '+971 54 788 4035',
  email: 'hikeupgm@gmail.com',
  whatsappMessage: 'Hello HIKE UP General Maintenance, I would like to request a quote.',
};

// Services. Photos go in images/services/<slug>.jpg; until one exists the .svg illustration shows.
const SERVICES = [
  { slug: 'electrical-services', title: 'Electrical Services', text: 'Safe, reliable electrical repairs, installations and fault finding for homes and businesses.' },
  { slug: 'plumbing-services', title: 'Plumbing Services', text: 'Leak repairs, blocked drains, fixture installation and water system maintenance.' },
  { slug: 'ac-hvac-services', title: 'AC & HVAC Services', text: 'AC servicing, troubleshooting and HVAC maintenance to keep your property cool all year.' },
  { slug: 'painting-services', title: 'Painting Services', text: 'Interior and exterior painting with proper surface preparation for a clean, durable finish.' },
  { slug: 'handyman-services', title: 'Handyman Services', text: 'General repairs, installations and odd jobs handled by a skilled, well-equipped handyman.' },
  { slug: 'preventive-maintenance', title: 'Preventive Maintenance', text: 'Planned inspections and servicing that reduce the cost of unexpected repairs.' },
  { slug: 'property-maintenance', title: 'Property Maintenance', text: 'Ongoing support for villas, apartments and commercial units — one team for every trade.' },
  { slug: 'move-in-move-out-inspection', title: 'Move-In & Move-Out Inspection', text: 'Detailed property condition inspections at the start and end of a tenancy.' },
  { slug: 'emergency-maintenance', title: 'Emergency Maintenance', text: 'Urgent help for leaks, power failures, AC breakdowns and problems that cannot wait — 24/7.' },
  { slug: 'building-maintenance', title: 'Building Maintenance', text: 'Maintenance support for residential buildings, offices and commercial premises.' },
];

// "Our Work" photos: images/projects/<file>. Cards whose photo is missing are hidden, and the whole
// section stays hidden until at least one photo exists. Titles and places are optional.
const PROJECTS = [
  { file: 'project-1.jpg', title: '', place: '' },
  { file: 'project-2.jpg', title: '', place: '' },
  { file: 'project-3.jpg', title: '', place: '' },
  { file: 'project-4.jpg', title: '', place: '' },
  { file: 'project-5.jpg', title: '', place: '' },
  { file: 'project-6.jpg', title: '', place: '' },
];

// Customer reviews — add GENUINE reviews only, with the customer's permission, e.g.
// { name: 'Ahmed K.', role: 'Villa owner, Khalifa City', rating: 5, text: 'Fast and tidy work…' },
// The Testimonials section stays hidden while this list is empty.
const REVIEWS = [];

/* ───────────────────────────── page behaviour ───────────────────────────── */

const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text || CONFIG.whatsappMessage)}`;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Services grid and quote-form options
const grid = document.getElementById('services-grid');
const serviceSelect = document.getElementById('quote-service');
grid.innerHTML = SERVICES.map((s) => `
  <article class="service-card reveal">
    <div class="service-media">
      <img src="images/services/${s.slug}.jpg" onerror="this.onerror=null;this.src='images/services/${s.slug}.svg'" alt="${escapeHtml(s.title)}" width="600" height="400" loading="lazy">
    </div>
    <div class="service-body">
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.text)}</p>
      <div class="service-actions">
        <a class="link-quote" href="#quote" data-service="${escapeHtml(s.title)}">Get a quote <svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a class="link-wa" href="${waLink(`Hello HIKE UP, I need a quote for ${s.title}.`)}" target="_blank" rel="noopener" aria-label="Ask about ${escapeHtml(s.title)} on WhatsApp"><svg class="i" aria-hidden="true"><use href="#i-whatsapp"/></svg></a>
      </div>
    </div>
  </article>`).join('');
serviceSelect.innerHTML = '<option value="">Select a service</option>' +
  SERVICES.map((s) => `<option>${escapeHtml(s.title)}</option>`).join('') + '<option>Other / not sure</option>';

grid.addEventListener('click', (e) => {
  const link = e.target.closest('[data-service]');
  if (link) serviceSelect.value = link.dataset.service;
});

// WhatsApp, email and phone text everywhere on the page
document.querySelectorAll('[data-wa]').forEach((a) => { a.href = waLink(); });
document.querySelectorAll('[data-wa-text]').forEach((a) => { a.href = waLink(a.dataset.waText); });
document.querySelectorAll('[data-phone-text]').forEach((a) => { a.textContent = CONFIG.whatsappDisplay; });
document.querySelectorAll('[data-email]').forEach((a) => { a.href = `mailto:${CONFIG.email}`; a.textContent = CONFIG.email; });
const contactForm = document.getElementById('contact-form');
contactForm.action = `https://formsubmit.co/${CONFIG.email}`;
contactForm.querySelector('input[name="_next"]').value = new URL('thanks.html', location.href).href;

// Our Work: show only the photos that exist
const workGrid = document.getElementById('work-grid');
PROJECTS.forEach((p) => {
  const img = new Image();
  img.onload = () => {
    workGrid.insertAdjacentHTML('beforeend', `
      <figure class="work-card reveal is-visible">
        <img src="images/projects/${p.file}" alt="${escapeHtml(p.title || 'HIKE UP maintenance work')}" loading="lazy">
        ${p.title || p.place ? `<figcaption><strong>${escapeHtml(p.title)}</strong><span>${escapeHtml(p.place)}</span></figcaption>` : ''}
      </figure>`);
    document.getElementById('work').hidden = false;
    document.querySelector('[data-section-link="work"]').hidden = false;
  };
  img.src = `images/projects/${p.file}`;
});
document.querySelector('[data-section-link="work"]').hidden = true;

// Testimonials
const reviewsLink = document.querySelector('[data-section-link="reviews"]');
if (REVIEWS.length) {
  document.getElementById('reviews-grid').innerHTML = REVIEWS.map((r) => `
    <figure class="review reveal">
      <div class="stars" aria-label="${r.rating} out of 5">${'<svg class="i" aria-hidden="true"><use href="#i-star"/></svg>'.repeat(r.rating)}</div>
      <blockquote>“${escapeHtml(r.text)}”</blockquote>
      <figcaption><span class="avatar">${escapeHtml(r.name.charAt(0))}</span><span><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(r.role || '')}</small></span></figcaption>
    </figure>`).join('');
  document.getElementById('reviews').hidden = false;
} else {
  reviewsLink.hidden = true;
}

// Quote form → WhatsApp
document.getElementById('quote-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const v = (n) => f.elements[n].value.trim();
  const error = document.getElementById('quote-error');
  if (!v('name') || !v('phone') || !v('service') || !v('details')) { error.hidden = false; return; }
  error.hidden = true;
  const lines = [
    `Hello HIKE UP, I would like a quote${f.elements.urgent.checked ? ' (URGENT)' : ''}.`,
    '',
    `Name: ${v('name')}`,
    `Phone: ${v('phone')}`,
    `Service: ${v('service')}`,
    `Property: ${v('property')}`,
  ];
  if (v('area')) lines.push(`Area: ${v('area')}`);
  lines.push(`Details: ${v('details')}`);
  window.open(waLink(lines.join('\n')), '_blank', 'noopener');
});

// Mobile menu
const toggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) { document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); }
});

// Header shadow and back-to-top button
const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal-on-scroll animations
const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); observer.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  : null;
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.setProperty('--stagger', `${(i % 4) * 80}ms`);
  if (observer) observer.observe(el); else el.classList.add('is-visible');
});

document.getElementById('year').textContent = new Date().getFullYear();
