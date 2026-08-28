function ScheduleTable({ interviews }) {
  if (!interviews || interviews.length === 0) {
    return (
      <div className="empty-state">
        No interview records found.
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  return (
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
          {interviews.map((interview) => (
            <tr key={interview._id}>
              <td>
                {interview.student?.name || "Unknown"}
              </td>

              <td>
                {interview.company?.name || "Unknown"}
              </td>

              <td>
                {interview.room?.name || "-"}
              </td>

              <td>
                {interview.panelNumber || "-"}
              </td>

              <td>
                {formatDate(interview.startTime)}
              </td>

              <td>
                {formatDate(interview.endTime)}
              </td>

              <td>
                <span
                  className={`status ${interview.status}`}
                >
                  {interview.status}
                </span>
              </td>

              <td>
                {interview.unscheduledReason || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleTable;