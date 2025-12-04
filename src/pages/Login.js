import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login, isAuthenticated, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // If already authenticated, redirect immediately
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username оруулна уу";
    }

    if (!formData.password) {
      errors.password = "Password оруулна уу";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await login(formData.username, formData.password);
      // Navigation will happen automatically due to isAuthenticated change
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>Нэвтрэх</h2>
          <p>Газар хуваалцах платформд тавтай морил</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={formErrors.username ? "error" : ""}
              placeholder="Хэрэглэгчийн нэр"
              autoComplete="username"
            />
            {formErrors.username && (
              <span className="error-message">{formErrors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={formErrors.password ? "error" : ""}
              placeholder="Password"
              autoComplete="current-password"
            />
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>

          <div className="register-link">
            Бүртгэлгүй юу?{" "}
            <a href="http://localhost:3000/register">Бүртгүүлэх</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
