const express = require("express");
const createSchedule = require("../services/scheduler");

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const result = await createSchedule();

    res.status(201).json({
      message: "Schedule generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Schedule error:", error);

    res.status(500).json({
      message: "Failed to generate schedule",
      error: error.message,
    });
  }
});

module.exports = router;