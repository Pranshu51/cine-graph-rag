import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader, Search, Brain, Database } from "lucide-react";

const STEPS = [
  {
    key: "entity_resolution",
    label: "Entity Resolution",
    desc: "Extracting & resolving entities in Neo4j",
    icon: Search,
  },
  {
    key: "classification",
    label: "Classification",
    desc: "Graph query or similarity search?",
    icon: Brain,
  },
  {
    key: "query_execution",
    label: "Query Execution",
    desc: "Fetching results from Neo4j / Pinecone",
    icon: Database,
  },
];

function StepIcon({ status, Icon }) {
  if (status === "done") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(67, 233, 123, 0.15)",
          border: "1px solid var(--success)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Check size={13} color="var(--success)" />
      </motion.div>
    );
  }

  if (status === "running") {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(108, 99, 255, 0.15)",
          border: "1px solid var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Loader size={13} color="var(--accent)" />
      </motion.div>
    );
  }

  return (
    <div
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={13} color="var(--text-secondary)" />
    </div>
  );
}

export default function PipelineSteps({ steps, isLoading }) {
  if (!isLoading && (!steps || steps.length === 0)) return null;

  // Build a status map from completed steps
  const statusMap = {};
  if (steps) {
    steps.forEach((s) => {
      statusMap[s.step] = s.status;
    });
  }

  // While loading, determine which step is currently running
  const getStatus = (key, index) => {
    if (statusMap[key]) return statusMap[key];
    if (!isLoading) return "pending";

    // Simulate progressive step reveal
    const doneCount = Object.values(statusMap).filter(
      (s) => s === "done"
    ).length;
    if (index === doneCount) return "running";
    if (index < doneCount) return "done";
    return "pending";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "12px 14px",
        marginTop: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontFamily: "var(--font-mono)",
          color: "var(--text-secondary)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "2px",
        }}
      >
        Pipeline
      </p>

      {STEPS.map((step, index) => {
        const status = getStatus(step.key, index);
        const Icon = step.icon;

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: status === "pending" ? 0.35 : 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <StepIcon status={status} Icon={Icon} />

            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color:
                    status === "done"
                      ? "var(--success)"
                      : status === "running"
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  fontFamily: "var(--font-main)",
                  transition: "color 0.3s ease",
                }}
              >
                {step.label}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  marginTop: "1px",
                }}
              >
                {step.desc}
              </p>
            </div>

            {status === "running" && (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                }}
              >
                processing...
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}