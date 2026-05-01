"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
};

export default function QuantitySelector({ value, onChange, compact = false }: Props) {
  const buttonSize = compact ? 28 : 34;
  const fontSize = compact ? 12 : 14;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? "8px" : "10px",
        padding: compact ? "6px 10px" : "8px 12px",
        borderRadius: "999px",
        border: "1.5px solid #f0d3eb",
        background: "#fff7fb",
        width: compact ? "fit-content" : "100%",
      }}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        style={{
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #ffe1ef, #f3e5ff)",
          color: "#c44dff",
          fontSize: compact ? "18px" : "20px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        -
      </button>
      <div
        style={{
          minWidth: compact ? "20px" : "24px",
          textAlign: "center",
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          color: "#333",
        }}
      >
        {value}
      </div>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        style={{
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
          color: "#fff",
          fontSize: compact ? "18px" : "20px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          boxShadow: "0 4px 10px rgba(196,77,255,0.22)",
        }}
      >
        +
      </button>
    </div>
  );
}
