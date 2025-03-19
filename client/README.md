# EduFlow Client

The client-side application for EduFlow - an online learning platform built with React, Vite, and Redux.

## Features

- **Modern UI Components** - Built with shadcn/ui and Tailwind CSS
- **State Management** - Redux Toolkit for predictable state
- **API Integration** - RTK Query for data fetching and caching
- **Responsive Design** - Mobile-first approach for all devices
- **Route Protection** - Authentication-based route protection
- **Rich Text Editor** - For course content creation
- **Media Integration** - Cloudinary for image and video uploads
- **Payment Processing** - Razorpay integration for course purchases

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository (if not already done)
```bash
git clone https://github.com/satyamyadav6286/eduflow.git
cd eduflow/client
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Environment Setup
Create a `.env` file with the following variables:
```
VITE_API_URL=http://localhost:3000/api/v1
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

### Build for Production

```bash
npm run build
# or
yarn build
```

## File Structure

```
src/
├── app/                  # Redux store and root reducer
├── components/           # Reusable UI components
│   ├── ui/               # Base UI components from shadcn
│   └── ...               # Feature-specific components
├── features/             # Feature modules
│   ├── api/              # API slices for RTK Query
│   └── ...               # Feature-specific logic
├── pages/                # Application pages
│   ├── admin/            # Admin dashboard pages
│   ├── student/          # Student-facing pages
│   └── ...               # Auth and other pages
├── App.jsx               # Main application component
└── main.jsx              # Entry point
```

## Libraries & Tools

- [React](https://reactjs.org/) - UI Library
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) - Data fetching
- [React Router](https://reactrouter.com/) - Routing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
- [Lucide React](https://lucide.dev/) - Icon set
