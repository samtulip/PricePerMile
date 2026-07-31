# PricePerMile

A mobile-first, zero-cost fuel price comparison tool for the UK. Compare petrol and diesel prices at petrol stations by location, calculate travel costs, and find the cheapest fuel options near you.

## Features

- 🗺️ **Dual View Modes**: Switch between table and map views to find fuel prices
- 📍 **Geolocation**: Automatically detect your location to find nearby fuel stations
- 💷 **Price Comparison**: Compare prices across petrol stations with real-time data
- 📊 **Cost Calculations**: Calculate travel costs and potential savings
- 🎨 **Color Themes**: Choose from multiple color themes (blue, green, purple, high-contrast)
- 📱 **Mobile First**: Fully responsive design optimized for mobile devices
- 🚀 **Zero Cost**: Hosted entirely on GitHub Pages with static station data
- 🔒 **Secure**: No API keys or secrets in code; all data is static and publicly hosted

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Hosting**: [GitHub Pages](https://pages.github.com/)
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

### GitHub Pages Setup

1. Enable GitHub Pages in repository settings and set source to **GitHub Actions**.
2. The CI/CD pipeline automatically builds the static frontend and deploys to GitHub Pages on push to `main`.
3. Station data from `packages/frontend/public/data/stations.json` is included in the deployment.

### Environment Variables

Build-time values used:
- `NEXT_PUBLIC_BASE_PATH` (build env) - set automatically for GitHub Pages pathing

**No secrets or API keys are needed for deployment.**

## Architecture

### Static Export

Next.js is configured for static export:
- All pages are pre-rendered at build time
- No server-side rendering needed
- Optimized for GitHub Pages static hosting
- Zero runtime costs

### Minimal Backend via Static Files

The app is designed to:
- Serve station data as a static JSON file
- Work completely offline after initial load
- Support future integration with free APIs
- Never expose sensitive data
- Cache data locally when possible

## Security

### Best Practices Implemented

- ✅ All code is open source with no secrets needed
- ✅ No hardcoded API keys or credentials
- ✅ Secure CI/CD pipeline with proper permissions
- ✅ Static frontend delivery via GitHub Pages
- ✅ Static station data served alongside frontend
- ✅ No server-side processing needed

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

- **GitHub Pages**: Free static hosting
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
- [GitHub Pages](https://pages.github.com/) - Free static hosting

---

**Made with ❤️ for UK fuel savers**
