import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePlaces } from "../context/PlacesContext";
import { useAuth } from "../context/AuthContext";
import "./PlaceDetail.css";

function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { places, deletePlace } = usePlaces();
  const { user } = useAuth();
  const [deleteError, setDeleteError] = useState("");

  const place = places.find((p) => p._id === id);

  // Check if current user owns this place
  const isOwner = place && user && place.userId === user._id;

  if (!place) {
    return (
      <div className="place-detail">
        <h2>Газар олдсонгүй</h2>
        <Link to="/">Нүүр хуудас руу буцах</Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!isOwner) {
      setDeleteError("Та зөвхөн өөрийн нэмсэн газрыг устгах боломжтой");
      return;
    }

    if (window.confirm("Та энэ газрыг устгахдаа итгэлтэй байна уу?")) {
      try {
        await deletePlace(place._id);
        navigate("/");
      } catch (error) {
        setDeleteError(error.message || "Газар устгахад алдаа гарлаа");
      }
    }
  };

  return (
    <div className="place-detail">
      <div className="place-detail-header">
        <Link to="/" className="back-btn">
          ← Буцах
        </Link>
        {isOwner && (
          <div className="actions">
            <Link to={`/edit-place/${place._id}`} className="edit-btn">
              ✏️ Засах
            </Link>
            <button onClick={handleDelete} className="delete-btn">
              🗑️ Устгах
            </button>
          </div>
        )}
      </div>

      {deleteError && (
        <div className="error-alert" style={{ marginBottom: "20px" }}>
          {deleteError}
        </div>
      )}

      <div className="place-detail-content">
        <img
          src={place.image}
          alt={place.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/800x500?text=No+Image";
          }}
        />
        <div className="place-detail-info">
          <h1>{place.name}</h1>
          <p className="location">📍 {place.location}</p>
          <div className="rating">⭐ {place.rating} / 5.0</div>
          <div className="description">
            <h3>Тухай</h3>
            <p>{place.description}</p>
          </div>
          {!isOwner && (
            <div
              className="owner-note"
              style={{
                marginTop: "20px",
                padding: "10px",
                background: "#f0f0f0",
                borderRadius: "5px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              ℹ️ Та зөвхөн өөрийн нэмсэн газрыг засах, устгах боломжтой
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaceDetail;
