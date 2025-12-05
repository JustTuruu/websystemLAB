import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

// API base URL
const API_URL = "http://localhost:5001/api";

// Token expiry time (30 seconds for testing, change to longer for production)
const TOKEN_EXPIRY_TIME = 30 * 1000; // 30 seconds
const WARNING_BEFORE_EXPIRY = 10 * 1000;

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
        "REDUCER: LOGIN_SUCCESS - Setting isAuthenticated to true",
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
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const sessionTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  // Handle session expired
  const handleSessionExpired = useCallback(() => {
    clearTimers();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    saveCurrentUser(null);
    dispatch({ type: actionTypes.LOGOUT });
    alert("Таны session дууслаа. Дахин нэвтэрнэ үү.");
  }, [clearTimers]);

  // Start session timer after login
  const startSessionTimer = useCallback(() => {
    clearTimers();
    console.log(
      "🕐 Session timer started - warning in",
      (TOKEN_EXPIRY_TIME - WARNING_BEFORE_EXPIRY) / 1000,
      "seconds"
    );

    // Warning timer - WARNING_BEFORE_EXPIRY секундын дараа сэрэмжлүүлэг үзүүлэх
    warningTimerRef.current = setTimeout(() => {
      console.log("⚠️ Showing session warning modal");
      setShowSessionWarning(true);
    }, TOKEN_EXPIRY_TIME - WARNING_BEFORE_EXPIRY);

    // Session expiry timer - TOKEN_EXPIRY_TIME секундын дараа logout
    sessionTimerRef.current = setTimeout(() => {
      console.log("❌ Session expired!");
      setShowSessionWarning(false);
      handleSessionExpired();
    }, TOKEN_EXPIRY_TIME);
  }, [clearTimers, handleSessionExpired]);

  // Extend session - refresh token
  const extendSession = useCallback(async () => {
    console.log("🔄 Extending session...");
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("Refresh token олдсонгүй");
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh амжилтгүй");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      console.log("✅ Session extended successfully!");

      setShowSessionWarning(false);
      startSessionTimer(); // Restart timer

      return true;
    } catch (error) {
      console.error("Session extend error:", error);
      handleSessionExpired();
      return false;
    }
  }, [startSessionTimer, handleSessionExpired]);

  // Decline session extension - logout
  const declineSessionExtend = useCallback(() => {
    console.log("👋 User declined session extension");
    setShowSessionWarning(false);
    handleSessionExpired();
  }, [handleSessionExpired]);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = getCurrentUser();
    const accessToken = localStorage.getItem("access_token");
    if (savedUser && accessToken) {
      dispatch({ type: actionTypes.SET_USER, payload: savedUser });
      startSessionTimer();
    }
  }, [startSessionTimer]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

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

      const data = await response.json();
      console.log("🔵 LOGIN: Login successful:", data);

      // data structure: { access_token, refresh_token, expires_in, token_type, user }
      const { access_token, refresh_token, user } = data;

      // Save tokens to localStorage
      if (access_token) {
        localStorage.setItem("access_token", access_token);
      }
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }

      // Save user object
      saveCurrentUser(user);
      dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: user });

      // Start session timer
      startSessionTimer();

      return user;
    } catch (error) {
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
  const logout = async () => {
    // Clear timers first
    clearTimers();
    setShowSessionWarning(false);

    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        // Сервер дээр refresh token-г устгах
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    saveCurrentUser(null);
    dispatch({ type: actionTypes.LOGOUT });
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      if (!state.user) throw new Error("Хэрэглэгч нэвтрээгүй байна");

      const response = await fetch(`${API_URL}/users/${state.user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
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
        `${API_URL}/users/${state.user._id}/friends`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
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
        `${API_URL}/users/${state.user._id}/friends/${friendId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
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
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!response.ok) throw new Error("Хэрэглэгчдийг татахад алдаа гарлаа");
      return await response.json();
    } catch (error) {
      console.error("Error listing users:", error);
      return [];
    }
  };

  const getUserById = async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!response.ok) throw new Error("Хэрэглэгч олдсонгүй");
      return await response.json();
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };

  // Хэрэглэгч хайх (нэрээр)
  const searchUsers = async (query) => {
    try {
      const response = await fetch(
        `${API_URL}/users/search/${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Хайхад алдаа гарлаа");
      return await response.json();
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  // Username-аар найз нэмэх
  const addFriendByUsername = async (username) => {
    if (!state.user) return { success: false, error: "Нэвтрээгүй байна" };

    try {
      const response = await fetch(
        `${API_URL}/users/${state.user._id}/friends/add-by-username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ username }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      saveCurrentUser(data.user);
      dispatch({ type: actionTypes.SET_USER, payload: data.user });
      return { success: true, addedFriend: data.addedFriend };
    } catch (error) {
      console.error("Error adding friend by username:", error);
      return { success: false, error: "Найз нэмэхэд алдаа гарлаа" };
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
    searchUsers,
    addFriendByUsername,
    // Session management
    showSessionWarning,
    extendSession,
    declineSessionExtend,
  };

  return (
    <>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

      {/* Session Warning Modal */}
      {showSessionWarning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
              maxWidth: "400px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#e74c3c" }}>
              ⚠️ Session дуусах гэж байна!
            </h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Таны session удахгүй дуусна. Үргэлжлүүлэх үү?
            </p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={extendSession}
                style={{
                  padding: "10px 25px",
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ✓ Тийм, сунгах
              </button>
              <button
                onClick={declineSessionExtend}
                style={{
                  padding: "10px 25px",
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ✗ Үгүй, гарах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
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
