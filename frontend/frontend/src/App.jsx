import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import ThemeToggle from "./components/ThemeToggle";
import { sendQuery } from "./services/api";

// Custom cursor component
function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const dot = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", move);

    let raf;
    const animate = () => {
      dot.current.x += (pos.current.x - dot.current.x) * 0.12;
      dot.current.y += (pos.current.y - dot.current.y) * 0.12;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dot.current.x - 18}px, ${dot.current.y - 18}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Small sharp dot */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          background: "var(--accent)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
        }}
      />
      {/* Larger trailing ring */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "36px",
          height: "36px",
          border: "1.5px solid var(--accent)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: 0.5,
          willChange: "transform",
        }}
      />
    </>
  );
}

// Welcome screen shown before first message
function WelcomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        gap: "20px",
      }}
    >
      {/* Logo */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 20px rgba(108,99,255,0.3)",
            "0 0 40px rgba(108,99,255,0.6)",
            "0 0 20px rgba(108,99,255,0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, var(--accent), #8b5cf6, var(--accent-2))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
        }}
      >
        🎬
      </motion.div>

      <div style={{ textAlign: "center" }}>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: "28px",
            fontWeight: "800",
            fontFamily: "var(--font-main)",
            background: "linear-gradient(135deg, var(--text-primary), var(--accent))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px",
          }}
        >
          CineGraph AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
          }}
        >
          Neo4j · Pinecone · GraphRAG
        </motion.p>
      </div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "360px",
        }}
      >
        {[
          "🔗 Graph Traversal",
          "🧠 Semantic Search",
          "🏆 Award Insights",
          "🎭 Actor Networks",
        ].map((pill, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "5px 12px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
            }}
          >
            {pill}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

let msgId = 0;

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
  }, [isDark]);

  const handleSend = async (text) => {
    // Add user message
    const userMsg = { id: ++msgId, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLoadingSteps([]);

    try {
      const data = await sendQuery(text);

      // Simulate progressive pipeline steps reveal
      const steps = data.steps || [];
      for (let i = 0; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setLoadingSteps((prev) => [...prev, steps[i]]);
      }

      await new Promise((r) => setTimeout(r, 300));

      const botMsg = {
        id: ++msgId,
        role: "bot",
        text: data.answer || "Sorry, I couldn't find an answer.",
        entities: data.entities || [],
        steps: data.steps || [],
        queryType: data.queryType || null,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        id: ++msgId,
        role: "bot",
        text: "⚠️ Something went wrong. Please check if your backend is running.",
        entities: [],
        steps: [],
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setLoadingSteps([]);
    }
  };

  return (
    <>
      <CustomCursor />

      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          padding: "20px",
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "30%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "fixed",
            bottom: "20%",
            right: "25%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(255,101,132,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Main chat card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "720px",
            height: "calc(100vh - 40px)",
            maxHeight: "860px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-card)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                🎬
              </div>
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    fontFamily: "var(--font-main)",
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  CineGraph AI
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--success)",
                    letterSpacing: "0.05em",
                  }}
                >
                  ● ONLINE
                </p>
              </div>
            </div>

            <ThemeToggle isDark={isDark} onToggle={() => setIsDark((p) => !p)} />
          </div>

          {/* Chat area */}
          <AnimatePresence mode="wait">
            {messages.length === 0 && !isLoading ? (
              <WelcomeScreen key="welcome" />
            ) : (
              <ChatWindow
                key="chat"
                messages={messages}
                isLoading={isLoading}
                loadingSteps={loadingSteps}
              />
            )}
          </AnimatePresence>

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              flexShrink: 0,
              background: "var(--bg-card)",
            }}
          >
            <InputBar onSend={handleSend} isLoading={isLoading} />
          </div>
        </motion.div>
      </div>
    </>
  );
}