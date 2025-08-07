# Slack Connect API Documentation

A full-stack application that enables users to connect their Slack workspace, send messages immediately, and schedule messages for future delivery.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)

## Features

- **OAuth 2.0 Integration**: Secure Slack workspace connection
- **Token Management**: Automatic refresh token handling
- **Message Sending**: Send messages immediately to Slack channels
- **Message Scheduling**: Schedule messages for future delivery
- **Scheduled Message Management**: View and cancel scheduled messages
- **Channel Management**: Fetch user's accessible channels

## Technology Stack

- **Backend**: Node.js with Express.js and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Slack OAuth 2.0
- **Scheduling**: Node-cron for message scheduling
- **Security**: Helmet.js, CORS, Session management

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Slack App credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slack-connect/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/slack-connect
   
   # Session Configuration
   SESSION_SECRET=your-super-secret-session-key
   
   # Slack OAuth Configuration
   SLACK_CLIENT_ID=your-slack-client-id
   SLACK_CLIENT_SECRET=your-slack-client-secret
   SLACK_REDIRECT_URI=http://localhost:3000/api/auth/callback
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3001
   ```

4. **Build and Run**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

### Slack App Setup

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Create a new app
3. Configure OAuth & Permissions:
   - Redirect URLs: `http://localhost:3000/api/auth/callback`
   - User Token Scopes: `chat:write`, `channels:read`, `channels:history`
4. Copy Client ID and Client Secret to your `.env` file

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Initiate OAuth Flow
**GET** `/auth/initiate`

Initiates the Slack OAuth flow and returns the authorization URL.

**Response:**
```json
{
  "authUrl": "https://slack.com/oauth/v2/authorize?client_id=...&user_scope=...&redirect_uri=..."
}
```

#### 2. OAuth Callback
**GET** `/auth/callback`

Handles the OAuth callback from Slack and stores user tokens.

**Query Parameters:**
- `code` (string): Authorization code from Slack

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to Slack",
  "userId": "U1234567890"
}
```

**Error Response:**
```json
{
  "error": "Authentication failed"
}
```

### Message Endpoints

#### 3. Get User Channels
**GET** `/messages/channels/:userId`

Fetches all channels the user has access to.

**Path Parameters:**
- `userId` (string): Slack user ID

**Response:**
```json
{
  "channels": [
    {
      "id": "C1234567890",
      "name": "general",
      "is_member": true
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch channels"
}
```

#### 4. Send Immediate Message
**POST** `/messages/send/:userId`

Sends a message immediately to a specified channel.

**Path Parameters:**
- `userId` (string): Slack user ID

**Request Body:**
```json
{
  "channelId": "C1234567890",
  "message": "Hello from Slack Connect!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Error Response:**
```json
{
  "error": "Failed to send message"
}
```

#### 5. Schedule Message
**POST** `/messages/schedule/:userId`

Schedules a message for future delivery.

**Path Parameters:**
- `userId` (string): Slack user ID

**Request Body:**
```json
{
  "channelId": "C1234567890",
  "channelName": "general",
  "message": "Scheduled message content",
  "scheduledFor": "2024-01-15T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message scheduled successfully",
  "scheduledMessage": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "channelId": "C1234567890",
    "channelName": "general",
    "message": "Scheduled message content",
    "scheduledFor": "2024-01-15T10:30:00.000Z",
    "sent": false,
    "createdAt": "2024-01-10T15:30:00.000Z",
    "updatedAt": "2024-01-10T15:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to schedule message"
}
```

#### 6. Get Scheduled Messages
**GET** `/messages/scheduled/:userId`

Retrieves all pending scheduled messages for a user.

**Path Parameters:**
- `userId` (string): Slack user ID

**Response:**
```json
{
  "scheduledMessages": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "channelId": "C1234567890",
      "channelName": "general",
      "message": "Scheduled message content",
      "scheduledFor": "2024-01-15T10:30:00.000Z",
      "sent": false,
      "createdAt": "2024-01-10T15:30:00.000Z",
      "updatedAt": "2024-01-10T15:30:00.000Z"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch scheduled messages"
}
```

#### 7. Cancel Scheduled Message
**DELETE** `/messages/scheduled/:messageId`

Cancels a scheduled message before it's sent.

**Path Parameters:**
- `messageId` (string): Scheduled message ID

**Query Parameters:**
- `userId` (string): Slack user ID

**Response:**
```json
{
  "success": true,
  "message": "Scheduled message cancelled"
}
```

**Error Response:**
```json
{
  "error": "Failed to cancel scheduled message"
}
```

### Health Check

#### 8. Health Check
**GET** `/health`

Returns server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-10T15:30:00.000Z"
}
```

## Authentication Flow

1. **Initiate Auth**: Frontend calls `/auth/initiate` to get OAuth URL
2. **User Authorization**: User is redirected to Slack for authorization
3. **Callback**: Slack redirects back to `/auth/callback` with authorization code
4. **Token Exchange**: Backend exchanges code for access and refresh tokens
5. **User Storage**: User data and tokens are stored in MongoDB
6. **Session Management**: User session is established for subsequent requests

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  slackUserId: String,        // Slack user ID
  slackTeamId: String,        // Slack team/workspace ID
  accessToken: String,        // Slack access token
  refreshToken: String,       // Slack refresh token
  tokenExpiresAt: Date,       // Token expiration date
  createdAt: Date,
  updatedAt: Date
}
```

### ScheduledMessage Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  channelId: String,          // Slack channel ID
  channelName: String,        // Slack channel name
  message: String,            // Message content
  scheduledFor: Date,         // Scheduled delivery time
  sent: Boolean,              // Whether message was sent
  sentAt: Date,               // When message was sent (optional)
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing required fields)
- `404`: Not Found (user/message not found)
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Descriptive error message"
}
```

## Security Features

- **CORS**: Configured for frontend domain
- **Helmet.js**: Security headers
- **Session Management**: Secure session handling
- **Token Refresh**: Automatic token refresh before expiration
- **Input Validation**: Request payload validation

## Scheduled Message Processing

The application uses a cron job that runs every minute to:
1. Check for scheduled messages due for delivery
2. Send messages using valid access tokens
3. Mark messages as sent with timestamp
4. Handle token refresh if needed

## Development

### Available Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm test`: Run tests (to be implemented)

### Project Structure
```
server/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── messageController.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── ScheduledMessage.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   └── messages.ts
│   ├── services/
│   │   ├── slackService.ts
│   │   └── schedulerService.ts
│   └── index.ts
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

## Deployment

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure `SESSION_SECRET`
- Configure production MongoDB URI
- Set production Slack redirect URI
- Configure production frontend URL

### Recommended Deployment Platforms
- **Backend**: Heroku, Render, Railway, or AWS
- **Database**: MongoDB Atlas or AWS DocumentDB
- **Frontend**: Netlify, Vercel, or AWS S3

## Support

For issues and questions:
1. Check the error logs in the console
2. Verify Slack app configuration
3. Ensure MongoDB connection is working
4. Validate environment variables are set correctly 