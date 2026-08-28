const express = require("express");
const generateData = require("../services/dataGenerator");

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const result = await generateData();

    res.status(201).json({
      message: "Dataset generated successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to generate dataset",
      error: error.message,
    });
  }
});

module.exports = router;