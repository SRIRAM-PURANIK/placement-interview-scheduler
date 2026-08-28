const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const schedulerRoutes = require("./routes/schedulerRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const disruptionRoutes = require("./routes/disruptionRoutes");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const roomRoutes = require("./routes/roomRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

require("dotenv").config();

const dataRoutes = require("./routes/dataRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/data", dataRoutes);
app.use("/api/schedule", schedulerRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/disruptions", disruptionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/interviews", interviewRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

app.get("/", (req, res) => {
  res.json({
    message: "Placement Scheduler API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});