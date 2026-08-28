function MetricsCards({ metrics }) {
  if (!metrics) {
    return <p>No metrics available.</p>;
  }

  const cards = [
    {
      title: "Total Interviews",
      value: metrics.totalInterviews,
      type: "total",
    },
    {
      title: "Scheduled",
      value: metrics.scheduled,
      type: "scheduled",
    },
    {
      title: "Unscheduled",
      value: metrics.unscheduled,
      type: "unscheduled",
    },
    {
      title: "Cancelled",
      value: metrics.cancelled,
      type: "cancelled",
    },
    {
      title: "Success Rate",
      value: `${metrics.schedulePercentage}%`,
      type: "success",
    },
    {
      title: "Available Rooms",
      value: metrics.availableRooms,
      type: "rooms",
    },
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`metric-card ${card.type}`}
        >
          <p>{card.title}</p>

          <h3>{card.value}</h3>
        </div>
      ))}
    </div>
  );
}

export default MetricsCards;