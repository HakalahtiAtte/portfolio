# attehakalahti.fi

Personal portfolio site — [attehakalahti.fi](https://attehakalahti.fi)

## Stack

- **React 18** — functional components, hooks
- **Vite 5** — build tooling, HMR
- **CSS Modules** — scoped component styles, no utility framework
- **Cloudflare Pages** — edge CDN deployment

## Features

- Bilingual EN/FI with a single `content.js` source of truth
- Dark / light theme toggle with system preference detection
- Projects section with expandable cards, grouped by work and side projects
- Seagull Simulator — Canvas 2D mini-game built into the page
- 100/100/100/100 Lighthouse across performance, accessibility, best practices, and SEO
- HTTP security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy) enforced at CDN edge

## Development

```bash
npm install
npm run dev
```

## Deployment

Deploys automatically to Cloudflare Pages on push to `main`. No build configuration needed — `public/_headers` and `public/_redirects` handle security headers and SPA routing at the edge.
