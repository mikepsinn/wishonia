# API Endpoints Documentation

Complete reference for all REST API endpoints in the Wishonia application.

## Base URL

```
Production: https://wishonia.com/api
Development: http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via NextAuth.js session cookies or API tokens.

### Session-based Authentication
Include session cookies with requests (handled automatically by browsers).

### Response Format

All API responses follow this standard format:

**Success Response:**
```json
{
  "data": any,
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {} // Optional additional error details
}
```

---

## Global Problems API

### GET `/api/globalProblems`

Retrieves all global problems.

**Authentication:** None required

**Query Parameters:**
- `limit` (optional): Number of problems to return (default: all)
- `offset` (optional): Number of problems to skip
- `sortBy` (optional): Field to sort by (`name`, `createdAt`, `averageAllocation`)
- `order` (optional): Sort order (`asc`, `desc`)

**Response:**
```json
{
  "data": [
    {
      "id": "clp123abc",
      "name": "Climate Change",
      "description": "Global warming and environmental degradation",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "averageAllocation": 85.5,
      "imageUrl": "https://example.com/image.jpg",
      "featuredImage": "https://example.com/featured.jpg"
    }
  ],
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Request:**
```bash
curl -X GET "https://wishonia.com/api/globalProblems?limit=10&sortBy=averageAllocation&order=desc"
```

### POST `/api/globalProblems`

Creates a new global problem.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "New Global Problem",
  "description": "Detailed description of the problem"
}
```

**Response:**
```json
{
  "data": {
    "id": "clp124xyz",
    "name": "New Global Problem",
    "description": "Detailed description of the problem",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "averageAllocation": 0,
    "imageUrl": null,
    "featuredImage": null
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Problem with similar name already exists

### GET `/api/globalProblems/[globalProblemId]`

Retrieves a specific global problem by ID.

**Authentication:** None required

**Path Parameters:**
- `globalProblemId`: Unique identifier for the global problem

**Response:**
```json
{
  "data": {
    "id": "clp123abc",
    "name": "Climate Change",
    "description": "Global warming and environmental degradation",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "averageAllocation": 85.5,
    "imageUrl": "https://example.com/image.jpg",
    "featuredImage": "https://example.com/featured.jpg",
    "solutions": [
      {
        "id": "cls456def",
        "name": "Renewable Energy",
        "description": "Transition to clean energy sources"
      }
    ]
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Global Solutions API

### GET `/api/globalSolutions`

Retrieves all global solutions.

**Authentication:** None required

**Query Parameters:**
- `limit` (optional): Number of solutions to return
- `offset` (optional): Number of solutions to skip
- `problemId` (optional): Filter by global problem ID
- `sortBy` (optional): Field to sort by
- `order` (optional): Sort order

**Response:**
```json
{
  "data": [
    {
      "id": "cls456def",
      "name": "Renewable Energy",
      "description": "Transition to clean energy sources",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "averageAllocation": 78.2,
      "imageUrl": "https://example.com/solution.jpg",
      "featuredImage": "https://example.com/featured-solution.jpg"
    }
  ],
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/globalSolutions`

Creates a new global solution.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "New Solution",
  "description": "Detailed description of the solution",
  "globalProblemId": "clp123abc" // Optional: link to specific problem
}
```

**Response:**
```json
{
  "data": {
    "id": "cls789ghi",
    "name": "New Solution",
    "description": "Detailed description of the solution",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "averageAllocation": 0,
    "imageUrl": null,
    "featuredImage": null
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Global Problem Solutions API

### GET `/api/globalProblemSolutions`

Retrieves solutions linked to specific problems.

**Authentication:** None required

**Query Parameters:**
- `problemId` (optional): Filter by global problem ID
- `solutionId` (optional): Filter by global solution ID
- `limit` (optional): Number of records to return

**Response:**
```json
{
  "data": [
    {
      "id": "clps101jkl",
      "globalProblemId": "clp123abc",
      "globalSolutionId": "cls456def",
      "averageAllocation": 82.7,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "globalProblem": {
        "id": "clp123abc",
        "name": "Climate Change"
      },
      "globalSolution": {
        "id": "cls456def",
        "name": "Renewable Energy"
      }
    }
  ],
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/globalProblemSolutions`

Links a solution to a problem or creates both.

**Authentication:** Required

**Request Body:**
```json
{
  "globalProblemId": "clp123abc",
  "globalSolutionId": "cls456def"
}
```

**Alternative - Create solution for problem:**
```json
{
  "globalProblemId": "clp123abc",
  "solutionName": "New Solution Name",
  "solutionDescription": "Description of the new solution"
}
```

---

## Voting API

### POST `/api/vote`

Records a user's vote between two entities.

**Authentication:** Required (or anonymous tracking)

**Request Body:**
```json
{
  "thisOneId": "clp123abc",
  "notThisOneId": "clp456def",
  "type": "globalProblems"
}
```

**Supported Types:**
- `globalProblems`
- `globalSolutions`
- `globalProblemSolutions`
- `wishingWells`

**Response:**
```json
{
  "data": {
    "id": "clv789xyz",
    "userId": "clu123abc",
    "thisOneId": "clp123abc",
    "notThisOneId": "clp456def",
    "type": "globalProblems",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid vote type or missing IDs
- `409 Conflict`: User has already voted on this pair

---

## Wishing Wells API

### GET `/api/wishingWells`

Retrieves all wishing wells (user wishes).

**Authentication:** None required

**Query Parameters:**
- `limit` (optional): Number of wells to return
- `userId` (optional): Filter by user ID
- `sortBy` (optional): Field to sort by

**Response:**
```json
{
  "data": [
    {
      "id": "clw123abc",
      "name": "World Peace",
      "description": "End all conflicts and achieve global harmony",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "averageAllocation": 92.1,
      "userId": "clu123abc",
      "user": {
        "id": "clu123abc",
        "username": "peaceful_user",
        "image": "https://example.com/avatar.jpg"
      }
    }
  ],
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/wishingWells`

Creates a new wishing well.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Wish",
  "description": "Detailed description of what I wish for"
}
```

**Response:**
```json
{
  "data": {
    "id": "clw456def",
    "name": "My Wish",
    "description": "Detailed description of what I wish for",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "averageAllocation": 0,
    "userId": "clu123abc"
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## User API

### GET `/api/users/[userId]`

Retrieves user information by ID.

**Authentication:** Required (must be the user or admin)

**Path Parameters:**
- `userId`: Unique identifier for the user

**Response:**
```json
{
  "data": {
    "id": "clu123abc",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "image": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "admin": false,
    "_count": {
      "globalProblems": 5,
      "globalSolutions": 12,
      "wishingWells": 3,
      "votes": 150
    }
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this user
- `404 Not Found`: User does not exist

---

## Chat API

### POST `/api/chat`

Handles AI chat interactions.

**Authentication:** Required

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What are the biggest global problems?"
    }
  ],
  "agentId": "agent-123", // Optional: specify agent
  "chatId": "chat-456" // Optional: continue existing chat
}
```

**Response (Streaming):**
```
data: {"type": "message", "content": "The biggest global problems include"}
data: {"type": "message", "content": " climate change, poverty, and"}
data: {"type": "message", "content": " inequality. Let me explain each..."}
data: {"type": "done"}
```

**Response (Non-streaming):**
```json
{
  "data": {
    "id": "msg-789",
    "content": "The biggest global problems include climate change, poverty, and inequality. Let me explain each...",
    "role": "assistant",
    "chatId": "chat-456",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Upload APIs

### POST `/api/upload-avatar`

Uploads user avatar image.

**Authentication:** Required

**Request:** Multipart form data
- `file`: Image file (JPG, PNG, WebP, max 5MB)

**Response:**
```json
{
  "data": {
    "url": "https://storage.example.com/avatars/user-123.jpg",
    "width": 400,
    "height": 400,
    "size": 102400
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file format or size
- `413 Payload Too Large`: File exceeds size limit

### POST `/api/upload-document`

Uploads document files for processing.

**Authentication:** Required

**Request:** Multipart form data
- `file`: Document file (PDF, DOC, DOCX, TXT, max 10MB)
- `type` (optional): Document type for processing

**Response:**
```json
{
  "data": {
    "id": "doc-123",
    "filename": "research.pdf",
    "url": "https://storage.example.com/documents/research.pdf",
    "size": 2048000,
    "type": "application/pdf",
    "processed": false
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Search API

### GET `/api/advanced-search`

Performs advanced search across entities.

**Authentication:** None required

**Query Parameters:**
- `q`: Search query string
- `type`: Entity type (`problems`, `solutions`, `users`, `all`)
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Result offset for pagination

**Response:**
```json
{
  "data": {
    "results": [
      {
        "id": "clp123abc",
        "type": "globalProblem",
        "title": "Climate Change",
        "description": "Global warming and environmental degradation",
        "relevanceScore": 0.95,
        "url": "/globalProblems/clp123abc"
      }
    ],
    "total": 42,
    "hasMore": true
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/vector-search`

Performs semantic search using embeddings.

**Authentication:** None required

**Request Body:**
```json
{
  "query": "solutions for climate change",
  "type": "globalSolutions",
  "limit": 10,
  "threshold": 0.7
}
```

**Response:**
```json
{
  "data": {
    "results": [
      {
        "id": "cls456def",
        "name": "Renewable Energy",
        "description": "Transition to clean energy sources",
        "similarity": 0.89,
        "metadata": {
          "averageAllocation": 78.2,
          "voteCount": 1543
        }
      }
    ],
    "queryVector": [0.1, 0.2, 0.3], // Optional: return the query embedding
    "total": 15
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Analytics API

### GET `/api/analytics/problems`

Retrieves analytics data for global problems.

**Authentication:** None required

**Query Parameters:**
- `timeframe`: Period for analytics (`day`, `week`, `month`, `year`)
- `metric`: Metric to retrieve (`votes`, `allocations`, `views`)

**Response:**
```json
{
  "data": {
    "topProblems": [
      {
        "id": "clp123abc",
        "name": "Climate Change",
        "value": 1543,
        "change": "+12.5%"
      }
    ],
    "trends": [
      {
        "date": "2024-01-01",
        "votes": 156,
        "allocations": 789.5
      }
    ],
    "summary": {
      "totalVotes": 15680,
      "totalAllocations": 892341.2,
      "activeUsers": 2341
    }
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Webhook API

### POST `/api/webhooks/stripe`

Handles Stripe webhook events for payments.

**Authentication:** Stripe signature verification

**Request Body:** Stripe webhook payload

**Response:**
```json
{
  "received": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/webhooks/github`

Handles GitHub webhook events.

**Authentication:** GitHub signature verification

**Request Body:** GitHub webhook payload

---

## Rate Limiting

API endpoints are rate limited per user/IP:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **Upload endpoints**: 50 requests per hour
- **Chat endpoints**: 200 requests per hour

**Rate limit headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
```

**Rate limit exceeded response:**
```json
{
  "error": "Rate limit exceeded",
  "statusCode": 429,
  "retryAfter": 3600,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 413 | Payload Too Large - File size exceeded |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## SDKs and Examples

### JavaScript/TypeScript

```typescript
import { WishoniaAPI } from '@wishonia/sdk'

const api = new WishoniaAPI({
  baseURL: 'https://wishonia.com/api',
  sessionToken: 'your-session-token'
})

// Get global problems
const problems = await api.globalProblems.list({
  limit: 10,
  sortBy: 'averageAllocation'
})

// Create a vote
await api.votes.create({
  thisOneId: 'problem-1',
  notThisOneId: 'problem-2',
  type: 'globalProblems'
})
```

### cURL Examples

```bash
# Get global problems
curl -X GET "https://wishonia.com/api/globalProblems?limit=5" \
  -H "Accept: application/json"

# Create a global problem (requires authentication)
curl -X POST "https://wishonia.com/api/globalProblems" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "name": "Digital Divide",
    "description": "Unequal access to digital technologies"
  }'

# Vote between two problems
curl -X POST "https://wishonia.com/api/vote" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "thisOneId": "clp123abc",
    "notThisOneId": "clp456def",
    "type": "globalProblems"
  }'
```

---

*This API documentation covers all public endpoints in the Wishonia application. For implementation details and advanced usage, refer to the source code and component documentation.*