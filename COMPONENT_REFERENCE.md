# Component Reference Guide

Detailed reference for all React components in the Wishonia project.

## UI Components (`components/ui/`)

### Form Components

#### Accordion
Collapsible content sections.

```typescript
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Alert Dialog
Modal dialogs for important actions.

```typescript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Avatar
User profile images with fallbacks.

```typescript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

#### Badge
Small status indicators.

```typescript
import { Badge } from '@/components/ui/badge'

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Calendar
Date picker component.

```typescript
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'

const [date, setDate] = useState<Date | undefined>(new Date())

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>
```

#### Carousel
Image and content carousels.

```typescript
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

<Carousel className="w-full max-w-xs">
  <CarouselContent>
    {Array.from({ length: 5 }).map((_, index) => (
      <CarouselItem key={index}>
        <div className="p-1">
          <Card>
            <CardContent className="flex aspect-square items-center justify-center p-6">
              <span className="text-4xl font-semibold">{index + 1}</span>
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

#### Checkbox
Checkbox input with custom styling.

```typescript
import { Checkbox } from '@/components/ui/checkbox'

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="text-sm font-medium">
    Accept terms and conditions
  </label>
</div>
```

#### Combobox
Searchable select dropdown.

```typescript
import { Combobox } from '@/components/ui/combobox'

<Combobox
  options={frameworks}
  value={value}
  onValueChange={setValue}
  placeholder="Select framework..."
  searchPlaceholder="Search frameworks..."
/>
```

#### Command
Command palette and search interface.

```typescript
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command'

<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>
        <Calendar className="mr-2 h-4 w-4" />
        <span>Calendar</span>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

#### Dropdown Menu
Context menus and dropdowns.

```typescript
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Navigation Menu
Main navigation with flyout menus.

```typescript
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          <li className="row-span-3">
            <NavigationMenuLink asChild>
              <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/">
                <div className="mb-2 mt-4 text-lg font-medium">
                  Wishonia
                </div>
                <p className="text-sm leading-tight text-muted-foreground">
                  A platform for solving global problems
                </p>
              </a>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

#### Popover
Floating content containers.

```typescript
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Dimensions</h4>
        <p className="text-sm text-muted-foreground">
          Set the dimensions for the layer.
        </p>
      </div>
    </div>
  </PopoverContent>
</Popover>
```

#### Progress
Progress indicators.

```typescript
import { Progress } from '@/components/ui/progress'

<Progress value={33} className="w-[60%]" />
```

#### Radio Group
Radio button groups.

```typescript
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

<RadioGroup defaultValue="comfortable">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="default" id="r1" />
    <Label htmlFor="r1">Default</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="comfortable" id="r2" />
    <Label htmlFor="r2">Comfortable</Label>
  </div>
</RadioGroup>
```

#### Scroll Area
Custom scrollbar areas.

```typescript
import { ScrollArea } from '@/components/ui/scroll-area'

<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  {/* Content that scrolls */}
</ScrollArea>
```

#### Select
Dropdown select input.

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

#### Sheet
Slide-out panels.

```typescript
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Are you absolutely sure?</SheetTitle>
      <SheetDescription>
        This action cannot be undone.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

#### Skeleton
Loading placeholders.

```typescript
import { Skeleton } from '@/components/ui/skeleton'

<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>
```

#### Slider
Range slider input.

```typescript
import { Slider } from '@/components/ui/slider'

<Slider
  defaultValue={[50]}
  max={100}
  step={1}
  className="w-[60%]"
/>
```

#### Switch
Toggle switch input.

```typescript
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>
```

#### Table
Data tables with sorting and styling.

```typescript
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Tabs
Tabbed content areas.

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Make changes to your account here.
  </TabsContent>
  <TabsContent value="password">
    Change your password here.
  </TabsContent>
</Tabs>
```

#### Textarea
Multi-line text input.

```typescript
import { Textarea } from '@/components/ui/textarea'

<Textarea placeholder="Type your message here." />
```

#### Toast
Notification messages.

```typescript
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

const { toast } = useToast()

<Button
  onClick={() => {
    toast({
      title: "Success",
      description: "Your message has been sent.",
    })
  }}
>
  Show toast
</Button>
```

#### Tooltip
Hover information tooltips.

```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Feature Components

### Chat Components

#### Chat (`components/Chat.tsx`)
Main chat interface.

**Props:**
```typescript
interface ChatProps {
  id?: string
  initialMessages?: Message[]
  userId?: string
  agentId?: string
  className?: string
}
```

**Usage:**
```typescript
import { Chat } from '@/components/Chat'

<Chat
  id="chat-123"
  initialMessages={messages}
  userId={userId}
  agentId="agent-456"
  className="h-96"
/>
```

#### ChatMessage (`components/ChatMessage.tsx`)
Individual chat message display.

**Props:**
```typescript
interface ChatMessageProps {
  message: Message
  isLoading?: boolean
  onEdit?: (content: string) => void
  onDelete?: () => void
}
```

#### ChatSidebar (`components/ChatSidebar.tsx`)
Chat history sidebar.

