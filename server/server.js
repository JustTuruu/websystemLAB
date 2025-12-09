const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/User");
const Place = require("./models/Place");
const jwt = require("jsonwebtoken");
mongoose
  .connect("mongodb://localhost:27017/placesdb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 5001;
const ACCESS_TOKEN_SECRET = "mykey";
const REFRESH_TOKEN_SECRET = "your_refresh_secret_key";
let refreshTokens = [];
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT-based auth middleware
function requireLogin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Эхлээд login хийнэ үү (Bearer token шаардлагатай)" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded; // { id, username, iat, exp }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Token хүчингүй эсвэл хугацаа дууссан байна" });
  }
}

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id.toString(), username: user.username },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "5m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id.toString(), username: user.username },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
}

// Test/profile endpoint using JWT
app.get("/profile", requireLogin, (req, res) => {
  res.json({
    message: "JWT-р амжилттай нэвтэрсэн хэрэглэгч",
    user: req.user,
  });
});

// GET: Бүх хэрэглэгчид
app.get("/api/users", requireLogin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Хэрэглэгчдийг авахад алдаа гарлаа" });
  }
});

// GET: Хэрэглэгч хайх (нэрээр) -
app.get("/api/users/search/:query", requireLogin, async (req, res) => {
  try {
    const query = req.params.query;
    // username эсвэл name-аар хайх (case-insensitive)
    const users = await User.find(
      {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      },
      "-password"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Хэрэглэгч хайхад алдаа гарлаа" });
  }
});

// GET: Нэг хэрэглэгч
app.get("/api/users/:id", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Хэрэглэгчийг авахад алдаа гарлаа" });
  }
});

// POST: Хэрэглэгч бүртгэх
app.post("/api/users/register", async (req, res) => {
  const { username, password, name, email } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username болон password оруулна уу" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res
        .status(400)
        .json({ error: "Энэ username-тэй хэрэглэгч аль хэдийн байна" });

    const newUser = new User({
      username,
      password,
      name: name || username,
      email: email || `${username}@example.com`,
      friends: [],
      avatar: `https://i.pravatar.cc/100?u=${encodeURIComponent(username)}`,
    });

    await newUser.save();
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: "Хэрэглэгчийг үүсгэхэд алдаа гарлаа" });
  }
});

// POST: Login
app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username болон password оруулна уу" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ error: "Username эсвэл нууц үг буруу байна" });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.push(refreshToken);

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 30,
      token_type: "Bearer",
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ error: "Login хийхэд алдаа гарлаа" });
  }
});

// POST: Refresh access token using refresh token
app.post("/api/auth/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token шаардлагатай" });
  }

  if (!refreshTokens.includes(refresh_token)) {
    return res.status(401).json({ error: "Refresh token хүчингүй" });
  }

  try {
    const decoded = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    res.json({
      access_token: newAccessToken,
      expires_in: 30,
      token_type: "Bearer",
    });
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Refresh token хугацаа дууссан эсвэл буруу" });
  }
});

// POST: Logout (refresh token-г устгах)
app.post("/api/auth/logout", (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token шаардлагатай" });
  }

  refreshTokens = refreshTokens.filter((t) => t !== refresh_token);
  res.json({ message: "Амжилттай гарлаа" });
});

// PUT: Хэрэглэгч засах
app.put("/api/users/:id", requireLogin, async (req, res) => {
  const { name, email, avatar } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: "Хэрэглэгчийг засахад алдаа гарлаа" });
  }
});

// POST: Найз нэмэх (ID-аар)
app.post("/api/users/:id/friends", requireLogin, async (req, res) => {
  const { friendId } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });

    if (!user.friends.includes(friendId)) user.friends.push(friendId);
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: "Найз нэмэхэд алдаа гарлаа" });
  }
});

// POST: Найз нэмэх (username-аар хайж)
app.post(
  "/api/users/:id/friends/add-by-username",
  requireLogin,
  async (req, res) => {
    const { username } = req.body;

    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });

      // Найзыг username-аар хайх
      const friend = await User.findOne({ username });
      if (!friend) return res.status(404).json({ error: "Найз олдсонгүй" });

      if (friend._id.toString() === req.params.id) {
        return res
          .status(400)
          .json({ error: "Өөрийгөө найз болгох боломжгүй" });
      }

      // Аль хэдийн найз эсэхийг шалгах
      if (user.friends.includes(friend._id.toString())) {
        return res
          .status(400)
          .json({ error: "Энэ хэрэглэгч аль хэдийн таны найз байна" });
      }

      // Найз нэмэх
      user.friends.push(friend._id.toString());
      await user.save();

      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json({
        user: userWithoutPassword,
        addedFriend: {
          _id: friend._id,
          username: friend.username,
          name: friend.name,
          avatar: friend.avatar,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Найз нэмэхэд алдаа гарлаа" });
    }
  }
);

// DELETE: Найз устгах
app.delete(
  "/api/users/:id/friends/:friendId",
  requireLogin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });

      user.friends = user.friends.filter((fid) => fid !== req.params.friendId);
      await user.save();

      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ error: "Найз устгахад алдаа гарлаа" });
    }
  }
);

// ---------------- PLACES ---------------- //

// GET: Бүх газар
app.get("/api/places", requireLogin, async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: "Газар авахад алдаа гарлаа" });
  }
});

// GET: Нэг газар
app.get("/api/places/:id", requireLogin, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Газар олдсонгүй" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: "Газар авахад алдаа гарлаа" });
  }
});

// POST: Газар нэмэх
app.post("/api/places", requireLogin, async (req, res) => {
  const { name, description, location, rating, image, userId } = req.body;

  if (!name || !description || !location || !rating || !image || !userId) {
    return res.status(400).json({ error: "Бүх талбар шаардлагатай" });
  }

  try {
    const newPlace = new Place({
      name,
      description,
      location,
      rating,
      image,
      userId,
    });
    await newPlace.save();
    res.status(201).json(newPlace);
  } catch (err) {
    res.status(500).json({ error: "Газар үүсгэхэд алдаа гарлаа" });
  }
});

// PUT: Газар засах
app.put("/api/places/:id", requireLogin, async (req, res) => {
  const { name, description, location, rating, image, userId } = req.body;

  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Газар олдсонгүй" });

    // userId-г string болгож харьцуулах
    if (place.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Зөвхөн өөрийн газрыг засах боломжтой" });
    }

    if (name) place.name = name;
    if (description) place.description = description;
    if (location) place.location = location;
    if (rating) place.rating = rating;
    if (image) place.image = image;

    await place.save();
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: "Газар засахад алдаа гарлаа" });
  }
});

// DELETE: Газар устгах
app.delete("/api/places/:id", requireLogin, async (req, res) => {
  const { userId } = req.body;

  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Газар олдсонгүй" });

    // userId-г string болгоh
    if (place.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Зөвхөн өөрийн газрыг устгах боломжтой" });
    }

    await Place.findByIdAndDelete(req.params.id);
    res.json({ message: "Газар амжилттай устгагдлаа", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Газар устгахад алдаа гарлаа" });
  }
});

// GET: Хэрэглэгчийн газрууд
app.get("/api/users/:userId/places", requireLogin, async (req, res) => {
  try {
    const places = await Place.find({ userId: req.params.userId });
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: "Газар авахад алдаа гарлаа" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Places API Server",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      places: "/api/places",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
