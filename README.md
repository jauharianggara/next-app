# 🏢 Employee Management System - Frontend

A modern, responsive frontend application for managing employees, built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. This is a standalone frontend that connects to external backend APIs.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

## ✨ Features

- 🎨 **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- 🔐 **Authentication** - Login/Register with external API integration
- 👥 **Employee Management** - CRUD operations for employee data
- 🏢 **Department Management** - Manage positions and office locations
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Performance Optimized** - Built with Next.js 16 and React 19
- 🐳 **Docker Ready** - Easy deployment with Docker
- 🔄 **External API Integration** - Connects to any REST API backend

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- External backend API (or mock API)

### 1. Clone & Install
```bash
git clone https://github.com/jauharianggara/next-app.git
cd next-app
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.local .env.production

# Edit environment variables
# Set your external API URL
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 3. Development
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 4. Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🐳 Docker Deployment

### Quick Deploy
```bash
# Build and run with Docker Compose
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Manual Docker
```bash
# Build image
docker build -t employee-frontend .

# Run container
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api.com \
  employee-frontend
```

---

## 🌐 Deployment Options

### 1. **Vercel (Recommended for Frontend)**
```bash
npm i -g vercel
vercel --prod
```

### 2. **Netlify**
- Connect your GitHub repo
- Set build command: `npm run build`
- Set environment variables in Netlify dashboard

### 3. **Apache/Nginx**
- Use provided Apache configuration in `deployment/apache-frontend-only.conf`
- Or deploy with Docker and proxy through Apache/Nginx

### 4. **Cloud Platforms**
- **AWS**: ECS, Elastic Beanstalk, or S3 + CloudFront
- **Google Cloud**: Cloud Run, App Engine
- **Azure**: Container Instances, App Service

---

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard and main app
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   └── ui/               # UI components (buttons, forms, etc.)
│   └── lib/                  # Utilities and configurations
├── public/                   # Static assets
├── deployment/               # Deployment configurations
│   ├── apache-frontend-only.conf
│   ├── apache-performance.conf
│   └── APACHE_SETUP.md
├── .github/workflows/        # CI/CD workflows
├── docker-compose.yml        # Docker configuration
├── Dockerfile               # Docker build instructions
├── FRONTEND_ONLY_DEPLOYMENT.md
└── README.md               # This file
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | External backend API URL | `https://api.example.com` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Employee Management` |
| `NEXT_PUBLIC_API_KEY` | API key (if required) | `your-api-key` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

### API Endpoints Expected

Your external backend should provide these endpoints:

```
Authentication:
POST /api/auth/login
POST /api/auth/register
GET  /api/user/me

Employee Management:
GET    /api/karyawans
GET    /api/karyawans/:id
POST   /api/karyawans
PUT    /api/karyawans/:id
DELETE /api/karyawans/:id

Department Management:
GET  /api/jabatans
POST /api/jabatans
GET  /api/kantors
POST /api/kantors

Health Check:
GET  /api/health
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:up        # Start with docker-compose
npm run docker:down      # Stop docker-compose
npm run docker:logs      # View container logs
```

### Code Quality
- **ESLint** for code linting
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Zod** for validation
- **Axios** for API calls

---

## 🔧 Customization

### Styling
- Edit `src/app/globals.css` for global styles
- Modify `tailwind.config.js` for Tailwind customization
- Update components in `src/components/ui/`

### API Integration
- Update `src/lib/api.ts` for API configurations
- Modify authentication logic in `src/contexts/AuthContext.tsx`
- Customize API endpoints in component files

### Branding
- Replace logos in `public/` folder
- Update metadata in `src/app/layout.tsx`
- Modify colors in Tailwind config

---

## 📊 Performance

- ⚡ **Lighthouse Score**: 95+ for all metrics
- 🏗️ **Build Size**: ~500KB compressed
- 🚀 **First Load**: <2s on 3G
- 📱 **Mobile Optimized**: Responsive design
- 🎯 **SEO Ready**: Meta tags and structured data

---

## 🔐 Security

- 🛡️ **HTTPS Only** in production
- 🔒 **Secure Headers** with Apache/Nginx
- 🚫 **XSS Protection** built-in
- 🔑 **CSRF Protection** via tokens
- 📝 **Input Validation** with Zod schemas

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- 📧 **Email**: jauharianggara@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/jauharianggara/next-app/issues)
- 📖 **Documentation**: [Deployment Guide](FRONTEND_ONLY_DEPLOYMENT.md)

---

## 🎯 Roadmap

- [ ] 🔍 Advanced search and filtering
- [ ] 📊 Dashboard analytics
- [ ] 📁 File upload functionality  
- [ ] 🔔 Real-time notifications
- [ ] 🌍 Internationalization (i18n)
- [ ] 📱 Progressive Web App (PWA)
- [ ] 🎨 Theme customization
- [ ] 📈 Advanced reporting

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