**Props:**
```typescript
interface ChatSidebarProps {
  chats: Chat[]
  currentChatId?: string
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}
```

### Global Problems Components

#### GlobalProblemsList (`components/global-problems-list.tsx`)
List of global problems with voting.

**Props:**
```typescript
interface GlobalProblemsListProps {
  userId?: string
  showVoting?: boolean
  limit?: number
  className?: string
}
```

**Usage:**
```typescript
import { GlobalProblemsList } from '@/components/global-problems-list'

<GlobalProblemsList
  userId={userId}
  showVoting={true}
  limit={10}
/>
```

#### GlobalProblemsPieChart (`components/global-problems-pie-chart.tsx`)
Pie chart visualization of global problems.

**Usage:**
```typescript
import { GlobalProblemsPieChart } from '@/components/global-problems-pie-chart'

<GlobalProblemsPieChart />
```

### Voting Components

#### AnonymousVoteButton (`components/anonymous-vote-button.tsx`)
Vote button for anonymous users.

**Props:**
```typescript
interface AnonymousVoteButtonProps {
  thisOneId: string
  notThisOneId: string
  type: 'globalProblems' | 'globalSolutions' | 'wishingWells'
  onVote?: () => void
}
```

#### Poll Components
Various polling components for different entity types:
- `PollRandomGlobalProblems`
- `PollRandomGlobalSolutions`
- `PollRandomWishingWells`
- `PollWarVsCures`

### Data Visualization

#### BarChartGeneral (`components/bar-chart-general.tsx`)
Generic bar chart component.

**Props:**
```typescript
interface BarChartGeneralProps {
  data: Array<{ name: string; value: number }>
  title?: string
  description?: string
  height?: number
  color?: string
}
```

#### WarVsCuresBarChart (`components/war-vs-cures-bar-chart.tsx`)
Specialized chart comparing war vs cure funding.

### File and Media Components

#### FileUploader (`components/FileUploader.tsx`)
Drag-and-drop file upload.

**Props:**
```typescript
interface FileUploaderProps {
  onFileSelect: (file: File) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  multiple?: boolean
  disabled?: boolean
}
```

#### CameraButton (`components/CameraButton.tsx`)
Camera capture for mobile devices.

**Props:**
```typescript
interface CameraButtonProps {
  onCapture: (file: File) => void
  disabled?: boolean
}
```

### Layout Components

#### Navigation (`components/Navigation.tsx`)
Main site navigation.

**Props:**
```typescript
interface NavigationProps {
  user?: User
  className?: string
}
```

#### Sidebar (`components/Sidebar.tsx`)
Collapsible sidebar container.

#### Breadcrumbs (`components/Breadcrumbs/`)
Navigation breadcrumbs.

### Modal Components

#### NeoBrutalModal (`components/NeoBrutalModal.tsx`)
Custom styled modal dialog.

**Props:**
```typescript
interface NeoBrutalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
```

#### LoginPromptButton (`components/LoginPromptButton.tsx`)
Button that prompts for login.

### User Components

#### UserBadge (`components/UserBadge.tsx`)
User profile display badge.

**Props:**
```typescript
interface UserBadgeProps {
  user: User
  showEmail?: boolean
  showJoinDate?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

### Utility Components

#### LoadingSpinner (`components/LoadingSpinner.tsx`)
Simple loading indicator.

#### EmptyPlaceholder (`components/empty-placeholder.tsx`)
Empty state placeholder.

**Props:**
```typescript
interface EmptyPlaceholderProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}
```

#### WorkInProgressBanner (`components/WorkInProgressBanner.tsx`)
Work in progress notification banner.

### Theme Components

#### ThemeToggle (`components/ThemeToggle.tsx`)
Dark/light mode toggle.

#### ThemeProvider (`components/theme-provider.tsx`)
Theme context provider.

## Custom Hooks Usage

### Form Hooks

Most components integrate with `react-hook-form`:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const formSchema = z.object({
  username: z.string().min(2).max(50),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    username: "",
  },
})
```

### State Management

Components use Zustand for global state:

```typescript
import { create } from 'zustand'

interface LoadingStore {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))
```

## Styling Guidelines

### Component Styling
- Use Tailwind CSS classes
- Leverage the `cn()` utility for conditional classes
- Follow the design system color palette
- Use consistent spacing and typography scales

### Responsive Design
- Mobile-first approach
- Use responsive utilities (`sm:`, `md:`, `lg:`, `xl:`)
- Test on multiple screen sizes

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation
- Use semantic HTML elements
- Provide focus indicators

## Performance Considerations

### Component Optimization
- Use `React.memo()` for expensive components
- Implement `useMemo()` and `useCallback()` appropriately
- Lazy load heavy components
- Optimize image loading with Next.js Image component

### Bundle Size
- Import only needed components
- Use dynamic imports for large dependencies
- Monitor bundle size with the analyzer

---

*This component reference provides detailed usage examples for all major components in the Wishonia project. For the most current props and APIs, refer to the component source files.*