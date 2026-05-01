"use client";

type Props = {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
};

export default function QuantitySelector({ value, onChange, min = 1, max = 99 }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #e91e8c", background: "white", color: "#e91e8c", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}
      >−</button>
      <span style={{ minWidth: "24px", textAlign: "center", fontWeight: 600 }}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #e91e8c", background: "#e91e8c", color: "white", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}
      >+</button>
    </div>
  );
}
