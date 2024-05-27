const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const mongoURI =
  "mongodb+srv://nannapatrew1:24TgTKru5LfHPuSL@cluster0.cierzdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(mongoURI, {})
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


const UserSchema = new mongoose.Schema({
  emailOrPhone: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  encryptedPassword: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// API 
app.post("/api/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) {
    return res
      .status(400)
      .send({ message: "Email/phone and password are required." });
  }

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
    return res.status(400).send({ message: "Invalid email or phone." });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ emailOrPhone });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists." });
    }

    // Encrypt password
    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      "secret key 123"
    ).toString();

    // Save user
    const newUser = new User({ emailOrPhone, password, encryptedPassword });
    await newUser.save();

    res.send({ message: "Account created successfully." });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
