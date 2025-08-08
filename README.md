# Cobolt Slack Manager

A full-stack Slack message scheduling application that enables users to connect their Slack workspace, send messages immediately, and schedule messages for future delivery with an intuitive web interface.

## 🌐 Live Demo

**🚀 Try it out now!** Visit our live application:
- **Live Demo (Hosted on Vercel + Render)**: [https://slack-cobalt.vercel.app/login](https://slack-cobalt.vercel.app/login)

**📹 Live Demo Running AppVideo**: (https://drive.google.com/file/d/1v-1IQBj0cgNLpHvIyxlQz5468F-qIS3B/view)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local instance or MongoDB Atlas account)
- **Slack App** credentials (Client ID and Client Secret)


## 🏗️ Project Structure

```
cobolt-slack-manager/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── stores/         # Zustand state management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Express middleware
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd cobolt-slack-manager
```

### 2. Backend Setup

#### Navigate to Server Directory
```bash
cd server
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
```bash
cp env.example .env
```

Edit the `.env` file with your credentials:

```env
# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=5000
NODE_ENV=development

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# MongoDB Atlas URI (replace with your connection string)
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/cobolt-slack

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
# Session secret (generate a strong random string)
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long

# JWT secret (generate a strong random string)
JWT_SECRET=your-jwt-secret-key-at-least-32-characters-long

# ===========================================
# SLACK OAUTH CONFIGURATION
# ===========================================
# Get these from your Slack App settings
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_REDIRECT_URI=http://localhost:5000/api/auth/callback

# ===========================================
# CORS CONFIGURATION
# ===========================================
# Frontend URL (for CORS policy)
FRONTEND_URL=http://localhost:5173

# ===========================================
# OPTIONAL CONFIGURATION
# ===========================================
# Log level (debug, info, warn, error)
LOG_LEVEL=info

# Scheduler interval in minutes (default: 1)
SCHEDULER_INTERVAL=1
```

#### Build and Run Backend
```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to Client Directory
```bash
cd ../client
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the client directory:

```env
# ===========================================
# API CONFIGURATION
# ===========================================
# Backend API base URL
VITE_API_BASE_URL=http://localhost:5000

# ===========================================
# SLACK CONFIGURATION
# ===========================================
# Slack Client ID (same as backend)
VITE_SLACK_CLIENT_ID=your-slack-client-id

# ===========================================
# OPTIONAL CONFIGURATION
# ===========================================
# App title
VITE_APP_TITLE=Cobolt Slack Manager

# Environment mode
VITE_NODE_ENV=development

# Enable/disable debug mode
VITE_DEBUG=true
```

#### Run Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Slack App Configuration

#### Create a Slack App
1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name and select your workspace

#### Configure OAuth & Permissions
1. Navigate to "OAuth & Permissions" in the sidebar
2. Add the following redirect URL:
   ```
   http://localhost:5000/api/auth/callback
   ```
3. Under "User Token Scopes", add these scopes:
   - `channels:read` - View basic information about public channels
   - `groups:read` - View basic information about private channels
   - `chat:write` - Send messages as the app
   - `chat:write.public` - Send messages to channels the app isn't in
   - `users:read` - View people in the workspace

#### Install App to Workspace
1. Go to "Install App" in the sidebar
2. Click "Install to Workspace"
3. Copy the "Client ID" and "Client Secret" to your backend `.env` file


#### Production Environment Variables
For production deployment, update these values:
```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
SLACK_REDIRECT_URI=https://your-domain.com/api/auth/callback
LOG_LEVEL=warn
```

## 🚀 Running the Application

### Development Mode
1. **Start Backend**: In the `server` directory, run `npm run dev`
2. **Start Frontend**: In the `client` directory, run `npm run dev`
3. **Access Application**: Open `http://localhost:5173` in your browser

### Production Mode
1. **Build Backend**: In the `server` directory, run `npm run build`
2. **Start Backend**: Run `npm start`
3. **Build Frontend**: In the `client` directory, run `npm run build`
4. **Serve Frontend**: Use a static file server to serve the `dist` folder

---

## 🎯 What's Next?

After setting up the application:
1. **Connect your Slack workspace** using the OAuth flow
2. **Browse your channels** and select where to send messages
3. **Schedule messages** for future delivery with precise timing
4. **Monitor your scheduled messages** in real-time
5. **Send immediate messages** to any channel you have access to

---

## 🏗️ Architecture Overview

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui components for modern design
- **State Management**: Zustand for lightweight state management
- **Routing**: React Router DOM for client-side navigation
- **HTTP Client**: Axios for API communication
- **Build Tool**: Vite for fast development and optimized builds

### Backend (Node.js + Express + TypeScript)
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety and better development experience
- **Database**: MongoDB with Mongoose ODM for data persistence
- **Authentication**: Slack OAuth 2.0 with automatic token refresh
- **Scheduling**: Node-cron for reliable message scheduling
- **Security**: Helmet.js, CORS, and session management
  

### Key Design Decisions
- **OAuth Flow**: Implements standard OAuth 2.0 flow for secure Slack integration
- **Token Management**: Automatic token rotation and refresh for enhanced security
- **Scheduler Architecture**: Ultra-optimized cron-based scheduler with bulk processing
- **API Design**: RESTful API with clear separation of concerns
- **Error Handling**: Comprehensive error handling with meaningful responses


## 🚨 Key Challenges & Insights

### 1. Managing Expiring Slack Tokens
**Problem:** Slack access tokens have a short lifespan (about 12 hours), so without an automated system, integrations would break unexpectedly.  
**Approach:** Designed a hands-off token refresh workflow using Slack’s refresh token system, plus a fallback plan for unexpected failures. This keeps the service running smoothly without manual intervention.  
**Takeaway:** Token renewal logic isn’t a “nice-to-have” — it’s essential infrastructure. Build it early with proper error handling and retry logic.

---

### 2. Reliable Message Scheduling
**Problem:** Scheduled messages had to be sent precisely on time, even if servers went down or restarted.  
**Approach:** Built a fault-tolerant scheduler that supports batch processing, parallel execution, and detailed logging. If something fails, the system retries intelligently without losing messages.  
**Takeaway:** Scheduling in distributed systems is all about resilience. Bulk operations not only save time but also improve stability at scale.

---

### 3. Updating the UI Without Overloading the Server
**Problem:** Users needed up-to-date message statuses, but constant polling would waste resources and slow things down.  
**Approach:** Introduced lightweight polling tied to status changes, combined with optimistic rendering so the UI feels instant.  
**Takeaway:** Real-time UX is a balancing act — give users speed without burning server resources.

---

### 4. Safe and Flexible CORS Setup
**Problem:** CORS needed to work differently for local dev and production while staying secure.  
**Approach:** Added per-environment rules, strict origin validation, and HTTP security headers via Helmet.js.  
**Takeaway:** Security decisions made early save pain later. Always tailor configs for the environment you’re deploying to.

---

### 5. Full-Stack Type Safety
**Problem:** Keeping types consistent between backend and frontend while maintaining developer productivity.  
**Approach:** Enforced strict TypeScript settings and shared type definitions across the entire stack.  
**Takeaway:** Strong typing reduces bugs and speeds up collaboration, especially in projects with multiple moving parts.


## 🚀 Features

- **🔐 Secure OAuth 2.0 Integration**: Connect your Slack workspace securely
- **📨 Message Management**: Send messages immediately or schedule them for future delivery
- **📅 Advanced Scheduling**: Schedule messages with precise timing and date selection
- **📋 Channel Management**: View and select from all your accessible Slack channels
- **🔄 Real-time Updates**: Monitor scheduled message status in real-time
- **🎨 Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **⚡ High Performance**: Ultra-optimized scheduler for reliable message delivery
- **🛡️ Token Rotation**: Automatic token refresh for enhanced security

- ## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🔧 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clear-user` - Clear user data (development only)

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint


##  Deployment (Production)

### Backend Deployment
The backend can be deployed to various platforms:

- **Render**: Connect your GitHub repository and configure environment variables

### Frontend Deployment
The frontend can be deployed to:

- **Vercel**: Connect your GitHub repository for automatic deployments
- 

### Environment Variables for Production
Ensure all environment variables are properly configured for production:
- Use strong, unique secrets for `SESSION_SECRET` and `JWT_SECRET`
- Configure production MongoDB URI
- Set production Slack redirect URI
- Update CORS origins for production domains

---

**Built with using React (Type-Script), Node.js (Express), and Slack API**
