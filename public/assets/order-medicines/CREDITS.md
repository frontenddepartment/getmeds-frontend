# Order Medicines hub — audience card photos

Stock photography for the four audience cards on `/order-medicines`.

All four are **Unsplash License** (free for commercial use, no permission or attribution
required — https://unsplash.com/license). They were sourced with the `?license=free`
filter specifically to keep Unsplash+ / premium images out, which are *not* free for
commercial use. If any of these is ever replaced, check the replacement the same way:
a `plus.unsplash.com/premium_photo-…` URL is a paid image and must not be used here.

Files are committed to the repo rather than hot-linked to the Unsplash CDN, so the page
carries no third-party runtime dependency — nothing here breaks if Unsplash reorganises
its CDN, and no visitor's IP is handed to a third party to render the hub.

They are *not* in the service worker precache: `globPatterns` in vite.config.js covers
only js/css/html (plus the icons and fallback.jpg), so these load over the network like
any other image rather than adding ~210 KB to every PWA install. That is deliberate and
matches how the rest of the site's photography is treated.

Each was downloaded at 800×450 (2x the card's rendered band) with the crop noted below.

| File | Source | Crop | Subject |
|---|---|---|---|
| `patients.jpg` | https://images.unsplash.com/photo-1625690987114-86f5af994b49 | `entropy` | Older couple walking arm in arm |
| `doctors.jpg` | https://images.unsplash.com/photo-1576091160550-2173dba999ef | `faces,center` | Hands at a laptop beside a stethoscope |
| `distributors.jpg` | https://images.unsplash.com/photo-1580281657527-47f249e8f4df | `entropy` | Pharmacist at a medicine shelf |
| `hospitals.jpg` | https://images.unsplash.com/photo-1648224394432-8830fec15349 | `entropy` | IV bag, infusion pump and hospital bed |

## Why these, and what was rejected

Candidates were downloaded and looked at before being committed, which is worth repeating
for any replacement — the alt text alone is not enough to judge one:

- Two otherwise-good doctor photos were rejected because the automatic crop cut the head
  off and left a **real clinician's embroidered name** (and another clinic's logo) legible
  across the chest. On a pharmaceutical site that reads as a staff photo of someone who
  does not work here.
- A tight portrait headshot was rejected for the same reason: it implies the person is
  Getmeds staff.
- A glass-facade "hospital building" was rejected because it reads as a generic office.
- A hospital corridor was rejected after being rendered in the card: it was so pale it
  washed out against the white card and read as an empty band. Contrast against the
  card, not just subject matter, is part of the choice here.

The three chosen people-photos show no identifiable face and no third-party branding.
