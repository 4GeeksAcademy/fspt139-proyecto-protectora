import React from "react";

//barra de progreso en segmentos, usada en las vistas previas y tarjetas de protectora
export const ProgressBar = ({ percent = 0, segments = 5 }) => (
  <div className="d-flex gap-1">
    {Array.from({ length: segments }).map((_, idx) => {
      const segmentFill = Math.max(0, Math.min(1, percent / 100 - idx / segments) * segments);
      return (
        <div
          key={idx}
          className="flex-fill rounded-pill overflow-hidden"
          style={{ height: "5px", backgroundColor: "var(--rp-linea)" }}
        >
          <div
            style={{
              width: `${segmentFill * 100}%`,
              height: "100%",
              backgroundColor: "var(--rp-verde)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      );
    })}
  </div>
);
