const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
const allowedOrigins = ['https://unique-bienenstitch-f059d6.netlify.app']; // your Netlify domain

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// MongoDB Atlas URI — replace with your actual credentials
const MONGO_URI = process.env.MONGO_URI;


// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// User model
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// Calculation model
const calcSchema = new mongoose.Schema({
  username: String,
  number: Number,
  result: Number,
  date: { type: Date, default: Date.now }
});

const Calculation = mongoose.model("Calculation", calcSchema);

// ------------------ Routes ------------------ //

// Registration
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ success: true, message: "User registered" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ success: true, user: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Calculate sum of digits
app.post("/api/calculate", async (req, res) => {
  try {
    const { username, number } = req.body;

    if (!username || isNaN(number)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const result = (number * (number + 1)) / 2;

    const newCalc = new Calculation({ username, number, result });
    await newCalc.save();

    res.json({ result });
  } catch (err) {
    console.error("Calculation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch last 5 calculations
app.get("/api/history/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const history = await Calculation.find({ username })
      .sort({ date: -1 })
      .limit(5);

    res.json(history);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------------------- //

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
