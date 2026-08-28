const Interview = require("../models/Interview");
const Room = require("../models/Room");

async function calculateMetrics() {
  const total = await Interview.countDocuments();

  const scheduled = await Interview.countDocuments({
    status: "scheduled",
  });

  const unscheduled = await Interview.countDocuments({
    status: "unscheduled",
  });

  const cancelled = await Interview.countDocuments({
    status: "cancelled",
  });

  const rooms = await Room.find();

  const schedulePercentage =
    total > 0
      ? Number(((scheduled / total) * 100).toFixed(2))
      : 0;

  return {
    totalInterviews: total,
    scheduled,
    unscheduled,
    cancelled,
    schedulePercentage,
    availableRooms: rooms.filter(
      (room) => room.available
    ).length,
    unavailableRooms: rooms.filter(
      (room) => !room.available
    ).length,
  };
}

module.exports = calculateMetrics;
