import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePlaces } from "../context/PlacesContext";
import "./AddPlace.css";

function AddPlace() {
  const navigate = useNavigate();
  const { addPlace } = usePlaces();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    rating: "",
    image: "",
  });

  const [errors, setErrors] = useState({});

  const normalizeImageUrl = (url) => {
    try {
      // Trim spaces
      const raw = url.trim();
      if (!raw) return raw;

      // If Google Images redirect (imgres), extract real imgurl param
      if (raw.includes("/imgres?")) {
        const u = new URL(raw);
        const real =
          u.searchParams.get("imgurl") || u.searchParams.get("imgrefurl");
        return real || raw;
      }

      // Google Drive share: https://drive.google.com/file/d/FILE_ID/view?usp=share
      // Convert to direct view: https://drive.google.com/uc?export=view&id=FILE_ID
      if (raw.includes("drive.google.com")) {
        const m = raw.match(/\/file\/d\/([^/]+)\//);
        if (m && m[1]) {
          return `https://drive.google.com/uc?export=view&id=${m[1]}`;
        }
        // Alternate id param
        const u = new URL(raw);
        const id = u.searchParams.get("id");
        if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
      }

      // Dropbox share: www.dropbox.com/s/<id>/file.jpg?dl=0 -> dl.dropboxusercontent.com/s/<id>/file.jpg
      if (raw.includes("www.dropbox.com")) {
        return raw
          .replace("www.dropbox.com", "dl.dropboxusercontent.com")
          .replace(/\?dl=0$/, "");
      }

      return raw;
    } catch {
      return url;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "image" ? normalizeImageUrl(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Газрын нэр оруулна уу";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Тайлбар оруулна уу";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Байршил оруулна уу";
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "1-5 хооронд үнэлгээ оруулна уу";
    }

    if (!formData.image.trim()) {
      newErrors.image = "Зургийн холбоос оруулна уу";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert rating to number
    const newPlace = {
      ...formData,
      rating: parseFloat(formData.rating),
    };

    addPlace(newPlace);
    navigate("/");
  };

  return (
    <div className="add-place">
      <div className="add-place-header">
        <Link to="/" className="back-btn">
          ← Буцах
        </Link>
        <h1>Шинэ газар нэмэх</h1>
      </div>

      <form onSubmit={handleSubmit} className="add-place-form">
        <div className="form-group">
          <label htmlFor="name">Газрын нэр *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error" : ""}
            placeholder="Жишээ: Сүхбаатарын талбай"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="location">Байршил *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? "error" : ""}
            placeholder="Жишээ: Улаанбаатар хот"
          />
          {errors.location && (
            <span className="error-message">{errors.location}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="rating">Үнэлгээ (1-5) *</label>
          <input
            type="number"
            id="rating"
            name="rating"
            min="1"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
            className={errors.rating ? "error" : ""}
            placeholder="4.5"
          />
          {errors.rating && (
            <span className="error-message">{errors.rating}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image">Зургийн холбоос *</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className={errors.image ? "error" : ""}
            placeholder="https://example.com/image.jpg"
          />
          <small style={{ color: "#777" }}>
            Зөвлөгөө: Google Images-ээс хуулсан холбоос (imgres) эсвэл
            Drive/Dropbox share холбоосыг автоматаар тохируулна.
          </small>
          {errors.image && (
            <span className="error-message">{errors.image}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Тайлбар *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "error" : ""}
            placeholder="Энэ газрын тухай дэлгэрэнгүй мэдээлэл оруулна уу..."
            rows="4"
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="form-actions">
          <Link to="/" className="cancel-btn">
            Цуцлах
          </Link>
          <button type="submit" className="submit-btn">
            Газар нэмэх
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPlace;
