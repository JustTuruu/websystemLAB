import React, { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlaces } from "../context/PlacesContext";

function FriendProfile() {
  const { id } = useParams();
  const { getUserById, user: me } = useAuth();
  const { places } = usePlaces();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriend = async () => {
      setLoading(true);
      const userData = await getUserById(id);
      setFriend(userData);
      setLoading(false);
    };
    fetchFriend();
  }, [getUserById, id]);

  const colorFor = useMemo(() => {
    return (id) => {
      const palette = [
        "#3498db",
        "#9b59b6",
        "#e67e22",
        "#1abc9c",
        "#e74c3c",
        "#2ecc71",
        "#f39c12",
      ];
      let hash = 0;
      for (let i = 0; i < id.length; i++)
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
      return palette[hash % palette.length];
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Ачаалж байна...</p>
      </div>
    );
  }

  if (!friend) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Хэрэглэгч олдсонгүй</h2>
        <Link to="/friends">Найзууд руу буцах</Link>
      </div>
    );
  }

  const friendPlaces = places.filter((p) => p.userId === friend.id);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Link to="/friends" className="back-btn">
          ← Буцах
        </Link>
        <h1>{friend.name} — профайл</h1>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {friend.avatar ? (
            <img
              src={friend.avatar}
              alt={friend.name}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/128x128?text=NA";
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: colorFor(friend.id),
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              {friend.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{friend.name}</div>
            <div style={{ color: "#666" }}>{friend.email}</div>
            {me?.id === friend.id && (
              <div style={{ color: "#999", fontSize: 13 }}>
                Энэ бол таны профайл
              </div>
            )}
          </div>
        </div>
      </div>

      <h2>Нэмсэн газрууд</h2>
      {friendPlaces.length === 0 ? (
        <p>Одоогоор нэмсэн газар алга.</p>
      ) : (
        <div className="places-grid">
          {friendPlaces.map((place) => (
            <div key={place.id} className="place-card">
              <img
                src={place.image}
                alt={place.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://placehold.co/600x400?text=No+Image";
                }}
              />
              <div className="place-info">
                <h3>{place.name}</h3>
                <p className="location">{place.location}</p>
                <p className="description">{place.description}</p>
                <div className="rating"> {place.rating}</div>
                <Link to={`/places/${place.id}`} className="view-details-btn">
                  Дэлгэрэнгүй үзэх
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendProfile;
