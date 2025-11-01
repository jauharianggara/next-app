# Karyawan Management System - Frontend

A comprehensive employee and office management system built with Next.js 14, TypeScript, and Tailwind CSS. This frontend application provides a complete user interface for managing employees (karyawan), offices (kantor), and job positions (jabatan) with JWT authentication.

## Features

### 🔐 Authentication
- **JWT Authentication** - Secure login/logout system
- **User Registration** - New account creation
- **Protected Routes** - Automatic authentication checks
- **Token Management** - Automatic token refresh and validation

### 👥 Employee Management (Karyawan)
- **CRUD Operations** - Create, read, update, delete employees
- **Photo Upload** - Profile picture management with validation
- **Salary Management** - Salary information with IDR formatting
- **Position Assignment** - Link employees to job positions
- **Office Assignment** - Assign employees to office locations
- **Auto User Creation** - Automatic user account creation for new employees

### 🏢 Office Management (Kantor)
- **Office Registration** - Add and manage office locations
- **Address Management** - Complete address information
- **GPS Coordinates** - Latitude and longitude for precise location
- **Map Integration** - Google Maps preview (optional)
- **Location Validation** - Coordinate range validation

### 💼 Job Position Management (Jabatan)
- **Position Hierarchy** - Manage job positions and descriptions
- **Role Descriptions** - Detailed job descriptions and requirements
- **Position Assignment** - Link positions to employees
- **Dependency Management** - Prevent deletion of positions in use

### 🎨 User Interface
- **Responsive Design** - Mobile-first responsive layout
- **Modern UI** - Clean, professional interface with Tailwind CSS
- **Interactive Components** - Modal dialogs, forms, and tables
- **Real-time Feedback** - Toast notifications and loading states
- **Dashboard Analytics** - Overview statistics and quick actions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI components
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast
- **Authentication**: JWT with cookies
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Running Karyawan Management API (Backend)

### Installation

1. **Navigate to the project directory**
   ```bash
   cd next-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here  # Optional
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Authentication Setup

### First Time Setup
1. Start the backend API server
2. Access the frontend at `http://localhost:3000`
3. Click "Create new account" to register
4. Fill in the registration form
5. Login with your credentials
6. Access the dashboard

### Employee Auto-Login
When you create an employee, they can login using:
- **Username**: Generated from their name
- **Password**: `12345678` (default)
- **Email**: `{username}@karyawan.local`

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── ui/               # UI component library
│   ├── DashboardLayout.tsx
│   └── ProtectedRoute.tsx
├── contexts/             # React Context providers
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   ├── api.ts            # API service functions
│   ├── api-client.ts     # Axios configuration
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
    └── api.ts            # API response types
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
