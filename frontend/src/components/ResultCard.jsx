import InfoIcon from "./InfoIcon";

const ResultCard = ({
  title,
  icon,
  children,
  accentColor,
  info,
  className = "",
  style = {}
}) => {
  const accent = accentColor || "rgba(168,85,247,0.4)";

  return (
    <div
      className={`result-card corner-bracket ${className}`}
      style={{
        "--card-accent": accent,
        minHeight: 245,
        overflow: "visible",
        ...style
      }}
    >
      <div className="card-header">
        <div
          className="card-icon"
          style={{ borderColor: `${accentColor || "rgba(168,85,247,0.25)"}` }}
        >
          {icon}
        </div>

        <span
          className="card-title"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0,
            fontSize: "0.82rem"
          }}
        >
          {title}
          <InfoIcon text={info} />
        </span>
      </div>

      <div
        style={{
          fontSize: "0.86rem",
          color: "var(--text-secondary)",
          lineHeight: 1.8
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const StatRow = ({ label, value, status, info }) => {
  const getStatusColor = (s) => {
    if (!s) return "var(--text-secondary)";
    if (s === "good") return "#34d399";
    if (s === "bad") return "#f87171";
    if (s === "warn") return "#fbbf24";
    return "var(--text-secondary)";
  };

  return (
    <div className="stat-row">
      <span
        className="stat-label"
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: "0.82rem"
        }}
      >
        {label}
        <InfoIcon text={info} />
      </span>

      <span
        className="stat-value"
        style={{
          color: getStatusColor(status),
          fontSize: "0.86rem"
        }}
      >
        {value}
      </span>
    </div>
  );
};

export const StatusBadge = ({ label, ok }) => (
  <span className={`badge ${ok ? "badge-success" : "badge-danger"}`}>
    <span style={{ fontSize: "0.5rem" }}>{ok ? "▲" : "▼"}</span>
    {label}
  </span>
);

export default ResultCard;
