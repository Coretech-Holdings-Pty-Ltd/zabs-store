# ZABS E-Commerce Platform 🛍️

> **Modern dual-store e-commerce platform powered by Medusa.js v2**

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/zabsstore/deploys)

## 🌟 Overview

ZABS is a premium e-commerce platform featuring two specialized stores:

- **Healthcare Store** - Premium health & wellness products
- **Electronics Store** - Cutting-edge electronics and gadgets

Built with React, TypeScript, Vite, and powered by Medusa.js v2 backend.

## ✨ Key Features

- 🛒 **Smart Cart System** - Works for both guest and logged-in users with Medusa.js integration
- 👤 **User Authentication** - Secure Supabase-powered authentication
- 💳 **Multiple Payment Options** - PayFast, Ozow, and pay at store
- 🎯 **Multi-Store Support** - Separate electronics and healthcare catalogs
- 📱 **Responsive Design** - Beautiful UI optimized for all devices
- ⚡ **High Performance** - Lazy loading, caching, and optimized bundle
- 🔍 **Smart Search** - Fast product search with fuzzy matching
- ❤️ **Wishlist** - Save favorite products
- 📦 **Order Tracking** - View order history and status
- 🚚 **Flexible Delivery** - Delivery or store pickup options

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or higher
- npm or pnpm
- Medusa.js v2 backend running
- Supabase account

### Installation

```bash
# Navigate to project directory
cd "Zabs Frontend"

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and fill in values

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📚 Documentation

For detailed documentation, see:

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete platform documentation

  - Cart system architecture
  - Order creation flow
  - Payment integration
  - Authentication setup
  - Performance optimizations
  - Troubleshooting guide

- **[DATABASE-SCRIPTS.sql](./DATABASE-SCRIPTS.sql)** - Database setup and maintenance
  - Initial setup scripts
  - Cart maintenance queries
  - Wishlist configuration
  - Diagnostic queries
  - Data cleanup scripts

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.3
- **Language**: TypeScript
- **Build Tool**: Vite 6.3
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend Integration

- **E-commerce**: Medusa.js v2
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Payments**: PayFast, Ozow

### Hosting

- **Frontend**: Netlify
- **Backend**: Railway
- **Database**: Supabase

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

The project includes `netlify.toml` configuration for automatic deployment:

1. Push to GitHub/GitLab
2. Connect repository to Netlify
3. Netlify auto-deploys on every push to main

## 🔧 Project Structure

```
Zabs Frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── ProductCard.tsx
│   │   └── ...
│   ├── lib/                 # Core services
│   │   ├── cart-service.ts  # Cart management
│   │   ├── order-service.ts # Order creation
│   │   ├── auth-context.tsx # Authentication
│   │   ├── api.ts           # Medusa API
│   │   └── ...
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── DOCUMENTATION.md         # Complete documentation
├── DATABASE-SCRIPTS.sql     # Database scripts
└── README.md                # This file
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Medusa Backend
VITE_MEDUSA_BACKEND_URL=http://localhost:9000

# Publishable API Keys (from Medusa Admin)
VITE_MEDUSA_ELECTRONICS_KEY=pk_electronics_...
VITE_MEDUSA_HEALTH_KEY=pk_health_...

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Payment Gateways
VITE_PAYFAST_MERCHANT_ID=your_merchant_id
VITE_PAYFAST_MERCHANT_KEY=your_merchant_key
VITE_PAYFAST_PASSPHRASE=your_passphrase
VITE_PAYFAST_SANDBOX=true

VITE_OZOW_SITE_CODE=your_site_code
VITE_OZOW_PRIVATE_KEY=your_private_key
VITE_OZOW_API_KEY=your_api_key
VITE_OZOW_SANDBOX=true
```

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Medusa.js](https://medusajs.com) - E-commerce backend
- [Supabase](https://supabase.com) - Authentication and database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Radix UI](https://www.radix-ui.com) - UI components
- [Framer Motion](https://www.framer.com/motion) - Animations

## 📞 Support

For support and questions:

- Check [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed guides
- Review [DATABASE-SCRIPTS.sql](./DATABASE-SCRIPTS.sql) for database issues
- Open an issue on GitHub
- Contact: support@zabsstore.com

---

**Made with ❤️ by the ZABS Team**
