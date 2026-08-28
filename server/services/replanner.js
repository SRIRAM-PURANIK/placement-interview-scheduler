const Student = require("../models/Student");
const Interview = require("../models/Interview");
const Company = require("../models/Company");
const Room = require("../models/Room");

function isRoomAvailable(roomId, startTime, endTime, interviews) {
  return !interviews.some((interview) => {
    if (!interview.room) return false;

    if (interview.room.toString() !== roomId.toString()) {
      return false;
    }

    const existingStart = new Date(interview.startTime);
    const existingEnd = new Date(interview.endTime);

    return startTime < existingEnd && endTime > existingStart;
  });
}

function isPanelAvailable(
  companyId,
  panelNumber,
  startTime,
  endTime,
  interviews
) {
  return !interviews.some((interview) => {
    if (
      !interview.company ||
      interview.company.toString() !== companyId.toString()
    ) {
      return false;
    }

    if (interview.panelNumber !== panelNumber) {
      return false;
    }

    const existingStart = new Date(interview.startTime);
    const existingEnd = new Date(interview.endTime);

    return startTime < existingEnd && endTime > existingStart;
  });
}

async function withdrawStudent(studentId) {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  student.withdrawn = true;
  await student.save();

  const affectedInterviews = await Interview.find({
    student: studentId,
    status: "scheduled",
  })
    .populate("company", "name")
    .populate("room", "name");

  const affectedIds = affectedInterviews.map(
    (interview) => interview._id
  );

  await Interview.updateMany(
    {
      _id: { $in: affectedIds },
    },
    {
      $set: {
        status: "cancelled",
        unscheduledReason:
          "Student withdrew from placement process",
      },
    }
  );

  return {
    disruption: "STUDENT_WITHDRAWAL",

    student: {
      id: student._id,
      name: student.name,
    },

    summary: {
      interviewsCancelled: affectedInterviews.length,
    },

    changes: affectedInterviews.map((interview) => ({
      interviewId: interview._id,
      company: interview.company?.name,
      room: interview.room?.name,
      startTime: interview.startTime,
      endTime: interview.endTime,
      action: "CANCELLED",
      reason:
        "Student withdrew from placement process",
    })),

    peopleToInform: affectedInterviews.map((interview) => ({
      student: student.name,
      company: interview.company?.name,
      room: interview.room?.name,
    })),
  };
}

async function delayCompany(companyId, delayHours) {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new Error("Company not found");
  }

  const delay = Number(delayHours);

  if (!delay || delay <= 0) {
    throw new Error("Delay hours must be greater than 0");
  }

  const affectedInterviews = await Interview.find({
    company: companyId,
    status: "scheduled",
  });

  const affectedIds = affectedInterviews.map(
    (interview) => interview._id
  );

  const otherInterviews = await Interview.find({
    status: "scheduled",
    _id: {
      $nin: affectedIds,
    },
  });

  const changes = [];
  const unscheduled = [];

  for (const interview of affectedInterviews) {
    const oldStartTime = new Date(interview.startTime);
    const oldEndTime = new Date(interview.endTime);

    const newStartTime = new Date(
      oldStartTime.getTime() + delay * 60 * 60 * 1000
    );

    const newEndTime = new Date(
      oldEndTime.getTime() + delay * 60 * 60 * 1000
    );

    const roomAvailable = isRoomAvailable(
      interview.room,
      newStartTime,
      newEndTime,
      otherInterviews
    );

    const panelAvailable = isPanelAvailable(
      companyId,
      interview.panelNumber,
      newStartTime,
      newEndTime,
      otherInterviews
    );

    if (roomAvailable && panelAvailable) {
      interview.startTime = newStartTime;
      interview.endTime = newEndTime;

      await interview.save();

      otherInterviews.push(interview);

      changes.push({
        interviewId: interview._id,
        oldStartTime,
        oldEndTime,
        newStartTime,
        newEndTime,
        action: "RESCHEDULED",
      });
    } else {
      interview.status = "unscheduled";

      interview.unscheduledReason =
        "Company delay caused scheduling conflict";

      await interview.save();

      unscheduled.push({
        interviewId: interview._id,
        action: "UNSCHEDULED",
        reason:
          "No valid room or panel available after company delay",
      });
    }
  }

  return {
    disruption: "COMPANY_DELAY",

    company: {
      id: company._id,
      name: company.name,
    },

    delayHours: delay,

    summary: {
      interviewsAffected: affectedInterviews.length,
      rescheduled: changes.length,
      unscheduled: unscheduled.length,
    },

    changes,
    unscheduled,
  };
}

