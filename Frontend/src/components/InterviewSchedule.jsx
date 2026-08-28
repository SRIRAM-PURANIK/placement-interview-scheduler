import { useEffect, useState } from "react";

function InterviewSchedule() {
  const [interviews, setInterviews] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoading(true);

      let url = `http://localhost:5000/api/interviews?status=${status}`;

      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      setInterviews(result.data || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInterviews();
  };

  const getStatusClass = (interviewStatus) => {
    if (interviewStatus === "scheduled") {
      return "status scheduled";
    }

    if (interviewStatus === "cancelled") {
      return "status cancelled";
    }

    return "status unscheduled";
  };

  return (
    <div className="interview-page">
      <div className="schedule-header">
        <div>
          <h1>Interview Schedule</h1>

          <p>
            View scheduled, unscheduled and cancelled interviews
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchInterviews}
        >
          Refresh
        </button>
      </div>

      {/* FILTER BUTTONS */}

      <div className="filter-section">
        <button
          className={
            status === "all"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setStatus("all")}
        >
          All
        </button>

        <button
          className={
            status === "scheduled"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setStatus("scheduled")}
        >
          Scheduled
        </button>

        <button
          className={
            status === "unscheduled"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setStatus("unscheduled")}
        >
          Unscheduled
        </button>

        <button
          className={
            status === "cancelled"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setStatus("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {/* SEARCH */}

      <form
        className="search-section"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="Search by student or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">
          Search
        </button>
      </form>

      {/* RECORD COUNT */}

      <div className="record-info">
        <span>
          {loading
            ? "Loading..."
            : `${interviews.length} Records`}
        </span>
      </div>

      {/* TABLE */}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Room</th>
              <th>Panel</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="empty-message">
                  Loading interviews...
                </td>
              </tr>
            ) : interviews.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-message">
                  No interviews found
                </td>
              </tr>
            ) : (
              interviews.map((interview) => (
                <tr key={interview._id}>
                  <td>
                    {interview.student?.name || "-"}
                  </td>

                  <td>
                    {interview.company?.name || "-"}
                  </td>

                  <td>
                    {interview.room?.name || "-"}
                  </td>

                  <td>
                    {interview.panelNumber || "-"}
                  </td>

                  <td>
                    {interview.startTime
                      ? new Date(
                          interview.startTime
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {interview.endTime
                      ? new Date(
                          interview.endTime
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={getStatusClass(
                        interview.status
                      )}
                    >
                      {interview.status}
                    </span>
                  </td>

                  <td>
                    {interview.unscheduledReason || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InterviewSchedule;