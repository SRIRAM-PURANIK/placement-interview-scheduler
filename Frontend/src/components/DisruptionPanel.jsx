import { useEffect, useState } from "react";
import axios from "axios";

// Automatically uses Railway variable online, and localhost when offline
const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

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
    <div className="disruption-panel">
      <h3>Disruption & Replanning</h3>
      <p>Simulate real-world placement disruptions and automatically replan affected interviews.</p>
      
      <div className="disruption-grid">
        {/* STUDENT WITHDRAWAL */}
        <div className="disruption-card">
          <h4>Student Withdrawal</h4>
          <p>Cancel all scheduled interviews for a student.</p>
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
            <option value="">Select Student</option>
            {students.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
          </select>
          <button onClick={handleStudentWithdraw} disabled={loading}>Withdraw Student</button>
        </div>

        {/* COMPANY DELAY */}
        <div className="disruption-card">
          <h4>Company Delay</h4>
          <p>Move affected interviews when a company arrives late.</p>
          <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
            <option value="">Select Company</option>
            {companies.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
          </select>
          <input type="number" min="1" value={delayHours} onChange={(e) => setDelayHours(e.target.value)} />
          <button onClick={handleCompanyDelay} disabled={loading}>Replan Company Delay</button>
        </div>

        {/* ROOM UNAVAILABLE */}
        <div className="disruption-card">
          <h4>Room Unavailable</h4>
          <p>Reassign interviews to another available room.</p>
          <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
            <option value="">Select Room</option>
            {rooms.map(r => <option key={r._id || r.id} value={r._id || r.id}>{r.name || r.roomNumber}</option>)}
          </select>
          <button onClick={handleRoomUnavailable} disabled={loading}>Make Room Unavailable</button>
        </div>

        {/* PANEL DROP OUT */}
        <div className="disruption-card">
          <h4>Panel Drop-out</h4>
          <p>Move interviews to another available panel.</p>
          <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
            <option value="">Select Company</option>
            {companies.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
          </select>
          <input type="number" min="1" value={panelNumber} onChange={(e) => setPanelNumber(e.target.value)} />
          <button onClick={handlePanelDrop} disabled={loading}>Drop Panel</button>
        </div>
      </div>

      {result && (
        <div className="result-alert">
          <h5>Replanning Complete</h5>
          <p>Affected: {result.affectedInterviewsCount || 0} interviews.</p>
        </div>
      )}
    </div>
  );
}

export default DisruptionPanel;
