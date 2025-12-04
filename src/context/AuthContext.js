import React, { createContext, useContext, useReducer, useEffect } from "react";

// API base URL
const API_URL = "http://localhost:5001/api";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Action types
const actionTypes = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case actionTypes.LOGIN_START:
    case actionTypes.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.LOGIN_SUCCESS:
    case actionTypes.REGISTER_SUCCESS:
      console.log(
        "🟢 REDUCER: LOGIN_SUCCESS - Setting isAuthenticated to true",
        action.payload
      );
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case actionTypes.LOGIN_FAILURE:
    case actionTypes.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };

    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext();

// Helper functions for Local Storage
const storageKeys = {
  currentUser: "places_app_current_user",
};

// Get current user from localStorage
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(storageKeys.currentUser);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error reading current user from localStorage:", error);
    return null;
  }
};

// Save current user to localStorage
const saveCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(storageKeys.currentUser, JSON.stringify(user));
    } else {
      localStorage.removeItem(storageKeys.currentUser);
    }
  } catch (error) {
    console.error("Error saving current user to localStorage:", error);
  }
};

// Context Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      dispatch({ type: actionTypes.SET_USER, payload: savedUser });
    }
  }, []);

  // Login function with API
  const login = async (username, password) => {
    console.log("🔵 LOGIN: Starting login process...", { username });
    dispatch({ type: actionTypes.LOGIN_START });

    try {
      // Simple validation
      if (!username || !password) {
        throw new Error("Username болон password оруулна уу");
      }

      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Нэвтрэх үед алдаа гарлаа");
      }

      const user = await response.json();
      console.log("🔵 LOGIN: Login successful:", user);

      saveCurrentUser(user);
      dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: user });
      return user;
    } catch (error) {
      console.log("🔴 LOGIN: Login failed:", error.message);
      dispatch({ type: actionTypes.LOGIN_FAILURE, payload: error.message });
      throw error;
    }
  };

  // Register function with API
  const register = async (userData) => {
    dispatch({ type: actionTypes.REGISTER_START });

    try {
      // Simple validation
      if (!userData.username || !userData.password) {
        throw new Error("Username болон password оруулна уу");
      }

      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Бүртгэлд алдаа гарлаа");
      }

      const user = await response.json();

      saveCurrentUser(user);
      dispatch({ type: actionTypes.REGISTER_SUCCESS, payload: user });
      return user;
    } catch (error) {
      dispatch({ type: actionTypes.REGISTER_FAILURE, payload: error.message });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    saveCurrentUser(null);
    dispatch({ type: actionTypes.LOGOUT });
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      if (!state.user) throw new Error("Хэрэглэгч нэвтрээгүй байна");

      const response = await fetch(`${API_URL}/users/${state.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Профайл шинэчлэхэд алдаа гарлаа");
      }

      const updatedUser = await response.json();
      saveCurrentUser(updatedUser);
      dispatch({ type: actionTypes.SET_USER, payload: updatedUser });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  // Friends: add/remove
  const addFriend = async (friendId) => {
    if (!state.user) return;

    try {
      const response = await fetch(
        `${API_URL}/users/${state.user.id}/friends`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ friendId }),
        }
      );

      if (!response.ok) throw new Error("Найз нэмэхэд алдаа гарлаа");

      const updatedUser = await response.json();
      saveCurrentUser(updatedUser);
      dispatch({ type: actionTypes.SET_USER, payload: updatedUser });
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const removeFriend = async (friendId) => {
    if (!state.user) return;

    try {
      const response = await fetch(
        `${API_URL}/users/${state.user.id}/friends/${friendId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Найз хасахад алдаа гарлаа");

      const updatedUser = await response.json();
      saveCurrentUser(updatedUser);
      dispatch({ type: actionTypes.SET_USER, payload: updatedUser });
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  // Directory: safe user listing (no password)
  const listUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error("Хэрэглэгчдийг татахад алдаа гарлаа");
      return await response.json();
    } catch (error) {
      console.error("Error listing users:", error);
      return [];
    }
  };

  const getUserById = async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`);
      if (!response.ok) throw new Error("Хэрэглэгч олдсонгүй");
      return await response.json();
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    updateProfile,
    clearError,
    addFriend,
    removeFriend,
    listUsers,
    getUserById,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
