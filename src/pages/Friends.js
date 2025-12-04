import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Friends() {
  const { user, listUsers, addFriend, removeFriend } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await listUsers();
      setUsers(usersList.filter((u) => u.id !== user?.id));
    };
    fetchUsers();
  }, [listUsers, user?.id]);

  const myFriends = new Set(user?.friends || []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>Найзууд</h1>
      <p>Эндээс найзаа нэмээд, тэдний нэмсэн газруудыг хараарай.</p>

      {users.length === 0 ? (
        <p>Бусад хэрэглэгч алга.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {users.map((u) => {
            const isFriend = myFriends.has(u.id);
            return (
              <li
                key={u.id}
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
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#3498db",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link
                    to={`/users/${u.id}`}
                    className="btn"
                    style={{ background: "#2c3e50", color: "#fff" }}
                  >
                    Профайл →
                  </Link>
                  {isFriend ? (
                    <button
                      onClick={() => removeFriend(u.id)}
                      className="btn"
                      style={{ background: "#e74c3c", color: "#fff" }}
                    >
                      Найз хасах
                    </button>
                  ) : (
                    <button
                      onClick={() => addFriend(u.id)}
                      className="btn"
                      style={{ background: "#27ae60", color: "#fff" }}
                    >
                      Найз нэмэх
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Friends;
