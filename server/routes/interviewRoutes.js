const express = require("express");
const router = express.Router();

const Interview = require("../models/Interview");

router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    let interviews = await Interview.find(query)
      .populate("student", "name cgpa branch")
      .populate("company", "name")
      .populate("room", "name")
      .sort({ startTime: 1 });

    // Search by student or company name
    if (search) {
      const searchText = search.toLowerCase();

      interviews = interviews.filter((interview) => {
        const studentName =
          interview.student?.name?.toLowerCase() || "";

        const companyName =
          interview.company?.name?.toLowerCase() || "";

        return (
          studentName.includes(searchText) ||
          companyName.includes(searchText)
        );
      });
    }

    res.json({
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);

    res.status(500).json({
      message: "Failed to fetch interviews",
      error: error.message,
    });
  }
});

module.exports = router;