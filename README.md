# RoomLoop - Virtual Events and Meetups Platform (Client)

A modern React-based platform for virtual events, meetings, and social gatherings with AI-powered assistance.

## 🚀 Live Demo

**🌐 Live Application**: [RoomLoop App](https://roomloop-client.vercel.app/)

## 🚀 Features

### Core Features

- **Live and Scheduled Rooms**: Create and join rooms that are live or scheduled for the future
- **Private and Public Rooms**: Host public events or create private rooms with invite-only access
- **Dashboard View**: Grid-based dashboard with pagination and filtering (live, upcoming, past)
- **Explore Page**: Discover public events and your private rooms with search functionality
- **Real-time Chat**: Live chat with message history for all room participants
- **Reactions**: Express yourself with emoji reactions during meetings
- **Room History**: View closed room details and chat history
- **User Management**: Registration, authentication, and profile management
- **Responsive Design**: Fully responsive UI that works on desktop and mobile devices

### AI-Powered Features 🤖

- **Ted AI Assistant**: Built-in AI assistant accessible via `@ai` commands
- **Smart Context**: AI understands room context, participants, and conversation history
- **Real-time AI Responses**: Get instant AI assistance during meetings
- **Participant-Aware**: AI knows who's in the room and can reference ongoing discussions
- **Formatted Responses**: Clean, emoji-enhanced AI responses with proper text processing

### Real-time Features

- **Live Chat**: Real-time messaging with WebSocket integration
- **User Presence**: See who's online and active in the room
- **Instant Notifications**: Real-time updates for room events
- **Message Reactions**: React to messages with emojis in real-time
- **Auto-scroll**: Chat automatically scrolls to new messages

### UI/UX Features

- **Modern Design**: Clean, intuitive interface with Material UI
- **Dark/Light Theme**: Toggle between themes for better user experience
- **Accessibility**: Screen reader support and keyboard navigation
- **Mobile Responsive**: Optimized for all device sizes
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: User-friendly error messages and recovery options

## 📸 Screenshots

<details>
<summary>View Application Screenshots</summary>

### Dashboard

![Dashboard Screenshot](/Asset/Dashboard.png)

### Explore Rooms

![Explore Screenshot](/Asset/ExploreRoom.png)

### Create Room

![Create Room Screenshot](/Asset/CreateRoom.png)

### Room Chat with AI

![Room Chat Screenshot](/Asset/RoomChat.png)

### User Profile

![User Profile Screenshot](/Asset/UserProfile.png)

</details>

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Material UI v5
- **State Management**: React Context API with custom hooks
- **Routing**: React Router v6
- **Real-time**: Socket.IO client for live chat and reactions
- **Styling**: Material UI theming with custom styled components
- **Authentication**: JWT-based authentication with secure token storage
- **AI Integration**: OpenRouter API for AI assistant functionality
- **Build Tool**: Create React App with TypeScript
- **Deployment**: Vercel with automatic CI/CD

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Backend server running (see server README)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/abhi21121211/roomloop-client.git
   cd roomloop-client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the root directory:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server:**

   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🤖 AI Assistant Usage

### Using Ted AI Assistant

1. **Join any room** (as host or participant)
2. **Type `@ai` followed by your question**, for example:

   - `@ai What's the agenda for today's meeting?`
   - `@ai Can you summarize what we've discussed so far?`
   - `@ai How many people are in this room?`
   - `@ai What features does RoomLoop have?`

3. **Ted will respond** with helpful, contextual information about:
   - Room details and participants
   - Meeting context and recent discussions
   - RoomLoop features and usage tips
   - General assistance and questions

### AI Access Rules

- ✅ **Room Host/Creator**: Full AI access
- ✅ **Room Participants**: Full AI access
- ✅ **Invited Users**: Full AI access (even before joining)
- ❌ **Non-participants**: No AI access

## 📱 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects the create-react-app configuration

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ai/             # AI-related components
│   ├── common/         # Shared components (buttons, cards, etc.)
│   └── layout/         # Layout components
├── contexts/           # React contexts for state management
│   ├── AIContext.tsx   # AI service context
│   ├── AuthContext.tsx # Authentication context
│   ├── ChatContext.tsx # Chat and messaging context
│   ├── RoomContext.tsx # Room management context
│   └── ThemeContext.tsx # Theme management context
├── pages/              # Main page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Explore.tsx     # Room exploration
│   ├── RoomView.tsx    # Individual room view
│   ├── Login.tsx       # Authentication pages
│   └── Profile.tsx     # User profile
├── services/           # API and external service integrations
│   ├── api.ts          # REST API client
│   └── socket.ts       # WebSocket client
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   └── textProcessing.ts # AI text processing utilities
└── App.tsx             # Main application component
```

## 🌐 Deployment

### Deploying to Vercel

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Install Vercel CLI** (optional):

   ```bash
   npm install -g vercel
   ```

3. **Create `vercel.json`** in the project root:

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build"
       }
     ],
     "routes": [
       {
         "src": "/static/(.*)",
         "dest": "/static/$1"
       },
       {
         "src": "/favicon.ico",
         "dest": "/favicon.ico"
       },
       {
         "src": "/manifest.json",
         "dest": "/manifest.json"
       },
       {
         "src": "/(.*).(js|json|css|svg|png|jpg|jpeg|ico|ttf|woff|woff2)",
         "dest": "/$1.$2"
       },
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ],
     "env": {
       "REACT_APP_API_URL": "https://your-backend-url.com/api",
       "REACT_APP_SOCKET_URL": "https://your-backend-url.com"
     }
   }
   ```

4. **Connect to Vercel:**

   - Log in to Vercel dashboard
   - Click "Add New" > "Project"
   - Import your Git repository
   - Set framework preset to "Create React App"

5. **Configure environment variables** in Vercel dashboard:

   - `REACT_APP_API_URL`: Your backend API URL
   - `REACT_APP_SOCKET_URL`: Your backend WebSocket URL

6. **Deploy:**
   - CLI: Run `vercel` in project directory
   - Dashboard: Deployment starts automatically

## 🔧 Key Features in Detail

### Dashboard

- **Grid Layout**: Visual room cards with status indicators
- **Smart Filtering**: Filter by live, upcoming, past, and invited rooms
- **Pagination**: Handle large numbers of rooms efficiently
- **Quick Actions**: Join, view, or manage rooms directly from dashboard

### Explore

- **Search Functionality**: Find rooms by title, description, or tags
- **Filter Options**: Public vs private rooms, room types
- **Room Previews**: See room details before joining
- **Join Requests**: Easy room joining with one click

### Room View

- **Live Chat**: Real-time messaging with user avatars
- **AI Integration**: Ted AI assistant for meeting help
- **Reactions**: Emoji reactions on messages
- **Participant List**: See who's in the room
- **Room Controls**: Host controls for room management
- **Chat History**: View messages from closed rooms

### AI Assistant

- **Context Awareness**: AI knows room details and participants
- **Conversation Memory**: Remembers recent discussions
- **Smart Responses**: Helpful, relevant answers
- **Error Handling**: Graceful fallbacks when AI is unavailable

## 🐛 Troubleshooting

### Common Issues

1. **AI not working:**

   - Check if backend AI service is configured
   - Verify OpenRouter API key is set in backend
   - Ensure you're a participant in the room

2. **Real-time chat not updating:**

   - Check WebSocket connection
   - Verify backend server is running
   - Check browser console for errors

3. **Authentication issues:**
   - Clear browser cache and cookies
   - Check JWT token expiration
   - Verify backend authentication is working

### Development Issues

1. **Build errors:**

   - Run `npm install` to update dependencies
   - Check TypeScript compilation errors
   - Verify all imports are correct

2. **Runtime errors:**
   - Check browser console for detailed errors
   - Verify API endpoints are accessible
   - Check environment variables are set correctly

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

### Development Guidelines

- Follow TypeScript best practices
- Use Material UI components for consistency
- Add proper error handling
- Include loading states for async operations
- Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Links

- **Live Demo**: [RoomLoop App](https://roomloop-client.vercel.app/)
- **Backend Repository**: [roomloop-server](https://github.com/abhi21121211/roomloop-server)
- **Documentation**: [AI Features Guide](FREE_AI_SETUP.md)
