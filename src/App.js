import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PlacesProvider } from "./context/PlacesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicRoute";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import PlaceDetail from "./pages/PlaceDetail";
import AddPlace from "./pages/AddPlace";
import EditPlace from "./pages/EditPlace";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import FriendProfile from "./pages/FriendProfile";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <PlacesProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/places/:id"
                element={
                  <ProtectedRoute>
                    <PlaceDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-place"
                element={
                  <ProtectedRoute>
                    <AddPlace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-place/:id"
                element={
                  <ProtectedRoute>
                    <EditPlace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <ProtectedRoute>
                    <FriendProfile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    <h2>404 - Хуудас олдсонгүй</h2>
                    <p>Та хайж байгаа хуудас олдсонгүй.</p>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </PlacesProvider>
    </AuthProvider>
  );
}

export default App;
