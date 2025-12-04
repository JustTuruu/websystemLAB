import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { usePlaces } from "../context/PlacesContext";
import { useAuth } from "../context/AuthContext";
import "./AddPlace.css";

function EditPlace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { places, updatePlace } = usePlaces();
  const { user } = useAuth();

  const place = places.find((p) => p._id === id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    rating: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    if (place) {
      if (place.userId !== user?._id) {
        setUpdateError("Та зөвхөн өөрийн нэмсэн газрыг засах боломжтой");
        return;
      }

      setFormData({
        name: place.name || "",
        description: place.description || "",
        location: place.location || "",
        rating: place.rating?.toString() || "",
        image: place.image || "",
      });
    }
  }, [place, user]);

  if (!place) {
    return (
      <div className="add-place">
        <div className="add-place-header">
          <Link to="/" className="back-btn">
            ← Буцах
          </Link>
          <h1>Газар олдсонгүй</h1>
        </div>
      </div>
    );
  }

  const normalizeImageUrl = (url) => {
    try {
      const raw = url.trim();
      if (!raw) return raw;

      if (raw.includes("/imgres?")) {
        const u = new URL(raw);
        const real =
          u.searchParams.get("imgurl") || u.searchParams.get("imgrefurl");
        return real || raw;
      }

      if (raw.includes("drive.google.com")) {
        const m = raw.match(/\/file\/d\/([^/]+)\//);
        if (m && m[1]) {
          return `https://drive.google.com/uc?export=view&id=${m[1]}`;
        }
        const u = new URL(raw);
        const id = u.searchParams.get("id");
        if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
      }

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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (updateError) {
      setUpdateError("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const updatedPlace = {
        ...place,
        name: formData.name,
        description: formData.description,
        location: formData.location,
        rating: parseFloat(formData.rating),
        image: formData.image,
      };

      await updatePlace(updatedPlace);
      navigate(`/places/${id}`);
    } catch (error) {
      setUpdateError(
        error.message || "Газрын мэдээлэл шинэчлэхэд алдаа гарлаа"
      );
    }
  };

  return (
    <div className="add-place">
      <div className="add-place-header">
        <Link to={`/places/${id}`} className="back-btn">
          ← Буцах
        </Link>
        <h1>Газрын мэдээлэл засах</h1>
      </div>

      {updateError && place.userId !== user?._id && (
        <div className="error-alert" style={{ marginBottom: "20px" }}>
          {updateError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-place-form">
        {updateError && place.userId === user?._id && (
          <div className="error-alert">{updateError}</div>
        )}

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
            disabled={place.userId !== user?._id}
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
            disabled={place.userId !== user?._id}
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
            disabled={place.userId !== user?._id}
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
            disabled={place.userId !== user?._id}
          />
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
            disabled={place.userId !== user?.id}
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="form-actions">
          <Link to={`/places/${id}`} className="cancel-btn">
            Цуцлах
          </Link>
          {place.userId === user?._id && (
            <button type="submit" className="submit-btn">
              Хадгалах
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditPlace;
