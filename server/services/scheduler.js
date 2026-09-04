const Student = require("../models/Student");
const Company = require("../models/Company");
const Room = require("../models/Room");
const Interview = require("../models/Interview");

// Check whether two time ranges overlap
function isOverlapping(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

// Create time slots for one day
function generateTimeSlots(day, duration) {
  const slots = [];

  // August 2026
  const date = new Date(2026, 7, day);
  date.setHours(9, 0, 0, 0);

  const endOfDay = new Date(2026, 7, day);
  endOfDay.setHours(17, 0, 0, 0);

  let currentTime = new Date(date);

  while (
    currentTime.getTime() + duration * 60000 <=
    endOfDay.getTime()
  ) {
    const startTime = new Date(currentTime);

    const endTime = new Date(
      currentTime.getTime() + duration * 60000
    );

    slots.push({
      startTime,
      endTime,
    });

    currentTime = endTime;
  }

  return slots;
}

async function createSchedule() {
  console.log("=================================");
  console.log("Starting schedule generation...");
  console.log("=================================");

  // Remove previous schedule
  console.log("Deleting old interviews...");
  await Interview.deleteMany({});
  console.log("Old interviews deleted.");

  // Load data
  console.log("Loading students...");
  const students = await Student.find({
    withdrawn: false,
  });

  console.log(`Students loaded: ${students.length}`);

  console.log("Loading companies...");
  const companies = await Company.find();

  console.log(`Companies loaded: ${companies.length}`);

  console.log("Loading rooms...");
  const rooms = await Room.find({
    available: true,
  });

  console.log(`Available rooms: ${rooms.length}`);

  if (students.length === 0) {
    throw new Error("No students found. Generate dataset first.");
  }

  if (companies.length === 0) {
    throw new Error("No companies found. Generate dataset first.");
  }

  if (rooms.length === 0) {
    throw new Error("No available rooms found. Generate dataset first.");
  }

  const scheduledInterviews = [];
  const unscheduledInterviews = [];

  /*
    These maps make availability checking much faster.

    Instead of checking EVERY previous interview,
    we only check interviews belonging to the specific
    student, room, or panel.
  */

  const studentSchedules = new Map();
  const roomSchedules = new Map();
  const panelSchedules = new Map();

  function getSchedule(map, key) {
    if (!map.has(key)) {
      map.set(key, []);
    }

    return map.get(key);
  }

  function isAvailable(schedule, startTime, endTime) {
    return !schedule.some((interview) =>
      isOverlapping(
        startTime,
        endTime,
        interview.startTime,
        interview.endTime
      )
    );
  }

  // Sort companies by priority
  companies.sort((a, b) => {
    if (a.priorityTier !== b.priorityTier) {
      return a.priorityTier - b.priorityTier;
    }

    return a.day - b.day;
  });

  console.log("Companies sorted by priority.");

  // Process companies
  for (const company of companies) {
    console.log(
      `Processing company: ${company.name} | Day: ${company.day}`
    );

    // Find students shortlisted by this company
    const shortlistedStudents = students.filter((student) =>
      student.shortlistedBy.some(
        (companyId) =>
          companyId.toString() === company._id.toString()
      )
    );

    console.log(
      `${company.name}: ${shortlistedStudents.length} shortlisted students`
    );

    if (shortlistedStudents.length === 0) {
      continue;
    }

    // Generate slots for this company
    const timeSlots = generateTimeSlots(
      company.day,
      company.interviewDuration
    );

    /*
      Only use panels that are available.
    */
    const availablePanels = company.panels.filter(
      (panel) => panel.available
    );

    if (availablePanels.length === 0) {
      console.log(
        `${company.name}: No available panels`
      );

      for (const student of shortlistedStudents) {
        unscheduledInterviews.push({
          student: student._id,
          company: company._id,
          room: null,
          panelNumber: null,
          startTime: null,
          endTime: null,
          status: "unscheduled",
          unscheduledReason:
            "No available panel",
        });
      }

      continue;
    }

    // Schedule students
    for (const student of shortlistedStudents) {
      let interviewScheduled = false;

      const studentKey = student._id.toString();

      const studentSchedule =
        getSchedule(studentSchedules, studentKey);

      /*
        Try every time slot.
      */
      for (const slot of timeSlots) {
        if (interviewScheduled) {
          break;
        }

        // Student must be free
        if (
          !isAvailable(
            studentSchedule,
            slot.startTime,
            slot.endTime
          )
        ) {
          continue;
        }

        /*
          Try available panels.
        */
        for (const panel of availablePanels) {
          if (interviewScheduled) {
            break;
          }

          const panelKey =
            `${company._id.toString()}-${panel.panelNumber}`;

          const panelSchedule =
            getSchedule(panelSchedules, panelKey);

          // Panel must be free
          if (
            !isAvailable(
              panelSchedule,
              slot.startTime,
              slot.endTime
            )
          ) {
            continue;
          }

          /*
            Try available rooms.
          */
          for (const room of rooms) {
            if (interviewScheduled) {
              break;
            }

            const roomKey = room._id.toString();

            const roomSchedule =
              getSchedule(roomSchedules, roomKey);

            // Room must be free
            if (
              !isAvailable(
                roomSchedule,
                slot.startTime,
                slot.endTime
              )
            ) {
              continue;
            }

            /*
              We found a valid combination:

              Student
              + Company
              + Panel
              + Room
              + Time
            */

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

            /*
              Store the interview in the three
              relevant availability maps.
            */

            studentSchedule.push({
              startTime: slot.startTime,
              endTime: slot.endTime,
            });

            panelSchedule.push({
              startTime: slot.startTime,
              endTime: slot.endTime,
            });

            roomSchedule.push({
              startTime: slot.startTime,
              endTime: slot.endTime,
            });

            interviewScheduled = true;
          }
        }
      }

      /*
        If no valid combination was found,
        create an unscheduled interview.
      */

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

  console.log("---------------------------------");
  console.log(
    `Scheduled interviews: ${scheduledInterviews.length}`
  );
  console.log(
    `Unscheduled interviews: ${unscheduledInterviews.length}`
  );
  console.log("---------------------------------");

  /*
    Insert everything into MongoDB in one operation.
  */

  const allInterviews = [
    ...scheduledInterviews,
    ...unscheduledInterviews,
  ];

  if (allInterviews.length > 0) {
    console.log(
      `Saving ${allInterviews.length} interviews...`
    );

    await Interview.insertMany(allInterviews);

    console.log("Interviews saved successfully.");
  }

  console.log("=================================");
  console.log("Schedule generation completed.");
  console.log("=================================");

  return {
    scheduled: scheduledInterviews.length,
    unscheduled: unscheduledInterviews.length,
    total: allInterviews.length,
  };
}

module.exports = createSchedule;