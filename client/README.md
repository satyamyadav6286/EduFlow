# EduFlow Client

<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-4.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux">
  <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</div>

<div align="center">
  <p><strong>Modern frontend for the EduFlow learning platform</strong></p>
</div>

---

## ✨ Overview

The EduFlow client is a responsive, feature-rich React application powering the frontend of the EduFlow learning management system. Built with modern technologies and following best practices, it delivers an exceptional user experience for both students and instructors.

## 🚀 Key Features

### For Students
- **Intuitive Course Player** - Seamless video playback with progress tracking
- **Interactive Quizzes** - Engaging assessments with immediate feedback
- **Verified Certificates** - Downloadable course completion certificates
- **Quiz Scorecards** - Detailed performance analytics with PDF export
- **Personalized Dashboard** - Track enrolled courses and progress

### For Instructors
- **Course Builder** - Intuitive interface for content creation
- **Analytics Dashboard** - Comprehensive statistics and insights
- **Student Management** - Monitor learner engagement and performance
- **Content Management** - Organize videos, quizzes, and materials

### Platform Features
- **Verification Portal** - Public verification for certificates and scorecards
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Accessibility** - WCAG-compliant components from shadcn/ui
- **Dark/Light Mode** - Theme support for user preference
- **Token Management** - Secure authentication with automatic refresh

## 🛠️ Technology Stack

- **React 18** - UI library with Hooks and functional components
- **Redux Toolkit** - State management with RTK Query
- **React Router v6** - Client-side routing with latest features
- **Tailwind CSS** - Utility-first styling approach
- **shadcn/ui** - High-quality, accessible UI components
- **Vite** - Fast build tool and development server
- **Lucide React** - Consistent, customizable icon set
- **Sonner** - Modern toast notification system
- **React Hook Form** - Performant form validation
- **Zod** - TypeScript-first schema validation

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

```bash
# Clone the repository (if not already done)
git clone https://github.com/satyamyadav6286/eduflow.git
cd eduflow/client

# Install dependencies
npm install

# Create .env file (see below for required variables)
```

### Environment Setup

Create a `.env` file in the client directory:

```
VITE_API_URL=http://localhost:3000/api/v1
```

### Development Server

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── app/                  # Redux store configuration
│   └── store.js          # Store setup with middleware
├── components/           # Reusable UI components
│   ├── ui/               # Base shadcn/ui components
│   ├── common/           # Shared application components
│   └── [feature]/        # Feature-specific components
├── features/             # Feature modules
│   ├── api/              # RTK Query API definitions
│   └── slices/           # Redux state slices
├── pages/                # Application routes
│   ├── auth/             # Authentication pages
│   ├── student/          # Student-facing pages
│   ├── instructor/       # Instructor dashboard
│   └── public/           # Public pages (verification, etc.)
├── utils/                # Helper functions and utilities
├── hooks/                # Custom React hooks
├── constants/            # Application constants
├── styles/               # Global styles
├── App.jsx               # Application component
└── main.jsx              # Entry point
```

## ✅ Recent Improvements

- **Certificate Verification** - Public verification portal for course certificates
- **Quiz Scorecard System** - Detailed performance metrics and PDF generation
- **Token Management** - Improved authentication with automatic refresh
- **Download Reliability** - Enhanced document retrieval system
- **UI Enhancements** - Streamlined interfaces with shadcn/ui
- **Performance Optimization** - Reduced bundle size and improved load times

## 🔍 Key Components

### Authentication
Secure JWT-based authentication with automatic token refresh, protected routes, and role-based access control.

### Course Player
Advanced video player with progress tracking, note-taking, and seamless navigation between lectures.

### Certificate System
Generates verifiable certificates upon course completion with public verification portal.

### Quiz Engine
Interactive quiz interface with multiple question types, timed assessments, and detailed scorecards.

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
