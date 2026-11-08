# HIKE UP — static website

Plain HTML/CSS, no build step and no admin panel. Published to GitHub Pages by
`.github/workflows/website.yml` whenever `website/` changes on `main`.

- Contact details (phone/WhatsApp `971547884035`, email `hikeupgm@gmail.com`) are written in
  `index.html` and `thanks.html`; search and replace every match to change them.
- The contact form posts to FormSubmit, which emails the address in the form's `action`.
  The first submission sends an activation email to that address; click its link once.

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
