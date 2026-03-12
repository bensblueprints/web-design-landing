# Dentist Website Template — Developer Handoff

**Template:** `dentist/firstdental/`
**Live Demo:** https://website.advancedmarketing.co/dentist/firstdental/
**Last Updated:** 2026-03-12

---

## Quick Start — Spinning Up a New Client

1. **Duplicate** `dentist/firstdental/` → `dentist/{clientslug}/`
2. **Find & replace** the items listed in the "What to Change" section below
3. **Swap photos** (doctor headshots, hero background)
4. **Deploy** to Netlify under `website.advancedmarketing.co/dentist/{clientslug}/`
5. **Done** — takes ~30 minutes per client

---

## File Structure

```
dentist/{clientslug}/
├── index.html              ← Main landing page (single file, all CSS/JS inline)
├── kevin.jpg               ← Doctor 1 headshot (swap per client)
├── suji.jpg                ← Doctor 2 headshot (swap per client)
├── eileen.png              ← Doctor 3 headshot (swap per client)
├── generate-services.js    ← Node script to regenerate service pages (optional)
└── services/
    ├── cleanings.html
    ├── fillings.html
    ├── emergency.html
    ├── implants.html
    ├── braces.html
    ├── crowns.html
    └── root-canals.html
```

**No build step.** No frameworks, no dependencies, no npm. Pure HTML/CSS/JS. Just edit and deploy.

---

## What to Change Per Client

### 1. Practice Info (find & replace across all 8 HTML files)

| Find | Replace With |
|------|-------------|
| `First Dental` | Client practice name |
| `(410) 323-2875` | Client phone number |
| `tel:4103232875` | `tel:{digits only}` |
| `6080 Falls Rd, Suite 102` | Client street address |
| `Baltimore, MD 21209` | Client city, state, zip |
| `Baltimore` (in copy) | Client city name |
| `firstdentalmd.com` | Client existing website (if linking) |
| `Mon – Fri: 8am – 5pm` | Client hours |
| `Saturday: By Appt` | Client Saturday hours |
| `Sunday: Closed` | Client Sunday hours |

### 2. Doctor Profiles (index.html only)

Located in the `<!-- ABOUT -->` section (~line 670). Each doctor card has:

```html
<div class="doc">
    <img src="kevin.jpg" alt="Dr. Kevin Son">
    <h3>Dr. Kevin Son</h3>
    <p class="doc-title">General Dentist</p>
    <p class="doc-bio">University of Maryland School of Dentistry...</p>
</div>
```

**For each doctor, update:**
- Headshot image file (jpg/png, recommended 400x500px minimum, professional background)
- Name
- Title/specialty
- Bio (1-2 sentences: school, years of experience, specialties)
- Adjust the number of doctor cards (template has 3; add/remove `<div class="doc">` blocks)

### 3. Hero Section (index.html)

| Element | What to Change |
|---------|---------------|
| Background image | Replace Pexels Baltimore skyline with client's city skyline or office exterior. Use `hero-bg img src` attribute. Recommended: 1920px wide, landscape. |
| Headline | `Where Your Smile <em>Begins</em>` — adjust tagline |
| Subheadline | Update practice description, doctor count, service count |
| Google rating badge | Update `4.9` and star count if different |
| "Accepting New Patients" badge | Remove if not applicable |
| Booking form service dropdown | Verify services match what this practice offers |

### 4. Services Offered

**If the practice offers the same 7 services** (cleanings, fillings, emergency, implants, braces, crowns, root canals) — no changes needed.

**If services differ:**
1. Edit the service cards in `index.html` (section `#services`, ~line 613)
2. Edit/add/remove pages in `services/` directory
3. Update footer service links in all 8 files
4. Update the booking form dropdown options in `index.html`
5. Update the trust counter from `7` to the actual count

### 5. Testimonials (index.html)

Located in `<!-- TESTIMONIALS -->` section. Each testimonial:

```html
<div class="testi-card">
    <div class="testi-stars">★★★★★</div>
    <p>"Quote from patient..."</p>
    <div class="testi-author">Patient Name</div>
</div>
```

Pull real reviews from Google Business Profile. 3-4 testimonials is ideal.

### 6. Google Maps Embed (index.html)

