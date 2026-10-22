# attehakalahti.fi

Personal portfolio site — [attehakalahti.fi](https://attehakalahti.fi)

## Stack

- **React 18** — functional components, hooks
- **Vite 8** — build tooling, HMR
- **CSS Modules** — scoped component styles, no utility framework
- **Cloudflare Pages** — edge CDN deployment

## Features

- Bilingual EN/FI with a single `content.js` source of truth
- Dark / light theme toggle with system preference detection
- Projects section with expandable cards, grouped into selected and additional projects
- 100/100/100/100 Lighthouse across performance, accessibility, best practices, and SEO
- HTTP security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy) enforced at CDN edge

## Development

Requires Node.js 20.19+ (20.x) or 22.12+.

```bash
npm install
npm run dev
```

## Deployment

Deploys automatically to Cloudflare Pages on push to `main`. No build configuration needed — `public/_headers` and `public/_redirects` handle security headers and SPA routing at the edge.
