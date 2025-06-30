# Wishonia Documentation Hub

Welcome to the comprehensive documentation for the Wishonia project - a Next.js application focused on solving global problems through collective intelligence and voting.

## 📚 Documentation Overview

This documentation hub provides complete coverage of all public APIs, functions, components, and usage patterns in the Wishonia project.

### 📖 Documentation Files

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Main API and function reference
2. **[COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md)** - Detailed component usage guide  
3. **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - Complete REST API endpoint documentation

## 🚀 Quick Start

### For Developers
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm prisma:migrate

# Start development server
pnpm dev
```

### For API Users
```bash
# Basic API call
curl https://wishonia.com/api/globalProblems

# With authentication
curl -H "Cookie: next-auth.session-token=your-token" \
     https://wishonia.com/api/vote
```

### For Component Users
```typescript
import { Button } from '@/components/ui/button'
import { GlobalProblemsList } from '@/components/global-problems-list'

// Use components in your app
<Button variant="primary">Get Started</Button>
<GlobalProblemsList userId={userId} />
```

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI primitives
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Google, GitHub, Email, dFDA)
- **AI Integration**: OpenAI GPT models
- **Deployment**: Vercel
- **Monitoring**: Sentry

### Project Structure
```
wishonia/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages
│   ├── dashboard/         # User dashboard
│   └── globalProblems/    # Problem pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── [features]/       # Feature components
├── lib/                  # Shared utilities and functions
│   ├── auth.ts          # Authentication config
│   ├── db.ts            # Database client
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── prisma/             # Database schema and migrations
```

## 📱 Core Features

### Global Problems & Solutions
- **Problem Submission**: Users can submit global problems for community voting
- **Solution Proposals**: Create and vote on solutions to problems
- **Voting System**: Pairwise comparison voting for ranking problems and solutions
- **Analytics**: Real-time analytics and visualizations of voting results

### Wishing Wells
- **Personal Wishes**: Users can submit their personal desires and wishes
- **Community Voting**: Vote on which wishes matter most to the community
- **Wish Fulfillment**: Track progress on making wishes come true

### AI Integration
- **Content Generation**: AI-powered generation of problems, solutions, and content
- **Chat Interface**: Interactive AI assistant for exploring problems and solutions
- **Image Generation**: Automated featured image creation for content

### User Features
- **Authentication**: Multiple auth providers (Google, GitHub, Email, dFDA)
- **User Profiles**: Customizable user profiles with voting history
- **Dashboard**: Personal dashboard with voting statistics and recommendations

## 🔗 Navigation Guide

### By User Type

#### **Frontend Developers**
Start with: [Component Reference](./COMPONENT_REFERENCE.md)
- UI component usage and props
- Feature component integration
- Styling guidelines and patterns
- Hook usage examples

#### **Backend Developers** 
Start with: [API Documentation](./API_DOCUMENTATION.md)
- Core library functions
- Database utilities
- Authentication patterns
- Error handling

#### **API Consumers**
Start with: [API Endpoints](./API_ENDPOINTS.md)
- REST endpoint specifications
- Request/response schemas
- Authentication methods
- Rate limiting and errors

#### **Full-Stack Developers**
Review all documentation files:
1. [API Documentation](./API_DOCUMENTATION.md) for backend functions
2. [Component Reference](./COMPONENT_REFERENCE.md) for frontend components  
3. [API Endpoints](./API_ENDPOINTS.md) for API integration

### By Feature

#### **Authentication & Users**
- [Authentication System](./API_DOCUMENTATION.md#authentication)
- [User API Endpoints](./API_ENDPOINTS.md#user-api)
- [User Components](./COMPONENT_REFERENCE.md#user-components)
- [Auth Hooks](./API_DOCUMENTATION.md#hooks)

#### **Global Problems & Solutions**
- [Problem Management Functions](./API_DOCUMENTATION.md#global-problems)
- [Solution Management Functions](./API_DOCUMENTATION.md#global-solutions)
- [Problem/Solution APIs](./API_ENDPOINTS.md#global-problems-api)
- [Problem/Solution Components](./COMPONENT_REFERENCE.md#global-problems-components)

#### **Voting System**
- [Voting Functions](./API_DOCUMENTATION.md#voting-api)
- [Vote API Endpoints](./API_ENDPOINTS.md#voting-api)
- [Voting Components](./COMPONENT_REFERENCE.md#voting-components)

#### **AI Features**
- [LLM Integration](./API_DOCUMENTATION.md#llm-integration)
- [Chat API](./API_ENDPOINTS.md#chat-api)
- [Chat Components](./COMPONENT_REFERENCE.md#chat-components)
- [Content Generation](./API_DOCUMENTATION.md#content-generation)

#### **File Uploads**
- [Upload Functions](./API_DOCUMENTATION.md#image-generation)
- [Upload APIs](./API_ENDPOINTS.md#upload-apis)
- [File Components](./COMPONENT_REFERENCE.md#file-and-media-components)

## 🔍 Search & Discovery

### Finding Components
```typescript
// Search for UI components
import { Button, Card, Dialog } from '@/components/ui/*'

// Search for feature components  
import { GlobalProblemsList, ChatPanel } from '@/components/*'

// Search for hooks
import { useUser, useMobile } from '@/hooks/*'
```

### Finding Functions
```typescript
// Database functions
import { prisma } from '@/lib/db'

// Utility functions
import { cn, formatDate } from '@/lib/utils'

// Feature functions
import { getRandomGlobalProblemPair } from '@/lib/globalProblems'
```

### Finding API Endpoints
```bash
# Core entities
GET /api/globalProblems
GET /api/globalSolutions
GET /api/wishingWells

# User actions
POST /api/vote
POST /api/chat

# File operations
POST /api/upload-avatar
POST /api/upload-document
```

## 🛠️ Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled, prefer interfaces over types
- **Components**: Use server components by default, add `'use client'` only when needed
- **Imports**: Use absolute imports with `@/` prefix
- **Styling**: Tailwind CSS with the `cn()` utility for conditional classes

### Best Practices
- **Authentication**: Use `getServerSession()` in server components, `useSession()` in client components
- **Database**: Import types from `@prisma/client`, use the shared `prisma` instance
- **Logging**: Use the project logger instead of `console.log`
- **Error Handling**: Use the global error handler for API routes

### Testing
```bash
# Run tests
pnpm test

# Run tests in CI
pnpm test:ci

# Database seeding
pnpm seed
```

## 📊 API Usage Examples

### Common Patterns

#### Fetching Data
```typescript
// Server component
import { prisma } from '@/lib/db'

const problems = await prisma.globalProblem.findMany()

// Client component
const { data: problems } = await fetch('/api/globalProblems')
```

#### Creating Votes
```typescript
// Using API function
import { updateOrCreateGlobalProblemPairAllocation } from '@/lib/globalProblems'

await updateOrCreateGlobalProblemPairAllocation(userId, thisOneId, notThisOneId)

// Using API endpoint
await fetch('/api/vote', {
  method: 'POST',
  body: JSON.stringify({ thisOneId, notThisOneId, type: 'globalProblems' })
})
```

#### User Authentication
```typescript
// Server side
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const session = await getServerSession(authOptions)

// Client side
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
```

## 🔗 Related Resources

### External Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

### Development Tools
- [Prisma Studio](http://localhost:5555) - Database GUI
- [Next.js Dev Tools](https://nextjs.org/docs/advanced-features/debugging)
- [React Dev Tools](https://react.dev/learn/react-developer-tools)

## 🆘 Getting Help

### Common Issues
1. **Authentication not working**: Check environment variables and provider configuration
2. **Database connection issues**: Verify `DATABASE_URL` and run migrations
3. **Component not rendering**: Check for `'use client'` directive if using hooks
4. **API rate limits**: Check rate limiting headers and adjust usage

### Support Channels
1. **Documentation**: Search this documentation first
2. **Code Examples**: Review existing components and functions
3. **Issue Tracker**: Create issues for bugs or feature requests
4. **Discussions**: Join community discussions for questions

### Contributing
1. **Code Style**: Follow the established patterns and ESLint rules
2. **Documentation**: Update docs when adding new features
3. **Testing**: Add tests for new functionality
4. **Pull Requests**: Use descriptive titles and detailed descriptions

---

## 📋 Documentation Checklist

### For New Features
- [ ] Add function/component to appropriate documentation file
- [ ] Include TypeScript interfaces and examples
- [ ] Document authentication requirements
- [ ] Add error handling patterns
- [ ] Update this index if needed

### For API Changes
- [ ] Update endpoint documentation with new parameters
- [ ] Update response schemas
- [ ] Add example requests/responses
- [ ] Document breaking changes
- [ ] Update SDK examples

### For Component Changes  
- [ ] Update component props documentation
- [ ] Add usage examples
- [ ] Document styling patterns
- [ ] Update accessibility guidelines
- [ ] Add performance considerations

---

*This documentation is automatically updated with each release. For the most current information, always refer to the source code and inline comments.*

**Last Updated**: Generated on deployment
**Version**: Current main branch
**Coverage**: All public APIs, functions, and components