const Student = require("../models/Student");
const Company = require("../models/Company");
const Room = require("../models/Room");

const branches = ["CSE", "ISE", "ECE", "EEE", "ME"];

const companyNames = [
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture",
  "Capgemini",
  "Cognizant",
  "IBM",
  "Deloitte",
  "Amazon",
  "Microsoft",
  "Google",
  "Razorpay",
  "Flipkart",
  "PhonePe",
  "Zoho",
  "Freshworks",
  "Oracle",
  "SAP",
  "Bosch",
  "Siemens",
  "Intel",
  "Nvidia",
  "Cisco",
  "Dell",
  "HP",
  "EY",
  "KPMG",
  "PwC",
  "JPMorgan",
  "Goldman Sachs",
  "Paytm",
  "Swiggy",
  "Meesho",
  "Myntra",
  "TechMahindra",
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomCgpa() {
  return Number((Math.random() * 3.5 + 5.5).toFixed(2));
}

async function generateData() {
  console.log("Starting dataset generation...");

  // --------------------------------------------------
  // 1. Delete old data
  // --------------------------------------------------
  console.log("Deleting old students, companies and rooms...");

  await Student.deleteMany({});
  await Company.deleteMany({});
  await Room.deleteMany({});

  console.log("Old data deleted successfully.");

  // --------------------------------------------------
  // 2. Generate companies
  // --------------------------------------------------
  console.log("Generating companies...");

  const companies = [];

  for (let i = 0; i < 35; i++) {
    const panelCount = Math.floor(Math.random() * 4) + 1;

    const panels = [];

    for (let j = 1; j <= panelCount; j++) {
      panels.push({
        panelNumber: j,
        available: true,
      });
    }

    companies.push({
      name: companyNames[i],

      // First 10 companies are scheduled for Day 1
      day: i < 10 ? 1 : Math.floor(Math.random() * 4) + 1,

      // First 10 companies get highest priority
      priorityTier:
        i < 10 ? 1 : Math.floor(Math.random() * 3) + 1,

      cgpaCutoff: Number(
        (Math.random() * 3 + 6).toFixed(1)
      ),

      interviewDuration: getRandomItem([20, 30, 45]),

      panels,
    });
  }

  const createdCompanies = await Company.insertMany(companies);

  console.log(
    `Companies inserted successfully: ${createdCompanies.length}`
  );

  // --------------------------------------------------
  // 3. Generate students
  // --------------------------------------------------
  console.log("Generating students...");

  const students = [];

  for (let i = 1; i <= 800; i++) {
    const cgpa = getRandomCgpa();

    // Find companies for which this student is eligible
    const eligibleCompanies = createdCompanies.filter(
      (company) => cgpa >= company.cgpaCutoff
    );

    // Student can shortlist between 1 and 6 companies
    const shortlistCount = Math.min(
      eligibleCompanies.length,
      Math.floor(Math.random() * 6) + 1
    );

    // Randomize eligible companies
    const shuffled = [...eligibleCompanies].sort(
      () => Math.random() - 0.5
    );

    // Select shortlisted companies
    const shortlistedBy = shuffled
      .slice(0, shortlistCount)
      .map((company) => company._id);

    students.push({
      name: `Student ${i}`,
      cgpa,
      branch: getRandomItem(branches),
      shortlistedBy,
    });
  }

  // Insert all students in one database operation
  const createdStudents = await Student.insertMany(students);

  console.log(
    `Students inserted successfully: ${createdStudents.length}`
  );

  // --------------------------------------------------
  // 4. Generate rooms
  // --------------------------------------------------
  console.log("Generating rooms...");

  const rooms = [];

  for (let i = 1; i <= 20; i++) {
    rooms.push({
      name: `Room ${i}`,
      available: true,
    });
  }

  console.log(`About to insert rooms: ${rooms.length}`);

  const createdRooms = await Room.insertMany(rooms);

  console.log(
    `Rooms inserted successfully: ${createdRooms.length}`
  );

  // --------------------------------------------------
  // 5. Return result
  // --------------------------------------------------
  console.log("Dataset generation completed successfully.");

  return {
    companies: createdCompanies.length,
    students: createdStudents.length,
    rooms: createdRooms.length,
  };
}

module.exports = generateData;