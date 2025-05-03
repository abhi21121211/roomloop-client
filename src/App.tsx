import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import CreateRoom from "./pages/CreateRoom";
import Profile from "./pages/Profile";
import RoomView from "./pages/RoomView";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { RoomProvider } from "./contexts/RoomContext";
import { ChatProvider } from "./contexts/ChatContext";

// Components
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <RoomProvider>
          <ChatProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Explore />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-room"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CreateRoom />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms/:roomId"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RoomView />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ChatProvider>
        </RoomProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