async function makeRoomUnavailable(roomId) {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new Error("Room not found");
  }

  room.available = false;
  await room.save();

  const affectedInterviews = await Interview.find({
    room: roomId,
    status: "scheduled",
  });

  const availableRooms = await Room.find({
    available: true,
  });

  const affectedIds = affectedInterviews.map(
    (interview) => interview._id
  );

  const otherInterviews = await Interview.find({
    status: "scheduled",
    _id: {
      $nin: affectedIds,
    },
  });

  const changes = [];
  const unscheduled = [];

  for (const interview of affectedInterviews) {
    let roomFound = false;

    for (const availableRoom of availableRooms) {
      if (
        isRoomAvailable(
          availableRoom._id,
          new Date(interview.startTime),
          new Date(interview.endTime),
          otherInterviews
        )
      ) {
        const oldRoom = interview.room;

        interview.room = availableRoom._id;

        await interview.save();

        otherInterviews.push(interview);

        changes.push({
          interviewId: interview._id,
          student: interview.student,
          oldRoom,
          newRoom: availableRoom._id,
          startTime: interview.startTime,
          endTime: interview.endTime,
          action: "ROOM_CHANGED",
        });

        roomFound = true;
        break;
      }
    }

    if (!roomFound) {
      interview.status = "unscheduled";
      interview.room = null;
      interview.panelNumber = null;

      interview.unscheduledReason =
        "Original room became unavailable and no replacement room was found";

      await interview.save();

      unscheduled.push({
        interviewId: interview._id,
        student: interview.student,
        action: "UNSCHEDULED",
        reason: "No replacement room available",
      });
    }
  }

  return {
    disruption: "ROOM_UNAVAILABLE",

    room: {
      id: room._id,
      name: room.name,
    },

    summary: {
      interviewsAffected: affectedInterviews.length,
      roomChanged: changes.length,
      unscheduled: unscheduled.length,
    },

    changes,
    unscheduled,
  };
}

async function dropPanel(companyId, panelNumber) {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new Error("Company not found");
  }

  const panel = company.panels.find(
    (p) => p.panelNumber === Number(panelNumber)
  );

  if (!panel) {
    throw new Error("Panel not found");
  }

  panel.available = false;
  await company.save();

  const affectedInterviews = await Interview.find({
    company: companyId,
    panelNumber: Number(panelNumber),
    status: "scheduled",
  });

  const affectedIds = affectedInterviews.map(
    (interview) => interview._id
  );

  const otherInterviews = await Interview.find({
    status: "scheduled",
    _id: {
      $nin: affectedIds,
    },
  });

  const changes = [];
  const unscheduled = [];

  for (const interview of affectedInterviews) {
    let panelFound = false;

    for (const availablePanel of company.panels) {
      if (!availablePanel.available) continue;

      if (
        isPanelAvailable(
          company._id,
          availablePanel.panelNumber,
          new Date(interview.startTime),
          new Date(interview.endTime),
          otherInterviews
        )
      ) {
        const oldPanel = interview.panelNumber;

        interview.panelNumber =
          availablePanel.panelNumber;

        await interview.save();

        otherInterviews.push(interview);

        changes.push({
          interviewId: interview._id,
          student: interview.student,
          oldPanel,
          newPanel: availablePanel.panelNumber,
          startTime: interview.startTime,
          endTime: interview.endTime,
          action: "PANEL_CHANGED",
        });

        panelFound = true;
        break;
      }
    }

    if (!panelFound) {
      interview.status = "unscheduled";
      interview.room = null;
      interview.panelNumber = null;
      interview.startTime = null;
      interview.endTime = null;

      interview.unscheduledReason =
        "Panel dropped out and no replacement panel was available";

      await interview.save();

      unscheduled.push({
        interviewId: interview._id,
        student: interview.student,
        action: "UNSCHEDULED",
        reason: "No replacement panel available",
      });
    }
  }

  return {
    disruption: "PANEL_MEMBER_DROPOUT",

    company: {
      id: company._id,
      name: company.name,
    },

    droppedPanel: Number(panelNumber),

    summary: {
      interviewsAffected: affectedInterviews.length,
      panelChanged: changes.length,
      unscheduled: unscheduled.length,
    },

    changes,
    unscheduled,
  };
}

module.exports = {
  withdrawStudent,
  delayCompany,
  makeRoomUnavailable,
  dropPanel,
};