Find the `<iframe>` near the bottom. Replace the `src` URL with a new Google Maps embed for the client's address:
1. Go to Google Maps → search the practice address
2. Click Share → Embed a map → Copy HTML
3. Replace the `src="..."` value

### 7. Insurance Logos (index.html)

The template shows common insurance badges (Delta Dental, Cigna, Aetna, MetLife, Guardian, United). Update if the practice accepts different insurers.

### 8. Meta Tags

In `<head>` of every HTML file:
- `<title>` — Practice name + location
- `<meta name="description">` — Unique description with practice name, city, phone number

---

## Design System Reference

### Typography
| Use | Font | Weight |
|-----|------|--------|
| Headlines, doctor names, service titles | Playfair Display (serif) | 500-800 |
| Body text, buttons, nav, labels | DM Sans (sans-serif) | 300-800 |

Google Fonts import is in each file's `<head>`. No local font files needed.

### Color Palette
| Variable | Hex | Usage |
|----------|-----|-------|
| `--primary` | `#1a6db5` | Primary blue — buttons, links, accents |
| `--primary-light` | `#2d8fd6` | Hover states, lighter blue elements |
| `--primary-dark` | `#0f5a96` | Dark blue text, button hover |
| `--primary-deeper` | `#0b3d6a` | Hero overlay, CTA gradient |
| `--accent` | `#d4a44c` | Gold — eyebrow lines, badges, premium feel |
| `--accent-light` | `#e4bd72` | Gold hover, hero italic text |
| `--g50` through `--g900` | Slate scale | Backgrounds, text hierarchy |

**To rebrand for a client with different colors:** Replace `--primary` and `--accent` values in `:root`. Everything cascades automatically.

### Spacing & Radius
| Variable | Value | Usage |
|----------|-------|-------|
| `--r` | 16px | Default border-radius |
| `--rl` | 24px | Cards, service images |
| `--rxl` | 32px | CTA card, large elements |

### Shadows
| Variable | Usage |
|----------|-------|
| `--shadow-subtle` | Resting cards, FAQ items |
| `--shadow-card` | Service cards, benefit cards |
| `--shadow-elevated` | Hover state elevation |
| `--shadow-glow` | Primary CTA buttons (blue glow) |

---

## Page Architecture — Main Page (index.html)

| Section | Purpose | Key Elements |
|---------|---------|-------------|
| **Nav** | Fixed top bar, transparent → white on scroll | Logo, nav links, Google rating badge, phone CTA |
| **Hero** | Full-viewport, city skyline + blue overlay | Badge, H1, subheadline, 2 CTAs, booking form card |
| **Trust Bar** | Social proof numbers | 15+ years, 10K+ patients, 4.9 rating, 7 services |
| **Services** | 7-card grid (first card spans 2x2) | Unsplash images, glass overlay with title + description |
| **Smile Gallery** | Before/after showcase | 4 images in grid |
| **About / Doctors** | Team section | Doctor cards with photos, names, credentials |
| **Testimonials** | Patient reviews | Glassmorphism cards with stars and quotes |
| **Insurance** | Accepted plans | Logo badges |
| **Map + CTA** | Location + final conversion | Google Maps iframe, CTA card |
| **Footer** | Links + contact info | 4-column grid: about, services, contact, hours |

## Page Architecture — Service Pages (services/*.html)

| Section | Purpose |
|---------|---------|
| **Nav** | Same as main page, links back to `../` |
| **Hero** | Shorter (60vh), Unsplash image + blue overlay, breadcrumb |
| **Intro** | 1 paragraph explaining the service |
| **Benefits** | 2x2 grid of benefit cards with icons |
| **How It Works** | 3-step vertical timeline |
| **FAQ** | 3 accordion items with click-to-expand |
| **CTA Card** | Blue gradient card with Book + Call buttons |
| **Footer** | Same as main page, service links cross-reference each other |

---

## Image Sources

### Hero Background
- **Current:** Pexels photo 8436663 (Baltimore skyline)
- **For new clients:** Search Pexels/Unsplash for `{city name} skyline` or use the practice's office exterior photo
- Recommended: 1920px wide, landscape orientation, good for dark overlay

