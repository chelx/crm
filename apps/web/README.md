# CRM Frontend

Frontend application for the CRM system built with React, Refine, and Chakra UI.

## Features

- 🔐 Authentication with JWT
- 📊 Dashboard with statistics
- 👥 Customer management
- 💬 Feedback management
- 📝 Reply approval workflow
- 📋 Audit logging
- 🎨 Modern UI with Chakra UI

## Tech Stack

- **React 18** - UI library
- **Refine** - Admin framework
- **Chakra UI** - Component library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

**Note:** Make sure the backend API is running on `http://localhost:3001` before starting the frontend.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── layout/         # Layout components
├── features/           # Feature-based modules
│   ├── auth/           # Authentication
│   ├── dashboard/      # Dashboard
│   ├── customers/      # Customer management
│   ├── feedback/       # Feedback management
│   ├── replies/        # Reply management
│   └── audit/          # Audit logging
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
├── theme/              # Chakra UI theme
└── app/                # App configuration
```

## API Integration

The frontend connects to the backend API at `http://localhost:3001/v1` by default.

### Authentication

- Login: `POST /auth/login`
- Refresh: `POST /auth/refresh`
- Logout: `POST /auth/logout`

### Resources

- Customers: `/customers`
- Feedback: `/feedback`
- Replies: `/replies`
- Audit: `/audit`

## Development

### Adding New Features

1. Create feature folder in `src/features/`
2. Add routes to `AppRoutes.tsx`
3. Add resource to Refine configuration in `App.tsx`
4. Implement CRUD operations using Refine hooks

### Styling

- Use Chakra UI components
- Customize theme in `src/theme/index.ts`
- Follow design system guidelines

### State Management

- Use Refine's built-in state management
- React Query for server state
- React Hook Form for form state

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service.

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test your changes thoroughly
