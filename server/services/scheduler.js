const Student = require("../models/Student");
const Company = require("../models/Company");
const Room = require("../models/Room");
const Interview = require("../models/Interview");

// Check whether two time ranges overlap
function isOverlapping(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

// Create available time slots for one day
function generateTimeSlots(day, duration) {
  const slots = [];

  const date = new Date(2026, 7, day); // August 2026
  date.setHours(9, 0, 0, 0);

  const endOfDay = new Date(2026, 7, day);
  endOfDay.setHours(17, 0, 0, 0);

  let currentTime = new Date(date);

  while (currentTime.getTime() + duration * 60000 <= endOfDay.getTime()) {
    const startTime = new Date(currentTime);

    const endTime = new Date(
      currentTime.getTime() + duration * 60000
    );

    slots.push({
      startTime,
      endTime,
    });

    currentTime = new Date(
      currentTime.getTime() + duration * 60000
    );
  }

  return slots;
}

// Check whether student is already busy
function isStudentAvailable(studentId, startTime, endTime, scheduledInterviews) {
  return !scheduledInterviews.some(
    (interview) =>
      interview.student.toString() === studentId.toString() &&
      interview.status === "scheduled" &&
      isOverlapping(
        startTime,
        endTime,
        new Date(interview.startTime),
        new Date(interview.endTime)
      )
  );
}

// Check whether room is already occupied
function isRoomAvailable(roomId, startTime, endTime, scheduledInterviews) {
  return !scheduledInterviews.some(
    (interview) =>
      interview.room &&
      interview.room.toString() === roomId.toString() &&
      interview.status === "scheduled" &&
      isOverlapping(
        startTime,
        endTime,
        new Date(interview.startTime),
        new Date(interview.endTime)
      )
  );
}

// Check whether panel is already occupied
function isPanelAvailable(
  companyId,
  panelNumber,
  startTime,
  endTime,
  scheduledInterviews
) {
  return !scheduledInterviews.some(
    (interview) =>
      interview.company.toString() === companyId.toString() &&
      interview.panelNumber === panelNumber &&
      interview.status === "scheduled" &&
      isOverlapping(
        startTime,
        endTime,
        new Date(interview.startTime),
        new Date(interview.endTime)
      )
  );
}

async function createSchedule() {
  // Remove old schedule
  await Interview.deleteMany({});

  const students = await Student.find({
    withdrawn: false,
  });

  const companies = await Company.find();

  const rooms = await Room.find({
    available: true,
  });

  const scheduledInterviews = [];
  const unscheduledInterviews = [];

  // Sort companies by priority
  companies.sort((a, b) => {
    if (a.priorityTier !== b.priorityTier) {
      return a.priorityTier - b.priorityTier;
    }

    return a.day - b.day;
  });

  // Go through every company
  for (const company of companies) {
    // Find students shortlisted by this company
    const shortlistedStudents = students.filter((student) =>
      student.shortlistedBy.some(
        (companyId) =>
          companyId.toString() === company._id.toString()
      )
    );

    const timeSlots = generateTimeSlots(
      company.day,
      company.interviewDuration
    );

    // Schedule each student
    for (const student of shortlistedStudents) {
      let interviewScheduled = false;

      // Try every time slot
      for (const slot of timeSlots) {
        if (interviewScheduled) break;

        // Check student availability first
        if (
          !isStudentAvailable(
            student._id,
            slot.startTime,
            slot.endTime,
            scheduledInterviews
          )
        ) {
          continue;
        }

        // Try every panel
        for (const panel of company.panels) {
          if (!panel.available || interviewScheduled) continue;

          // Check panel availability
          if (
            !isPanelAvailable(
              company._id,
              panel.panelNumber,
              slot.startTime,
              slot.endTime,
              scheduledInterviews
            )
          ) {
            continue;
          }

          // Try every room
          for (const room of rooms) {
            if (interviewScheduled) break;

            // Check room availability
            if (
              !isRoomAvailable(
                room._id,
                slot.startTime,
                slot.endTime,
                scheduledInterviews
              )
            ) {
              continue;
            }

            // Everything is available → schedule interview
            const interview = {
              student: student._id,
              company: company._id,
              room: room._id,
              panelNumber: panel.panelNumber,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: "scheduled",
              unscheduledReason: null,
            };

            scheduledInterviews.push(interview);

            interviewScheduled = true;
          }
        }
      }

      // Could not find any valid slot
      if (!interviewScheduled) {
        unscheduledInterviews.push({
          student: student._id,
          company: company._id,
          room: null,
          panelNumber: null,
          startTime: null,
          endTime: null,
          status: "unscheduled",
          unscheduledReason:
            "No valid time slot, room, or panel available",
        });
      }
    }
  }

  // Save everything to MongoDB
  await Interview.insertMany([
    ...scheduledInterviews,
    ...unscheduledInterviews,
  ]);

  return {
    scheduled: scheduledInterviews.length,
    unscheduled: unscheduledInterviews.length,
    total:
      scheduledInterviews.length +
      unscheduledInterviews.length,
  };
}

module.exports = createSchedule;