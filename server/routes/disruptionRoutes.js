const express = require("express");
const {
  withdrawStudent,
  delayCompany,
  makeRoomUnavailable,
} = require("../services/replanner");

const router = express.Router();

router.post("/student-withdraw/:studentId", async (req, res) => {
  try {
    const result = await withdrawStudent(req.params.studentId);

    res.status(200).json({
      message: "Student withdrawal processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Disruption error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
});

router.post("/room-unavailable/:roomId", async (req, res) => {
  try {
    const result = await makeRoomUnavailable(req.params.roomId);

    res.status(200).json({
      message: "Room unavailability handled successfully",
      data: result,
    });
  } catch (error) {
    console.error("Room disruption error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;