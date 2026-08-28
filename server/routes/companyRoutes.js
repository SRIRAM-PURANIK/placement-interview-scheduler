const express = require("express");
const Company = require("../models/Company");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const companies = await Company.find().select(
      "name day priorityTier cgpaCutoff interviewDuration panels arrivalDelay"
    );

    res.status(200).json({
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;