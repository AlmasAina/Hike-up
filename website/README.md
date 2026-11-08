# HIKE UP — static website

Plain HTML/CSS, no build step and no admin panel. Published to GitHub Pages by
`.github/workflows/website.yml` whenever `website/` changes on `main`.

- Contact details, services, project captions and customer reviews are at the top of
  `script.js` (`CONFIG`, `SERVICES`, `PROJECTS`, `REVIEWS`). `thanks.html` also carries the
  WhatsApp number.
- "Get a Quote" opens WhatsApp with the form's details. The contact form emails
  `hikeupgm@gmail.com` through FormSubmit; the first submission sends an activation email to
  that address, so click its link once.
- The Testimonials section stays hidden until genuine reviews are added to `REVIEWS`, and
  "Our Work" stays hidden until photos are uploaded to `images/projects/`.

## Other photos

| Where | File |
|---|---|
| Top of the page (hero) | `images/hero.jpg` — landscape, about 1400×1050 |
| "Why Choose HIKE UP" | `images/why-us.jpg` — portrait, about 900×1050 |
| "Our Work" gallery | `images/projects/project-1.jpg` … `project-6.jpg` — about 1200×900 |

## Service photos

Upload to `website/images/services/` with exactly these names (JPG, landscape 3:2, about
1200×800, under 400 KB). Until a photo exists the matching `.svg` illustration is shown.

| Service | File name |
|---|---|
| Electrical Services | `electrical-services.jpg` |
| Plumbing Services | `plumbing-services.jpg` |
| AC & HVAC Services | `ac-hvac-services.jpg` |
| Painting Services | `painting-services.jpg` |
| Handyman Services | `handyman-services.jpg` |
| Preventive Maintenance | `preventive-maintenance.jpg` |
| Property Maintenance | `property-maintenance.jpg` |
| Move-In & Move-Out Inspection | `move-in-move-out-inspection.jpg` |
| Emergency Maintenance | `emergency-maintenance.jpg` |
| Building Maintenance | `building-maintenance.jpg` |
