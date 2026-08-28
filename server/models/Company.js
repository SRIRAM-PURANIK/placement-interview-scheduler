const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
    priorityTier: {
      type: Number,
      required: true,
    },
    cgpaCutoff: {
      type: Number,
      required: true,
    },
    interviewDuration: {
      type: Number,
      required: true,
    },
    panels: [
      {
        panelNumber: Number,
        available: {
          type: Boolean,
          default: true,
        },
      },
    ],
    arrivalDelay: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);