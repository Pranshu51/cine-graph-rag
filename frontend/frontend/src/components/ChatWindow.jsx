import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PipelineSteps from "./PipelineSteps";
import EntityBadges from "./EntityBadges";

function UserMessage({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
          color: "#fff",
          borderRadius: "18px 18px 4px 18px",
          padding: "12px 18px",
          maxWidth: "70%",
          fontSize: "14px",
          lineHeight: "1.6",
          fontFamily: "var(--font-main)",
          boxShadow: "0 4px 20px var(--accent-glow)",
        }}
      >
        {message.text}
      </div>
    </motion.div>
  );
}

function BotMessage({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: "20px",
      }}
    >
      <div style={{ maxWidth: "80%" }}>
        {/* Bot avatar + label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            CineGraph AI
          </span>
        </div>

        {/* Answer card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px 18px 18px 18px",
            padding: "14px 18px",
            fontSize: "14px",
            lineHeight: "1.7",
            color: "var(--text-primary)",
            fontFamily: "var(--font-main)",
          }}
        >
          {message.text}

          {/* Entity Badges */}
          {message.entities && message.entities.length > 0 && (
            <EntityBadges entities={message.entities} />
          )}

          {/* Pipeline Steps */}
          {message.steps && message.steps.length > 0 && (
            <PipelineSteps steps={message.steps} isLoading={false} />
          )}

          {/* Query type badge */}
          {message.queryType && (
            <div style={{ marginTop: "10px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-secondary)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "3px 10px",
                  letterSpacing: "0.08em",
                }}
              >
                {message.queryType === "graph" ? "⚡ Graph Query" : "🔍 Similarity Search"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LoadingMessage({ loadingSteps }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: "20px",
      }}
    >
      <div style={{ maxWidth: "80%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              letterSpacing: "0.1em",
            }}
          >
            THINKING...
          </span>
        </div>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px 18px 18px 18px",
            padding: "14px 18px",
          }}
        >
          <PipelineSteps steps={loadingSteps} isLoading={true} />
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatWindow({ messages, isLoading, loadingSteps }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) =>
          msg.role === "user" ? (
            <UserMessage key={msg.id} message={msg} />
          ) : (
            <BotMessage key={msg.id} message={msg} />
          )
        )}

        {isLoading && (
          <LoadingMessage key="loading" loadingSteps={loadingSteps} />
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}