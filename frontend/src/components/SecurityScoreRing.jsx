import { useEffect, useRef } from "react";

export default function SecurityScoreRing({ score = 0, riskLevel = "N/A" }) {
  const fillRef = useRef(null);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const getColor = (s) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#f59e0b";
    if (s >= 40) return "#f97316";
    return "#ef4444";
  };

  const getRiskBadge = (level) => {
    const l = (level || "").toLowerCase();
    if (l.includes("low"))    return "badge-success";
    if (l.includes("medium")) return "badge-warn";
    if (l.includes("high"))   return "badge-danger";
    return "badge-neutral";
  };

  useEffect(() => {
    if (fillRef.current) {
      const offset = circumference - (score / 100) * circumference;
      fillRef.current.style.strokeDashoffset = offset;
    }
  }, [score, circumference]);

  const color = getColor(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "8px 0" }}>
      <div style={{ position: "relative", width: 130, height: 130 }}>
        <svg
          width="130" height="130"
          style={{ transform: "rotate(-90deg)", display: "block" }}
          viewBox="0 0 130 130"
        >
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke="rgba(168,85,247,0.1)"
            strokeWidth="8"
          />
          <circle
            ref={fillRef}
            cx="65" cy="65" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter: `drop-shadow(0 0 8px ${color}88)`,
            }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 2,
        }}>
          <span style={{
            fontSize: "2rem",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: 700,
            color,
            textShadow: `0 0 16px ${color}88`,
            lineHeight: 1,
          }}>
            {score}
          </span>
          <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.15em" }}>
            / 100
          </span>
        </div>
      </div>
      <span className={`badge ${getRiskBadge(riskLevel)}`} style={{ fontSize: "0.65rem" }}>
        RISK: {riskLevel || "N/A"}
      </span>
    </div>
  );
}
