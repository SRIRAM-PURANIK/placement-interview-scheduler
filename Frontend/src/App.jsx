import { useEffect, useState } from "react";
import axios from "axios";

import MetricsCards from "./components/MetricsCards";
import ScheduleTable from "./components/ScheduleTable";
import DisruptionPanel from "./components/DisruptionPanel";


const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

function App() {
  const [metrics, setMetrics] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API}/metrics`);
      setMetrics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    }
  };

  const fetchInterviews = async (
    selectedStatus = status,
    searchText = search
  ) => {
    try {
      let url = `${API}/interviews?status=${selectedStatus}`;

      if (searchText.trim()) {
        url += `&search=${encodeURIComponent(searchText)}`;
      }

      const response = await axios.get(url);

      setInterviews(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch interviews", error);
      setInterviews([]);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);

    await Promise.all([
      fetchMetrics(),
      fetchInterviews(status, search),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setLoading(true);

    await fetchInterviews(newStatus, search);

    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setLoading(true);

    await fetchInterviews(status, search);

    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Placement Interview Scheduler</h1>

          <p>
            Intelligent interview scheduling and disruption replanning system
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={refreshDashboard}
        >
          Refresh Dashboard
        </button>
      </header>

      <main>
        <section>
          <h2>Schedule Overview</h2>

          {loading && !metrics ? (
            <p>Loading dashboard...</p>
          ) : (
            <MetricsCards metrics={metrics} />
          )}
        </section>

        <section className="dashboard-section">
          <DisruptionPanel
            refreshDashboard={refreshDashboard}
          />
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Interview Schedule</h2>

              <p>
                View scheduled, unscheduled and cancelled interviews
              </p>
            </div>

            <span className="count-badge">
              {interviews.length} Records
            </span>
          </div>

          {/* FILTER BUTTONS */}

          <div className="schedule-filters">
            <button
              className={
                status === "all"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => handleStatusChange("all")}
            >
              All
            </button>

            <button
              className={
                status === "scheduled"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => handleStatusChange("scheduled")}
            >
              Scheduled
            </button>

            <button
              className={
                status === "unscheduled"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => handleStatusChange("unscheduled")}
            >
              Unscheduled
            </button>

            <button
              className={
                status === "cancelled"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => handleStatusChange("cancelled")}
            >
              Cancelled
            </button>
          </div>

          {/* SEARCH */}

          <form
            className="schedule-search"
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

          {loading ? (
            <p>Loading interviews...</p>
          ) : (
            <ScheduleTable interviews={interviews} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
