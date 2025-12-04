const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/User");
const Place = require("./models/Place");
const session = require("express-session");
mongoose
  .connect("mongodb://localhost:27017/placesdb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.post("/login", (req, res) => {
  const { username } = req.body;
  req.session.username = username;
  res.send("Amjilttai nevtrelee " + username);
});

app.get("/profile", (req, res) => {
  if (!req.session.username) {
    return res.send("Login ehleed hiine uu");
  }
  res.send("Hi: " + req.session.username);
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Amjilttai garlaa" + req.session.username);
  });
});

// GET: Бүх хэрэглэгчид
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Хэрэглэгчдийг авахад алдаа гарлаа" });
  }
});

// GET: Нэг хэрэглэгч
app.get("/api/users/:id", async (req, res) => {
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
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: "Login хийхэд алдаа гарлаа" });
  }
});

// PUT: Хэрэглэгч засах
app.put("/api/users/:id", async (req, res) => {
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

// POST: Найз нэмэх
app.post("/api/users/:id/friends", async (req, res) => {
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

// DELETE: Найз устгах
app.delete("/api/users/:id/friends/:friendId", async (req, res) => {
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
});

// ---------------- PLACES ---------------- //

// GET: Бүх газар
app.get("/api/places", async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: "Газар авахад алдаа гарлаа" });
  }
});

// GET: Нэг газар
app.get("/api/places/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Газар олдсонгүй" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: "Газар авахад алдаа гарлаа" });
  }
});

// POST: Газар нэмэх
app.post("/api/places", async (req, res) => {
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
app.put("/api/places/:id", async (req, res) => {
  const { name, description, location, rating, image, userId } = req.body;

  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Газар олдсонгүй" });

    if (place.userId !== userId) {
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
app.delete("/api/places/:id", async (req, res) => {
  const { userId } = req.body;

  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Газар олдсонгүй" });

    if (place.userId !== userId) {
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
app.get("/api/users/:userId/places", async (req, res) => {
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
