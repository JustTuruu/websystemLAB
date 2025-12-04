import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePlaces } from "../context/PlacesContext";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const { user, listUsers } = useAuth();
  const { places } = usePlaces();
  const [users, setUsers] = useState([]);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await listUsers();
      setUsers(usersList);
    };
    fetchUsers();
  }, [listUsers]);

  // Build friend list from current user's friend IDs
  const friendIds = new Set(user?.friends || []);
  const friends = users.filter((u) => friendIds.has(u.id));

  const colorFor = (id) => {
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

  const placeCountByUser = useMemo(() => {
    const map = new Map();
    for (const p of places) {
      map.set(p.userId, (map.get(p.userId) || 0) + 1);
    }
    return map;
  }, [places]);

  return (
    <div className="home-page">
      <h1>Миний найзууд</h1>
      <p>Найзынхаа карт дээр дарж тэр найзын оруулсан газруудыг үзээрэй.</p>

      {friends.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Одоогоор найз алга.</p>
          <div style={{ marginTop: 16 }}>
            <Link to="/friends" className="add-place-btn">
              Найз нэмэх
            </Link>
          </div>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
          {friends.map((f) => (
            <li
              key={f.id}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {f.avatar ? (
                  <img
                    src={f.avatar}
                    alt={f.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/96x96?text=NA";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: colorFor(f.id),
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {f.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>{f.email}</div>
                  <div style={{ color: "#999", fontSize: 12 }}>
                    Нэмсэн газар: {placeCountByUser.get(f.id) || 0}
                  </div>
                </div>
              </div>
              <Link to={`/users/${f.id}`} className="view-details-btn">
                Газруудыг харах →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;
