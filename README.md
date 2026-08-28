# Placement Interview Scheduler

A full-stack web application for scheduling placement interviews and handling real-world disruptions such as student withdrawals, company delays, room unavailability, and panel drop-outs.

The system automatically generates interview schedules based on available students, companies, rooms, panels, and time slots. It also supports replanning affected interviews when disruptions occur.


## Features

### Interview Scheduling

- Generates placement interview data
- Automatically schedules interviews
- Assigns students to companies
- Allocates available rooms
- Assigns interview panels
- Handles time slots
- Marks interviews as:
  - Scheduled
  - Unscheduled
  - Cancelled

### Dashboard

The dashboard provides an overview of the interview scheduling system, including:

- Total Interviews
- Scheduled Interviews
- Unscheduled Interviews
- Cancelled Interviews
- Schedule Success Rate
- Available Rooms

The dashboard can be refreshed to retrieve the latest data from the backend.

### Disruption & Replanning

The system supports simulation of real-world placement disruptions.

#### 1. Student Withdrawal

When a student withdraws from the placement process:

- The student is marked as withdrawn
- Their future scheduled interviews are cancelled
- A summary of affected interviews is returned

#### 2. Company Delay

When a company is delayed:

- Affected interviews are identified
- The scheduling system attempts to replan the affected interviews

#### 3. Room Unavailable

When a room becomes unavailable:

- Interviews assigned to that room are identified
- The system attempts to move them to another available room
- If no suitable room is available, the interview is marked as unscheduled

#### 4. Panel Drop-out

When an interview panel becomes unavailable:

- Affected interviews are identified
- The system attempts to assign another available panel
- Interviews that cannot be reassigned remain unscheduled

---

## Tech Stack

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose



