import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

function Register() {
  const { register, isAuthenticated, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    clearError();
  }, [clearError]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
    } else if (formData.username.length < 3) {
      errors.username = "Username хамгийн багадаа 3 тэмдэгт байх ёстой";
    }

    if (!formData.name.trim()) {
      errors.name = "Нэр оруулна уу";
    }

    if (!formData.email.trim()) {
      errors.email = "Email оруулна уу";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email буруу форматтай байна";
    }

    if (!formData.password) {
      errors.password = "Password оруулна уу";
    } else if (formData.password.length < 6) {
      errors.password = "Password хамгийн багадаа 6 тэмдэгт байх ёстой";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Password дахин оруулна уу";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Password таарахгүй байна";
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
      await register({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
      });
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h2>Бүртгүүлэх</h2>
          <p>Шинэ хэрэглэгч үүсгэх</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
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
            <label htmlFor="name">Нэр *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? "error" : ""}
              placeholder="Таны нэр"
              autoComplete="name"
            />
            {formErrors.name && (
              <span className="error-message">{formErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? "error" : ""}
              placeholder="email@example.com"
              autoComplete="email"
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
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
              autoComplete="new-password"
            />
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Password давтах *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={formErrors.confirmPassword ? "error" : ""}
              placeholder="Password давтах"
              autoComplete="new-password"
            />
            {formErrors.confirmPassword && (
              <span className="error-message">
                {formErrors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
          </button>

          <div className="register-link">
            Хэрэглэгчтэй юу? <a href="http://localhost:3000/login">Нэвтрэх</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
