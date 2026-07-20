# PricePerMile

A mobile-first, zero-cost fuel price comparison tool for the UK. Compare petrol and diesel prices at petrol stations by location, calculate travel costs, and find the cheapest fuel options near you.

## Features

- 🗺️ **Dual View Modes**: Switch between table and map views to find fuel prices
- 📍 **Geolocation**: Automatically detect your location to find nearby fuel stations
- 💷 **Price Comparison**: Compare prices across petrol stations with real-time data
- 📊 **Cost Calculations**: Calculate travel costs and potential savings
- 🎨 **Color Themes**: Choose from multiple color themes (blue, green, purple, high-contrast)
- 📱 **Mobile First**: Fully responsive design optimized for mobile devices
- 🚀 **Zero Cost**: Hosted on Cloudflare Pages with edge KV-backed station data
- 🔒 **Secure**: No API keys or secrets in code; all sensitive data in GitHub Secrets

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **CDN**: [Cloudflare](https://www.cloudflare.com/)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/PricePerMile.git
cd PricePerMile
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production (static export)
- `npm run lint` - Run ESLint
- `npm start` - Start the production server (local testing)
- `npm run export` - Export static site to `./out`
- `npm run convert:stations -- <input.csv> [output.json]` - Convert a flat forecourt CSV into station JSON (defaults to `public/data/stations.json`)

### Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout with theme provider
│   ├── page.tsx      # Main page component
│   ├── globals.css   # Global styles
│   └── providers.tsx # Theme provider component
├── components/       # Reusable components
│   └── Header.tsx    # Header with view toggle
├── lib/              # Utility functions
│   └── geolocation.ts # Geolocation and distance calculations
└── types/            # TypeScript type definitions
    └── index.ts      # App types
```

### Key Features Implementation

#### Color Theme Support

The app uses a custom `ThemeProvider` that manages color variants:
- Supports multiple color schemes: blue (default), green, purple, and high-contrast
- Persists user's color preference to localStorage
- Always displays in light mode regardless of device theme settings
- Uses CSS custom properties for easy theme switching

#### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly controls

#### Data Flow

The app structure supports:
1. User location detection via Geolocation API
2. Distance calculations using Haversine formula
3. Savings comparison based on vehicle economy settings
4. Persistent user preferences in localStorage

## Deployment

### Cloudflare Pages Setup

1. Create a Cloudflare Pages project.
2. Add a KV binding named `STATIONS_KV` to the Pages project settings.
3. Upload your station payload to KV under the key `stations.json` (or set `STATIONS_KV_KEY` project variable to a different key).
4. Add the GitHub secrets listed below.
5. The CI/CD pipeline deploys on push to `main`.

### Environment Variables

Runtime environment values used by Cloudflare Pages Functions:
- `STATIONS_KV` (KV binding) - Cloudflare KV namespace containing station JSON
- `STATIONS_KV_KEY` (optional Pages variable) - KV key for the station payload, defaults to `stations.json`

**No secrets or API keys are stored in code.**

### Cloudflare Setup

1. Point your domain to Cloudflare nameservers
2. Map your custom domain to the Cloudflare Pages project
3. Enable caching rules as needed

## Architecture

### Static Export

Next.js is configured for static export:
- All pages are pre-rendered at build time
- No server-side rendering needed
- Optimized for Cloudflare Pages hosting
- Zero runtime costs

### No External APIs in Core

The app is designed to:
- Work with locally stored data initially
- Support future integration with free APIs
- Never expose sensitive data
- Cache data locally when possible

## Security

### Best Practices Implemented

- ✅ All secrets managed via GitHub repository settings
- ✅ No hardcoded API keys or credentials
- ✅ Secure CI/CD pipeline with proper permissions
- ✅ Static content delivery (no dynamic backend)
- ✅ No server-side processing of sensitive data
- ✅ Client-side data processing only

### GitHub Secrets

Required for deployment:
1. `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages deployment permissions
2. `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account identifier
3. `CLOUDFLARE_PAGES_PROJECT_NAME` - Target Cloudflare Pages project name

Add them in Repository Settings → Secrets and Variables → Actions and reference as `${{ secrets.SECRET_NAME }}`.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Static site generation for instant loading
- Tailwind CSS purging unused styles
- Image optimization for responsive design
- Efficient distance calculations
- LocalStorage for settings persistence

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## Future Roadmap

- [ ] Integration with UK Government fuel price API
- [ ] Live map visualization with Mapbox/Leaflet
- [ ] Route planning to nearest cheap fuel
- [ ] Push notifications for price drops
- [ ] Historical price trends and analytics
- [ ] Share savings achievements
- [ ] Multi-language support
- [ ] PWA features (offline support, install)

## Cost Analysis

### Hosting Costs: £0/month

- **Cloudflare Pages**: Free static hosting + edge functions
- **Cloudflare**: Free tier includes caching and CDN
- **Domain**: Only applicable domain registration costs

### Traditional Alternatives: £50-200+/month

- VPS/Cloud hosting (AWS, Heroku, etc.)
- Database hosting
- API gateway costs
- DDoS protection

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests:
1. Check existing [GitHub Issues](../../issues)
2. Create a new issue with detailed description
3. Include steps to reproduce for bugs

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide Icons](https://lucide.dev/) - Beautiful SVG icons
- [Cloudflare Pages](https://pages.cloudflare.com/) - Free static hosting and edge functions
- [Cloudflare](https://www.cloudflare.com/) - CDN and caching

---

**Made with ❤️ for UK fuel savers**
