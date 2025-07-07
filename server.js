const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware - Allow specific frontend domain
app.use(cors({
  origin: ["https://unique-bienenstitch-f059d6.netlify.app"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// MongoDB connection URI
const MONGO_URI = "mongodb+srv://venkyreddy0308:Venkyreddy@cluster0.gqfqswn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

const calcSchema = new mongoose.Schema({
  username: String,
  number: Number,
  result: Number,
  date: { type: Date, default: Date.now }
});
const Calculation = mongoose.model("Calculation", calcSchema);

// Routes
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
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ success: true, user: user.username });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/calculate", async (req, res) => {
  try {
    const { username, number } = req.body;
    if (!username || typeof number !== "number") {
      return res.status(400).json({ error: "Invalid input" });
    }
    const result = (number * (number + 1)) / 2;
    const calc = new Calculation({ username, number, result });
    await calc.save();
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "Calculation failed" });
  }
});

app.get("/api/history/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const history = await Calculation.find({ username }).sort({ date: -1 }).limit(5);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "History fetch failed" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
