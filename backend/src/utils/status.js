export const getStatus = (value) => {
  if (!value) return "bad";
  return "good";
};

export const statusColor = (status) => {
  if (status === "good") return "text-green-400";
  if (status === "warn") return "text-yellow-400";
  return "text-red-400";
};

export const statusIcon = (status) => {
  if (status === "good") return "✅";
  if (status === "warn") return "⚠️";
  return "❌";
};