import { createPortal } from "react-dom";
import { useState } from "react";

const InfoIcon = ({ text }) => {
  const [tooltip, setTooltip] = useState(null);

  if (!text) return null;

  const showTooltip = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 310;
    const gap = 12;

    let left = rect.right + gap;
    let top = rect.top - 10;

    if (left + width > window.innerWidth - 16) {
      left = rect.left - width - gap;
    }

    if (left < 16) left = 16;
    if (top < 16) top = 16;

    setTooltip({ left, top, width });
  };

  return (
    <>
      <span
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltip(null)}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "1px solid rgba(192,132,252,0.55)",
          color: "#c084fc",
          background: "rgba(168,85,247,0.10)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
          fontWeight: 800,
          lineHeight: 1,
          cursor: "help",
          boxShadow: "0 0 6px rgba(168,85,247,0.20)",
          flexShrink: 0,
          marginLeft: 7,
          position: "relative",
          zIndex: 5
        }}
      >
        i
      </span>

      {tooltip &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltip.left,
              top: tooltip.top,
              width: tooltip.width,
              zIndex: 999999,
              padding: "11px 13px",
              borderRadius: 9,
              border: "1px solid rgba(168,85,247,0.45)",
              background: "rgba(8,3,20,0.98)",
              color: "#e9d5ff",
              fontSize: "0.76rem",
              fontFamily: "Rajdhani, sans-serif",
              lineHeight: 1.5,
              letterSpacing: "0.03em",
              boxShadow: "0 12px 35px rgba(0,0,0,0.60), 0 0 18px rgba(168,85,247,0.22)",
              pointerEvents: "none",
              backdropFilter: "blur(10px)"
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

export default InfoIcon;
