import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "50px",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "none",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-main)",
        fontSize: "13px",
        fontWeight: "600",
        letterSpacing: "0.05em",
        transition: "border-color 0.2s ease, color 0.2s ease",
      }}
    >
      <motion.div
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Moon size={14} color="var(--accent)" />
        ) : (
          <Sun size={14} color="var(--warning)" />
        )}
      </motion.div>
      {isDark ? "DARK" : "LIGHT"}
    </motion.button>
  );
}