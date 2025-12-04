import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Friends() {
  const {
    user,
    listUsers,
    addFriend,
    removeFriend,
    addFriendByUsername,
    searchUsers,
  } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await listUsers();
      setUsers(usersList.filter((u) => u._id !== user?._id));
    };
    fetchUsers();
  }, [listUsers, user?._id]);

  const myFriends = new Set(user?.friends || []);

  // Хайлт хийх
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchMessage("Хайх нэрээ оруулна уу");
      return;
    }

    setIsSearching(true);
    setSearchMessage("");

    try {
      const results = await searchUsers(searchQuery);
      // Өөрийгөө хасах
      const filtered = results.filter((u) => u._id !== user?._id);
      setSearchResults(filtered);

      if (filtered.length === 0) {
        setSearchMessage("Хэрэглэгч олдсонгүй");
      }
    } catch (err) {
      setSearchMessage("Хайхад алдаа гарлаа");
    }
    setIsSearching(false);
  };

  // Username-аар найз нэмэх
  const handleAddByUsername = async (username) => {
    try {
      const result = await addFriendByUsername(username);
      if (result.success) {
        setSearchMessage(`${result.addedFriend.name} найзаар нэмэгдлээ!`);
        // Хайлтын үр дүнг шинэчлэх
        setSearchResults(
          searchResults.map((u) =>
            u.username === username ? { ...u, isFriend: true } : u
          )
        );
      } else {
        setSearchMessage(result.error || "Алдаа гарлаа");
      }
    } catch (err) {
      setSearchMessage("Найз нэмэхэд алдаа гарлаа");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>Найзууд</h1>
      <p>Эндээс найзаа нэрээр нь хайж нэмээрэй.</p>

      {/* Хайлтын хэсэг */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>🔍 Найз хайх</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Username эсвэл нэрээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              padding: "10px 15px",
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            style={{
              padding: "10px 20px",
              background: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {isSearching ? "Хайж байна..." : "Хайх"}
          </button>
        </div>

        {searchMessage && (
          <p
            style={{
              marginTop: 10,
              color: searchMessage.includes("нэмэгдлээ")
                ? "#27ae60"
                : "#e74c3c",
            }}
          >
            {searchMessage}
          </p>
        )}

        {/* Хайлтын үр дүн */}
        {searchResults.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, marginTop: 15 }}>
            {searchResults.map((u) => {
              const isFriend = myFriends.has(u._id);
              return (
                <li
                  key={u._id}
                  style={{
                    background: "#f8f9fa",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      style={{ width: 36, height: 36, borderRadius: "50%" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: "#666", fontSize: 12 }}>
                        @{u.username}
                      </div>
                    </div>
                  </div>
                  {isFriend ? (
                    <span style={{ color: "#27ae60", fontWeight: 500 }}>
                      ✓ Найз
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddByUsername(u.username)}
                      style={{
                        padding: "6px 12px",
                        background: "#27ae60",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      + Найз нэмэх
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <h2>Бүх хэрэглэгчид</h2>
      {users.length === 0 ? (
        <p>Бусад хэрэглэгч алга.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {users.map((u) => {
            const isFriend = myFriends.has(u._id);
            return (
              <li
                key={u._id}
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
                  <img
                    src={u.avatar}
                    alt={u.name}
                    style={{ width: 40, height: 40, borderRadius: "50%" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      @{u.username} • {u.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link
                    to={`/users/${u._id}`}
                    className="btn"
                    style={{ background: "#2c3e50", color: "#fff" }}
                  >
                    Профайл →
                  </Link>
                  {isFriend ? (
                    <button
                      onClick={() => removeFriend(u._id)}
                      className="btn"
                      style={{ background: "#e74c3c", color: "#fff" }}
                    >
                      Найз хасах
                    </button>
                  ) : (
                    <button
                      onClick={() => addFriend(u._id)}
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
