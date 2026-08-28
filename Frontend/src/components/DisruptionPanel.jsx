import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function DisruptionPanel({ refreshDashboard }) {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const [delayHours, setDelayHours] = useState(1);
  const [panelNumber, setPanelNumber] = useState(1);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, companiesRes, roomsRes] =
        await Promise.all([
          axios.get(`${API}/students`),
          axios.get(`${API}/companies`),
          axios.get(`${API}/rooms`),
        ]);

      setStudents(studentsRes.data.data || []);
      setCompanies(companiesRes.data.data || []);
      setRooms(roomsRes.data.data || []);
    } catch (error) {
      console.error("Failed to load disruption data", error);
    }
  };

  const handleStudentWithdraw = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/disruptions/student-withdraw/${selectedStudent}`
      );

      setResult(response.data.data);

      await refreshDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to process student withdrawal"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyDelay = async () => {
    if (!selectedCompany) {
      alert("Please select a company");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/disruptions/company-delay/${selectedCompany}`,
        {
          delayHours: Number(delayHours),
        }
      );

      setResult(response.data.data);

      await refreshDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to process company delay"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoomUnavailable = async () => {
    if (!selectedRoom) {
      alert("Please select a room");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/disruptions/room-unavailable/${selectedRoom}`
      );

      setResult(response.data.data);

      await refreshDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to process room disruption"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePanelDrop = async () => {
    if (!selectedCompany) {
      alert("Please select a company");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/disruptions/panel-drop/${selectedCompany}/${panelNumber}`
      );

      setResult(response.data.data);

      await refreshDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to process panel drop"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="disruption-section">
      <div className="section-header">
        <div>
          <h2>Disruption & Replanning</h2>

          <p>
            Simulate real-world placement disruptions and
            automatically replan affected interviews.
          </p>
        </div>
      </div>

      <div className="disruption-grid">

        {/* STUDENT WITHDRAWAL */}
        <div className="disruption-card">
          <h3>Student Withdrawal</h3>

          <p>
            Cancel all scheduled interviews for a student.
          </p>

          <select
            value={selectedStudent}
            onChange={(e) =>
              setSelectedStudent(e.target.value)
            }
          >
            <option value="">
              Select Student
            </option>

            {students.map((student) => (
              <option
                key={student._id}
                value={student._id}
              >
                {student.name} — CGPA {student.cgpa}
              </option>
            ))}
          </select>

          <button
            onClick={handleStudentWithdraw}
            disabled={loading}
          >
            Withdraw Student
          </button>
        </div>

        {/* COMPANY DELAY */}
        <div className="disruption-card">
          <h3>Company Delay</h3>

          <p>
            Move affected interviews when a company arrives late.
          </p>

          <select
            value={selectedCompany}
            onChange={(e) =>
              setSelectedCompany(e.target.value)
            }
          >
            <option value="">
              Select Company
            </option>

            {companies.map((company) => (
              <option
                key={company._id}
                value={company._id}
              >
                {company.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={delayHours}
            onChange={(e) =>
              setDelayHours(e.target.value)
            }
            placeholder="Delay hours"
          />

          <button
            onClick={handleCompanyDelay}
            disabled={loading}
          >
            Replan Company Delay
          </button>
        </div>

        {/* ROOM UNAVAILABLE */}
        <div className="disruption-card">
          <h3>Room Unavailable</h3>

          <p>
            Reassign interviews to another available room.
          </p>

          <select
            value={selectedRoom}
            onChange={(e) =>
              setSelectedRoom(e.target.value)
            }
          >
            <option value="">
              Select Room
            </option>

            {rooms.map((room) => (
              <option
                key={room._id}
                value={room._id}
              >
                {room.name}
                {room.available
                  ? " — Available"
                  : " — Unavailable"}
              </option>
            ))}
          </select>

          <button
            onClick={handleRoomUnavailable}
            disabled={loading}
          >
            Make Room Unavailable
          </button>
        </div>

        {/* PANEL DROP */}
        <div className="disruption-card">
          <h3>Panel Drop-out</h3>

          <p>
            Move interviews to another available panel.
          </p>

          <select
            value={selectedCompany}
            onChange={(e) =>
              setSelectedCompany(e.target.value)
            }
          >
            <option value="">
              Select Company
            </option>

            {companies.map((company) => (
              <option
                key={company._id}
                value={company._id}
              >
                {company.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={panelNumber}
            onChange={(e) =>
              setPanelNumber(e.target.value)
            }
            placeholder="Panel Number"
          />

          <button
            onClick={handlePanelDrop}
            disabled={loading}
          >
            Drop Panel
          </button>
        </div>

      </div>

      {loading && (
        <div className="processing">
          Processing disruption and replanning...
        </div>
      )}

      {result && (
        <div className="result-box">
          <h3>
            Replanning Result: {result.disruption}
          </h3>

          <div className="result-summary">
            {result.summary &&
              Object.entries(result.summary).map(
                ([key, value]) => (
                  <div key={key}>
                    <span>
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>

                    <strong>{value}</strong>
                  </div>
                )
              )}
          </div>

          {result.changes &&
            result.changes.length > 0 && (
              <>
                <h4>Changes Made</h4>

                <div className="changes-list">
                  {result.changes.slice(0, 20).map(
                    (change, index) => (
                      <div
                        className="change-item"
                        key={index}
                      >
                        <strong>
                          {change.action}
                        </strong>

                        <span>
                          Interview:{" "}
                          {change.interviewId}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </>
            )}

          {result.unscheduled &&
            result.unscheduled.length > 0 && (
              <>
                <h4>Could Not Be Scheduled</h4>

                <p>
                  {result.unscheduled.length} interview(s)
                  could not be accommodated.
                </p>
              </>
            )}
        </div>
      )}
    </div>
  );
}

export default DisruptionPanel;