# Wishonia API Documentation

A comprehensive guide to all public APIs, functions, and components in the Wishonia project.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
- [Core Libraries](#core-libraries)
- [React Components](#react-components)
- [Hooks](#hooks)
- [Utilities](#utilities)
- [Types](#types)
- [Configuration](#configuration)

---

## Overview

Wishonia is a Next.js 15 application built with TypeScript, Tailwind CSS, and Prisma. It features a comprehensive voting system for global problems and solutions, user authentication, and AI-powered content generation.

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Package Manager**: pnpm
- **Deployment**: Vercel

---

## Authentication

### Configuration

The authentication system is configured in `lib/auth.ts` using NextAuth.js.

```typescript
import { authOptions } from '@/lib/auth'
```

#### Supported Providers
- **Email** - Magic link authentication
- **Google OAuth**
- **GitHub OAuth** 
- **dFDA (Decentralized FDA)** - Custom OAuth provider

#### Server-Side Authentication

```typescript
// In server components (page.tsx files)
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const session = await getServerSession(authOptions)

if (!session?.user) {
  redirect(`/signin?callbackUrl=/protected-page`)
}
```

#### Client-Side Authentication

```typescript
// In client components
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
```

---

## REST API Endpoints

### Global Problems API

#### GET `/api/globalProblems`
Retrieves all global problems.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string", 
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST `/api/globalProblems`
Creates a new global problem.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

### Global Solutions API

#### GET `/api/globalSolutions`
Retrieves all global solutions.

#### POST `/api/globalSolutions`
Creates a new global solution.

**Authentication:** Required

### Global Problem Solutions API

#### GET `/api/globalProblemSolutions`
Retrieves all global problem solutions.

#### POST `/api/globalProblemSolutions`
Creates a new global problem solution.

**Authentication:** Required

### Voting API

#### POST `/api/vote`
Records a user's vote on various entities.

**Authentication:** Required

**Request Body:**
```json
{
  "thisOneId": "string",
  "notThisOneId": "string", 
  "type": "globalProblems" | "globalSolutions" | "wishingWells"
}
```

### Upload APIs

#### POST `/api/upload-avatar`
Uploads user avatar image.

**Authentication:** Required

#### POST `/api/upload-document`  
Uploads document files.

**Authentication:** Required

### Chat API

#### POST `/api/chat`
Handles AI chat interactions.

**Authentication:** Required

### User API

#### GET `/api/users/[userId]`
Retrieves user information by ID.

---

## Core Libraries

### Logger (`lib/logger.ts`)

Centralized logging system with Sentry integration.

```typescript
import { logger } from '@/lib/logger'

// Basic logging
logger.info('Operation completed')
logger.debug('Debug details', { userId: 123, action: 'signup' })

// Error logging (automatically sent to Sentry)
logger.error('Operation failed', error)
logger.error('Operation failed', {
  error,
  metadata: { operation: 'signup' }
})

// Structured data
logger.info('Search results', { results, count, query })
logger.warn('Rate limit', rateLimitData)
```

#### Logger Options
```typescript
interface LoggerOptions {
  metadata?: any
  error?: Error | unknown
  user?: {
    id?: string
    email?: string
    username?: string
  }
  fingerprint?: string[]
  sampleRate?: number
  transaction?: string
  severity?: SeverityLevel
}
```

### Database (`lib/db.ts`)

Prisma client configuration.

```typescript
import { prisma } from '@/lib/db'

// Basic usage
const users = await prisma.user.findMany()
const user = await prisma.user.findUnique({
  where: { id: userId }
})
```

### Utilities (`lib/utils.ts`)

Common utility functions.

#### `cn(...inputs: ClassValue[])`
Combines class names using clsx and tailwind-merge.

```typescript
import { cn } from '@/lib/utils'

const className = cn('base-class', {
  'conditional-class': condition,
  'another-class': anotherCondition
})
```

#### `formatDate(input: string | number | Date): string`
Formats dates in US format.

```typescript
const formatted = formatDate(new Date()) // "Jan 1, 2024"
```

#### `dateRangeParams(searchParams: { from: string; to: string })`
Parses and validates date range parameters.

#### `nanoid`
Generates unique IDs.

```typescript
import { nanoid } from '@/lib/utils'

const id = nanoid() // 7-character unique ID
```

#### `sleep(ms: number)`
Promise-based delay function.

```typescript
await sleep(1000) // Wait 1 second
```

#### `absoluteUrl(path: string)`
Generates absolute URLs.

```typescript
const url = absoluteUrl('/api/endpoint') // https://wishonia.com/api/endpoint
```

### LLM Integration (`lib/llm.ts`)

OpenAI integration for text completion and AI features.

#### `textCompletion(promptText: string, systemPrompt?: string)`
Generates text completions.

```typescript
import { textCompletion } from '@/lib/llm'

const response = await textCompletion(
  "Write a summary of climate change",
  "You are an expert climate scientist"
)
```

#### `jsonArrayCompletion(promptText: string)`
Generates structured JSON array responses.

```typescript
const results = await jsonArrayCompletion(
  "List 5 renewable energy sources"
)
```

#### `askYesOrNoQuestion(question: string)`
Gets boolean responses from AI.

```typescript
const answer = await askYesOrNoQuestion("Is renewable energy important?")
```

### Global Problems (`lib/globalProblems.ts`)

Functions for managing global problems and voting.

#### `getRandomGlobalProblemPair(userId?: string)`
Gets a random pair of global problems for voting.

```typescript
import { getRandomGlobalProblemPair } from '@/lib/globalProblems'

const pair = await getRandomGlobalProblemPair(userId)
```

#### `createGlobalProblem(name: string, description: string, userId: string)`
Creates a new global problem.

#### `aggregateGlobalProblemPairAllocations()`
Aggregates voting results for global problems.

### Global Solutions (`lib/globalSolutions.ts`)

Functions for managing global solutions.

#### `getRandomGlobalSolutionPair(userId?: string)`
Gets a random pair of global solutions for voting.

#### `createGlobalSolution(name: string, description: string, userId: string)`
Creates a new global solution.

#### `isGoodSolution(solution: string, problem: string)`
AI-powered validation of solution quality.

### Wishing Wells (`lib/wishingWells.ts`)

Functions for managing wishing wells (user wishes/desires).

#### `getRandomWishingWellPair(userId?: string)`
Gets a random pair of wishing wells for voting.

#### `saveWishToWishingWell(wish: string, userId: string)`
Saves a user's wish as a wishing well.

#### `wishToWishingWell(wish: string)`
Converts a wish string to a formatted wishing well.

### Image Generation (`lib/imageGenerator.ts`)

AI-powered image generation using OpenAI DALL-E.

#### `generateImage(prompt: string, size?: string)`
Generates images from text prompts.

```typescript
import { generateImage } from '@/lib/imageGenerator'

const imageUrl = await generateImage("A sustainable city with green buildings")
```

#### `generateAndUploadFeaturedImageJpg(name: string, description: string)`
Generates and uploads featured images for content.

### Content Generation

#### Markdown Generator (`lib/markdownGenerator.ts`)

#### `saveMarkdownPost(title: string, content: string, featuredImage?: string)`
Saves markdown content as a post.

#### `generateMarkdownAndImageFromDescription(name: string, description: string)`
Generates both markdown content and featured image.

#### Global Problem Generator (`lib/globalProblemGenerator.ts`)

#### `generateGlobalProblems()`
Generates a set of global problems using AI.

#### `generateAndSaveGlobalProblem(name: string, userId: string, description?: string)`
Generates and saves a single global problem.

---

## React Components

### UI Components (`components/ui/`)

Built with Radix UI primitives and styled with Tailwind CSS.

#### Button (`components/ui/button.tsx`)

```typescript
import { Button } from '@/components/ui/button'

<Button variant="default" size="lg">
  Click me
</Button>

<Button variant="destructive">
  Delete
</Button>

<Button variant="neobrutalist">
  Special Style
</Button>
```

**Variants:**
- `default` - Primary button style
- `destructive` - Red destructive action style  
- `outline` - Outlined button
- `secondary` - Secondary style
- `ghost` - Transparent background
- `link` - Link appearance
- `neobrutalist` - Special neo-brutalist design

**Sizes:**
- `default` - Standard size
- `sm` - Small
- `lg` - Large  
- `icon` - Square icon button

#### Card (`components/ui/card.tsx`)

```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content here
  </CardContent>
  <CardFooter>
    Card footer
  </CardFooter>
</Card>
```

#### Input (`components/ui/input.tsx`)

```typescript
import { Input } from '@/components/ui/input'

<Input 
  type="text" 
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### Dialog (`components/ui/dialog.tsx`)

```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    Dialog content here
  </DialogContent>
</Dialog>
```

#### Form (`components/ui/form.tsx`)

Built with react-hook-form integration.

```typescript
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'

const form = useForm()

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="Username" {...field} />
          </FormControl>
          <FormDescription>
            This is your public display name.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Feature Components

#### Navigation (`components/Navigation.tsx`)

Main navigation component with authentication support.

```typescript
import { Navigation } from '@/components/Navigation'

<Navigation />
```

#### ChatPanel (`components/ChatPanel.tsx`)

AI chat interface component.

```typescript
import { ChatPanel } from '@/components/ChatPanel'

<ChatPanel 
  id={chatId}
  initialMessages={messages}
  className="w-full h-96"
/>
```

#### PromptForm (`components/PromptForm.tsx`)

Form for submitting prompts to AI.

```typescript
import { PromptForm } from '@/components/PromptForm'

<PromptForm
  onSubmit={handleSubmit}
  input={input}
  setInput={setInput}
  isLoading={isLoading}
/>
```

#### Global Problems List (`components/global-problems-list.tsx`)

Displays list of global problems with voting interface.

```typescript
import { GlobalProblemsList } from '@/components/global-problems-list'

<GlobalProblemsList userId={userId} />
```

#### Global Solutions List (`components/global-solutions-list.tsx`)

Displays list of global solutions.

```typescript
import { GlobalSolutionsList } from '@/components/global-solutions-list'

<GlobalSolutionsList />
```

#### Data Table (`components/data-table.tsx`)

Generic data table with sorting and filtering.

```typescript
import { DataTable } from '@/components/data-table'

<DataTable
  columns={columns}
  data={data}
  searchKey="name"
/>
```

#### Charts

##### Bar Chart General (`components/bar-chart-general.tsx`)

```typescript
import { BarChartGeneral } from '@/components/bar-chart-general'

<BarChartGeneral
  data={chartData}
  title="Chart Title"
  description="Chart description"
/>
```

##### Global Problems Pie Chart (`components/global-problems-pie-chart.tsx`)

```typescript
import { GlobalProblemsPieChart } from '@/components/global-problems-pie-chart'

<GlobalProblemsPieChart />
```

#### File Upload (`components/FileUploader.tsx`)

File upload component with drag-and-drop support.

```typescript
import { FileUploader } from '@/components/FileUploader'

<FileUploader
  onFileSelect={handleFileSelect}
  acceptedFileTypes={['.pdf', '.doc', '.docx']}
  maxFileSize={10} // MB
/>
```

#### Loading Components

##### Loading Spinner (`components/LoadingSpinner.tsx`)

```typescript
import { LoadingSpinner } from '@/components/LoadingSpinner'

<LoadingSpinner />
```

##### AI Step Loader (`components/AIStepLoader.tsx`)

```typescript
import { AIStepLoader } from '@/components/AIStepLoader'

<AIStepLoader 
  steps={steps}
  currentStep={currentStep}
/>
```

---

## Hooks

### Custom Hooks (`hooks/`)

#### `donate-modal.ts`
Hook for managing donation modal state.

```typescript
import { useDonateModal } from '@/hooks/donate-modal'

const { isOpen, open, close } = useDonateModal()
```

#### `use-media-query.tsx`
Hook for responsive design based on media queries.

```typescript
import { useMediaQuery } from '@/hooks/use-media-query'

const isMobile = useMediaQuery('(max-width: 768px)')
```

#### `use-mobile.tsx`
Hook to detect mobile devices.

```typescript
import { useMobile } from '@/hooks/use-mobile'

const isMobile = useMobile()
```

### Authentication Hooks (`lib/`)

#### `useUser.ts`
Hook to get current user information.

```typescript
import { useUser } from '@/lib/useUser'

const user = useUser()
```

#### `useUserIdClient.ts`
Hook to get current user ID on client side.

```typescript
import { useUserIdClient } from '@/lib/useUserIdClient'

const userId = useUserIdClient()
```

#### `useUserLoggedIn.ts`
Hook to check if user is logged in.

```typescript
import { useUserLoggedIn } from '@/lib/useUserLoggedIn'

const isLoggedIn = useUserLoggedIn()
```

---

## Types

### Core Types (`types/index.d.ts`)

#### `SiteConfig`
Configuration type for site metadata.

```typescript
type SiteConfig = {
  name: string
  author: string
  description: string
  keywords: Array<string>
  url: {
    base: string
    author: string
  }
  links: {
    github: string
  }
  ogImage: string
  defaultHomepage: string
  afterLoginPath: string
}
```

#### `NavItem`
Navigation item type.

```typescript
type NavItem = {
  title: string
  tooltip?: string
  disabled?: boolean
  external?: boolean
  img?: string
  icon?: IconKeys
  href: string
}
```

#### `DateRange`
Date range type for filtering.

```typescript
type DateRange = {
  from: Date
  to: Date
}
```

#### `WishingWellEntry`
Wishing well data type.

```typescript
type WishingWellEntry = {
  name: string
  count: number | null
}
```

### Prisma Types

Import directly from Prisma client:

```typescript
import { User, GlobalProblem, GlobalSolution, WishingWell } from '@prisma/client'
```

### Chat Types (`types/chat.ts`)

```typescript
interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

interface Chat {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}
```

---

## Configuration

### Environment Variables

Required environment variables (see `env.mjs`):

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
DFDA_CLIENT_ID="..."
DFDA_CLIENT_SECRET="..."

# Email
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@wishonia.com"

# OpenAI
OPENAI_API_KEY="sk-..."

# Vercel
BLOB_READ_WRITE_TOKEN="..."

# Sentry
SENTRY_DSN="..."
```

### Tailwind Configuration

Custom theme configuration in `tailwind.config.js`:

- **Colors**: Extended color palette with custom brand colors
- **Fonts**: Custom font families
- **Components**: Extended component utilities
- **Animations**: Custom animation classes

### Next.js Configuration

Key configurations in `next.config.js`:

- **Bundle Analyzer**: Optional bundle analysis
- **Images**: Optimized image domains
- **Experimental**: App directory features
- **Redirects**: Custom redirect rules

---

## Error Handling

### Global Error Handler (`lib/errorHandler.ts`)

```typescript
import { handleError } from '@/lib/errorHandler'

try {
  // Some operation
} catch (error) {
  return handleError(error, 'Custom message', { metadata })
}
```

### Error Boundaries

Global error boundary in `app/global-error.tsx` for unhandled errors.

### API Error Responses

Standard error response format:

```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Testing

### Test Configuration

- **Framework**: Jest with jsdom environment
- **Test Files**: `tests/` directory
- **Setup**: `jest.setup.js` and `jest.config.js`
- **Environment**: Node environment for all tests

### Running Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests in CI mode
pnpm test:ci

# Run database seed tests
pnpm seed
```

---

## Contributing

### Code Style

- **Prettier**: Automated code formatting
- **ESLint**: Code linting with Next.js and TypeScript rules
- **TypeScript**: Strict mode enabled
- **Import Rules**: Organized import statements

### Development Workflow

1. Install dependencies: `pnpm install`
2. Set up environment variables
3. Run database migrations: `pnpm prisma:migrate`
4. Start development server: `pnpm dev`
5. Run tests: `pnpm test`

### Component Guidelines

- Use server components by default in `app/` directory
- Add `'use client'` only when necessary (hooks, browser APIs, interactions)
- Import from `@prisma/client` for types instead of creating new ones
- Use the project's logger instead of `console.log`
- Follow the established authentication patterns

---

## Support

For questions or issues:

1. Check the documentation
2. Review existing code examples
3. Create an issue in the repository
4. Follow the established patterns and conventions

---

*This documentation is generated for the Wishonia project. For the most up-to-date information, refer to the source code and inline comments.*