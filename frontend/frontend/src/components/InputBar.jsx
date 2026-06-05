import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Movies similar to Inception",
  "Best Christopher Nolan films",
  "Top rated sci-fi movies",
  "Films with Leonardo DiCaprio",
];

export default function InputBar({ onSend, isLoading }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestion = (text) => {
    setValue(text);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ padding: "16px 20px 24px", position: "relative" }}>
      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && !value && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: "absolute",
              bottom: "100%",
              left: "20px",
              right: "20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "10px",
              marginBottom: "8px",
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              zIndex: 10,
            }}
          >
            <p
              style={{
                width: "100%",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
                letterSpacing: "0.1em",
                marginBottom: "4px",
                paddingLeft: "4px",
              }}
            >
              SUGGESTIONS
            </p>
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSuggestion(s)}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "5px 12px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-main)",
                  cursor: "none",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <motion.div
        animate={{
          borderColor: focused ? "var(--accent)" : "var(--border)",
          boxShadow: focused ? "0 0 0 3px var(--accent-glow)" : "none",
        }}
        transition={{ duration: 0.2 }}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
        }}
      >
        {/* Sparkles button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSuggestions((p) => !p)}
          style={{
            background: showSuggestions
              ? "rgba(108,99,255,0.15)"
              : "transparent",
            border: "none",
            borderRadius: "8px",
            padding: "6px",
            cursor: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          <Sparkles
            size={16}
            color={showSuggestions ? "var(--accent)" : "var(--text-secondary)"}
          />
        </motion.button>

        {/* Text input */}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask anything about movies..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-main)",
            caretColor: "var(--accent)",
          }}
        />

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          animate={{
            background:
              value.trim() && !isLoading
                ? "linear-gradient(135deg, var(--accent), #8b5cf6)"
                : "var(--bg-secondary)",
          }}
          style={{
            border: "none",
            borderRadius: "10px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: value.trim() && !isLoading ? "none" : "not-allowed",
            flexShrink: 0,
            transition: "opacity 0.2s",
            opacity: !value.trim() || isLoading ? 0.4 : 1,
          }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Send size={15} color="#fff" />
            </motion.div>
          ) : (
            <Send size={15} color="#fff" />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}