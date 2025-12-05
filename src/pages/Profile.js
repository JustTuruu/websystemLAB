import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlaces } from "../context/PlacesContext";
import "./Profile.css";

function Profile() {
  const { user, updateProfile, loading } = useAuth();
  const { places } = usePlaces();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Нэр оруулна уу");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Нэр хамгийн багадаа 2 тэмдэгттэй байх ёстой");
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSuccess("Профайл амжилттай шинэчлэгдлээ!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || "" });
    setIsEditing(false);
    setError("");
  };

  // Filter places created by current user
  const userPlaces = useMemo(() => {
    if (!user) return [];
    return places.filter((place) => place.userId === user._id);
  }, [places, user]);

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Хэрэглэгч олдсонгүй</h2>
          <Link to="/login" className="login-link">
            Нэвтрэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Link to="/" className="back-btn">
          ← Буцах
        </Link>
        <h1>Миний профайл</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>

        <div className="profile-info">
          {success && <div className="success-message">{success}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="name">Нэр</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={error ? "error" : ""}
                  placeholder="Таны нэр"
                  autoFocus
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Цуцлах
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </form>
          ) : (
            <div className="view-mode">
              <div className="info-row">
                <span className="label">Нэр:</span>
                <span className="value">{user.name}</span>
              </div>

              <div className="info-row">
                <span className="label">И-мэйл:</span>
                <span className="value">{user.email}</span>
              </div>

              <button onClick={() => setIsEditing(true)} className="edit-btn">
                ✏️ Мэдээлэл засах
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User's Places Section */}
      <div className="user-places-section">
        <div className="section-header">
          <h2>Миний нэмсэн газрууд</h2>
          <span className="places-count">{userPlaces.length} газар</span>
        </div>

        {userPlaces.length === 0 ? (
          <div className="no-places">
            <p>Та одоогоор газар нэмээгүй байна.</p>
            <Link to="/add-place" className="add-place-link">
              ➕ Газар нэмэх
            </Link>
          </div>
        ) : (
          <div className="places-grid">
            {userPlaces.map((place) => (
              <Link
                to={`/places/${place._id}`}
                key={place._id}
                className="place-card"
              >
                <div className="place-image-wrapper">
                  <img
                    src={place.image}
                    alt={place.name}
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/400x300?text=No+Image";
                    }}
                  />
                  {place.rating && (
                    <span className="place-rating">⭐ {place.rating}</span>
                  )}
                </div>
                <div className="place-card-content">
                  <h3>{place.name}</h3>
                  <p className="place-location">📍 {place.location}</p>
                  <p className="place-description">
                    {place.description.length > 100
                      ? `${place.description.substring(0, 100)}...`
                      : place.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
