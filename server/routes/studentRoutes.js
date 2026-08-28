const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const students = await Student.find()
      .select("name cgpa branch withdrawn")
      .limit(50);

    res.status(200).json({
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;