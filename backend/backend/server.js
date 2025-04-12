const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const showRoutes = require("./routes/showRoutes");
const theatreRoutes = require("./routes/theatreRoutes");
const movieRoutes = require("./routes/movieRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Load environment variables
dotenv.config({ path: "./.env" });

const app = express();

// Enable CORS (for all origins, modify as needed)
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/theatre", theatreRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth/admin", adminRoutes);
app.use("/api/review", reviewRoutes);

// Port to run the server on
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// MongoDB URI from environment variable
const mongoUri = process.env.MONGO_URI;

// MongoDB connection function
// MongoDB connection function
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri);  // Removed useNewUrlParser and useUnifiedTopology
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};


// Connect to MongoDB
connectToMongo();

// Error handling middleware (generic error handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", status: false });
});
