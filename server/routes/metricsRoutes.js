const express = require("express");
const calculateMetrics = require("../services/metrics");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const metrics = await calculateMetrics();

    res.status(200).json({
      message: "Metrics fetched successfully",
      data: metrics,
    });
  } catch (error) {
    console.error("Metrics error:", error);

    res.status(500).json({
      message: "Failed to fetch metrics",
      error: error.message,
    });
  }
});

module.exports = router;