### Service Card Images (Unsplash, free to use)
| Service | Unsplash Photo ID | Direct URL |
|---------|------------------|-----------|
| Cleanings | `photo-1606811841689-23dfddce3e95` | `https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80&auto=format&fit=crop` |
| Fillings | `photo-1588776814546-1ffcf47267a5` | `https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80&auto=format&fit=crop` |
| Emergency | `photo-1629909613654-28e377c37b09` | `https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80&auto=format&fit=crop` |
| Implants | `photo-1606265752439-1f18756aa5fc` | `https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=600&q=80&auto=format&fit=crop` |
| Braces | `photo-1609840114035-3c981b782dfe` | `https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80&auto=format&fit=crop` |
| Crowns | `photo-1598256989800-fe5f95da9787` | `https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80&auto=format&fit=crop` |
| Root Canals | `photo-1579684385127-1ef15d508118` | `https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80&auto=format&fit=crop` |

**These images are generic dental photos — reuse them across all clients.** No need to change unless the client provides their own office/procedure photos.

### Doctor Headshots
- Must be sourced per client (from their existing website, Google Business Profile, or provided directly)
- Download with Node.js if from Google Sites (see "Google Sites Image Fix" below)
- Save as local files in the client's directory
- Recommended: 400x500px minimum, professional/neutral background

---

## Deployment Workflow

### 1. Deploy to Netlify (via API)

All dentist sites deploy under the same Netlify site: `web-design-pages-am` (website.advancedmarketing.co).

```bash
# From the web-design-landing repo root:
node -e "
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TOKEN = 'nfp_2r8NMnaW5BxpaWHWXXu6ZbePvQAQjqkp682b';
const SITE_ID = '20a564f4-ab83-432f-a548-ce127ba56d84';

// Walk all files in repo
const files = {};
function walk(dir, prefix) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, prefix + '/' + entry.name);
    else {
      const sha1 = crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex');
      files[prefix + '/' + entry.name] = sha1;
    }
  });
}
walk('.', '');

// POST deploy, then upload required files
// (same pattern as existing deploy scripts)
"
```

### 2. Push to GitHub

```bash
git add dentist/{clientslug}/
git commit -m 'Add {client name} dental website'
git push origin main
```

### 3. URL Pattern

```
https://website.advancedmarketing.co/dentist/{clientslug}/
https://website.advancedmarketing.co/dentist/{clientslug}/services/cleanings.html
```

---

## Known Gotchas

### Google Sites Image Fix
Doctor photos hosted on `lh3.googleusercontent.com/sitesv/` are blocked by referrer policy. Download them with Node.js using these headers:

```javascript
const headers = {
  'User-Agent': 'Mozilla/5.0 ...',
  'Sec-Fetch-Dest': 'image',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'cross-site'
};
```

Save locally as `doctorname.jpg` and reference in HTML.

### Booking Form
The booking form in the hero is **visual only** — it doesn't submit anywhere. To make it functional:
- Connect to GHL via API
- Or add a Calendly/Acuity embed
- Or wire up a Netlify Form

### Service Page Count
If a practice offers fewer than 7 services:
- Remove the unused service pages from `services/`
- Remove corresponding cards from `index.html` service grid
- Update footer links in ALL remaining files
- The CSS grid auto-adjusts (no layout changes needed)

### Mobile Responsive
All pages are fully responsive. Three breakpoints:
- `> 900px` — full desktop layout
- `600-900px` — 2-column grids collapse, nav links hide
- `< 600px` — single column, stacked layout

### Browser Support
Modern browsers only (CSS custom properties, grid, backdrop-filter). Works in Chrome, Firefox, Safari, Edge. No IE11 support.

---

## Checklist — New Client Launch

- [ ] Duplicate `firstdental/` directory
- [ ] Replace practice name, phone, address in all 8 files
- [ ] Swap doctor headshot photos
- [ ] Update doctor names, titles, bios
- [ ] Update hero background image (city skyline)
- [ ] Update Google rating number
- [ ] Replace testimonials with real Google reviews
- [ ] Update Google Maps embed
- [ ] Update insurance logos if needed
- [ ] Verify service list matches practice offerings
- [ ] Update `<title>` and `<meta description>` in all files
- [ ] Update hours in footer
- [ ] Test all pages locally
- [ ] Deploy to Netlify
- [ ] Push to GitHub
- [ ] Send client the preview URL
