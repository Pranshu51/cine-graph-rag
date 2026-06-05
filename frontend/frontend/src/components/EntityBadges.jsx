import { motion } from "framer-motion";

const ENTITY_COLORS = {
  Actor: { bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", text: "#93c5fd" },
  Director: { bg: "rgba(139, 92, 246, 0.15)", border: "#8b5cf6", text: "#c4b5fd" },
  Genre: { bg: "rgba(34, 197, 94, 0.15)", border: "#22c55e", text: "#86efac" },
  Theme: { bg: "rgba(249, 115, 22, 0.15)", border: "#f97316", text: "#fdba74" },
  Award: { bg: "rgba(234, 179, 8, 0.15)", border: "#eab308", text: "#fde047" },
  Movie: { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", text: "#fca5a5" },
};

const ENTITY_ICONS = {
  Actor: "🎭",
  Director: "🎬",
  Genre: "🎞️",
  Theme: "💡",
  Award: "🏆",
  Movie: "🎥",
};

export default function EntityBadges({ entities }) {
  if (!entities || entities.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginTop: "10px",
      }}
    >
      {entities.map((entity, i) => {
        const colors = ENTITY_COLORS[entity.label] || {
          bg: "rgba(108,99,255,0.15)",
          border: "#6c63ff",
          text: "#a78bfa",
        };
        const icon = ENTITY_ICONS[entity.label] || "•";

        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              borderRadius: "20px",
              padding: "3px 10px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              fontWeight: "500",
              letterSpacing: "0.03em",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{icon}</span>
            <span style={{ opacity: 0.6, fontSize: "9px" }}>
              {entity.label.toUpperCase()}
            </span>
            <span>·</span>
            <span>{entity.nodeName}</span>
          </motion.span>
        );
      })}
    </div>
  );
}