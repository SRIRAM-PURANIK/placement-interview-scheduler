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
  await Student.deleteMany({});
  await Company.deleteMany({});
  await Room.deleteMany({});

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
      day: i < 10 ? 1 : Math.floor(Math.random() * 4) + 1,
      priorityTier: i < 10 ? 1 : Math.floor(Math.random() * 3) + 1,
      cgpaCutoff: Number((Math.random() * 3 + 6).toFixed(1)),
      interviewDuration: getRandomItem([20, 30, 45]),
      panels,
    });
  }

  const createdCompanies = await Company.insertMany(companies);

  const students = [];

  for (let i = 1; i <= 800; i++) {
    students.push({
      name: `Student ${i}`,
      cgpa: getRandomCgpa(),
      branch: getRandomItem(branches),
      shortlistedBy: [],
    });
  }

  const createdStudents = await Student.insertMany(students);

  for (const student of createdStudents) {
    const eligibleCompanies = createdCompanies.filter(
      (company) => student.cgpa >= company.cgpaCutoff
    );

    const shortlistCount = Math.min(
      eligibleCompanies.length,
      Math.floor(Math.random() * 6) + 1
    );

    const shuffled = [...eligibleCompanies].sort(
      () => Math.random() - 0.5
    );

    student.shortlistedBy = shuffled
      .slice(0, shortlistCount)
      .map((company) => company._id);

    await student.save();
  }

  const rooms = [];

  for (let i = 1; i <= 20; i++) {
    rooms.push({
      name: `Room ${i}`,
      available: true,
    });
  }

  await Room.insertMany(rooms);

  return {
    companies: createdCompanies.length,
    students: createdStudents.length,
    rooms: 20,
  };
}

module.exports = generateData;