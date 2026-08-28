const express = require("express");
const Room = require("../models/Room");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();

    res.status(200).json({
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;