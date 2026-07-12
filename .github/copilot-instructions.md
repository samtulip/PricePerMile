# PricePerMile Project Instructions

## Project Overview
A mobile-first static site for comparing UK fuel (petrol and diesel) prices at petrol stations by location. Features include:
- Map and table views of fuel stations with prices
- User geolocation to find nearby stations
- Cost calculations and savings comparisons
- Light/dark theme support
- Local storage for user settings
- Zero-cost hosting on GitHub Pages with Cloudflare fronting

## Tech Stack
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode
- **Hosting**: GitHub Pages (static export)
- **CDN**: Cloudflare
- **Secrets Management**: GitHub Secrets only

## Key Requirements
- ✅ No API keys or secrets in code
- ✅ Mobile-first responsive design
- ✅ Light and dark theme toggle
- ✅ Secure CI/CD pipeline
- ✅ Static site generation
- ✅ Local storage for user preferences

## Development
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Export static: Built into the build process

## GitHub Actions
All deployments are automated via GitHub Actions. Environment variables and secrets are stored safely in GitHub repository settings.
