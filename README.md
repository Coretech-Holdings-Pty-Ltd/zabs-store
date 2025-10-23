# ZAB'S Store - Premium Online Marketplace 🛍️

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/zabsstore/deploys)

## 🌟 About

ZAB'S Store is a modern, high-performance e-commerce platform featuring two specialized stores:
- **HealthCare Store** - Premium health & wellness products
- **ElectroShop** - Cutting-edge electronics

Built with React, TypeScript, and powered by Medusa.js backend on Railway.

## ✨ Features

- 🎨 Modern, responsive design with smooth animations
- 🔍 Smart search with fuzzy matching
- 🛒 Shopping cart functionality
- 👤 User authentication & profiles
- 💳 Secure checkout process
- 📱 Mobile-optimized experience with beautiful menu
- ⚡ Lightning-fast performance
- 🔒 Secure payments
- 🚚 Free shipping
- 🏆 Quality guarantee
- 💬 24/7 customer support

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/zabs-store.git

# Navigate to project directory
cd "Zabs Frontend"

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Medusa.js v2 (Railway)
- **Hosting**: Netlify

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Netlify

1. **Push to GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ZAB'S Store"
   git branch -M main
   git remote add origin https://github.com/yourusername/zabs-store.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Netlify will auto-detect settings from `netlify.toml`

3. **Deploy automatically**
   - Every push to main branch triggers automatic deployment
   - Preview deployments for pull requests

## � Configuration

### Backend Connection

The backend is already configured to connect to Railway:
```
https://backend-production-991f.up.railway.app
```

Update in `src/lib/config.ts` if needed.

### SEO Configuration

Already optimized with:
- `index.html` - Comprehensive meta tags
- `public/sitemap.xml` - Search engine sitemap
- `public/robots.txt` - Crawler instructions
- `public/site.webmanifest` - PWA configuration

## 📱 Progressive Web App (PWA)

The app is PWA-ready with:
- Service worker support
- Offline functionality
- Install to home screen
- Optimized for mobile

## 🔍 SEO Optimization

✅ **Already Implemented:**
- Semantic HTML structure
- Open Graph tags for social sharing
- Twitter Card meta tags
- Schema.org structured data (Store + Website)
- XML Sitemap
- Robots.txt configuration
- Fast page load times (< 1.5s FCP)
- Mobile-responsive design
- Accessible ARIA labels

## � Performance Targets

- **Lighthouse Score**: 90+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Speed Index**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📁 Project Structure

```
Zabs Frontend/
├── public/                 # Static assets
│   ├── robots.txt         # Search engine rules
│   ├── sitemap.xml        # SEO sitemap
│   └── site.webmanifest   # PWA manifest
├── src/
│   ├── components/        # React components
│   │   ├── Header.tsx    # Navigation with mobile menu
│   │   ├── LandingPage.tsx
│   │   ├── ProductCard.tsx
│   │   └── ui/           # Radix UI components
│   ├── lib/
│   │   ├── api.ts        # Medusa API integration
│   │   ├── config.ts     # App configuration
│   │   ├── hooks.ts      # Custom React hooks
│   │   └── types.ts      # TypeScript types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── index.html            # SEO-optimized HTML
├── netlify.toml          # Netlify configuration
├── package.json          # Dependencies
└── vite.config.ts        # Vite configuration
```

## 🔐 Security

- HTTPS enforced
- Secure headers configured in `netlify.toml`
- XSS protection enabled
- CORS properly configured
- Environment variables for sensitive data

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact & Support

- **Website**: [https://zabsstore.netlify.app](https://zabsstore.netlify.app)
- **Backend**: Railway (Medusa.js v2)
- **Email**: support@zabsstore.com

## 🙏 Acknowledgments

- UI Design: Modern e-commerce best practices
- Icons: [Lucide Icons](https://lucide.dev/)
- Backend: [Medusa.js](https://medusajs.com/)
- Hosting: [Netlify](https://netlify.com/)
- Components: [Radix UI](https://www.radix-ui.com/)

---

**Made with ❤️ by ZAB'S Store Team**

*Shop Smarter, Live Better* ✨

