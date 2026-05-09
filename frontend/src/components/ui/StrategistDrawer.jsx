/**
 * src/components/ui/StrategistDrawer.jsx
 * --------------------------------------
 * A slide-in right drawer for the AI Strategist.
 */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Cpu, Sparkles, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function StrategistDrawer({ isOpen, onClose }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", content: "Greetings. I am the Strategist. I have analyzed the current race telemetry. How can I assist your team today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Using the Secure Groq API Key from .env
      const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: `You are 'The Strategist', a senior F1 Race Engineer. 
              Your goal is to provide HIGHLY READABLE, CONCISE briefings.
              
              Rules for your responses:
              1. Use BULLET POINTS for key data.
              2. Use **BOLD** for technical terms (e.g. **DRS**, **Hards**, **Apex**).
              3. Keep paragraphs under 3 lines.
              4. Always start with a 1-sentence summary.
              
              Context: Lando Norris is the 2025 World Champion.` 
            },
            ...messages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })),
            { role: "user", content: input }
          ]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const aiContent = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: "ai", content: aiContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: `TELEMETRY ERROR: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.backdrop}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={styles.drawer}
          >
            <div style={styles.header}>
              <div style={styles.aiBadge}><Cpu size={14} /> AI STRATEGIST</div>
              <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
            </div>

            <div style={styles.chatArea} ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} style={{ ...styles.messageRow, justifyContent: m.role === "ai" ? "flex-start" : "flex-end" }}>
                  <div style={{ ...styles.bubble, backgroundColor: m.role === "ai" ? "#1a1a2e" : "#e10600" }}>
                    <div className="markdown-content">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={styles.messageRow}>
                  <div style={{ ...styles.bubble, backgroundColor: "#1a1a2e", opacity: 0.6 }}>
                    <Sparkles size={14} style={{ animation: "spin 2s linear infinite" }} /> Thinking...
                  </div>
                </div>
              )}
            </div>

            <div style={styles.inputArea}>
              <input
                id="strategist-input"
                name="strategist-query"
                type="text"
                placeholder="Ask about race strategy..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                style={styles.input}
              />
              <button onClick={handleSend} style={styles.sendBtn}><Send size={18} /></button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const styles = {
  backdrop: { position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", zIndex: 1200 },
  drawer: { position: "fixed", top: 0, right: 0, bottom: 0, width: "400px", backgroundColor: "#0a0a14", borderLeft: "1px solid rgba(255, 255, 255, 0.1)", zIndex: 1201, display: "flex", flexDirection: "column", boxShadow: "-20px 0 50px rgba(0, 0, 0, 0.5)" },
  header: { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" },
  aiBadge: { display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: 800, color: "#e10600", letterSpacing: "1px" },
  closeBtn: { backgroundColor: "transparent", border: "none", color: "#555", cursor: "pointer" },
  chatArea: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" },
  messageRow: { display: "flex" },
  bubble: { maxWidth: "85%", padding: "12px 16px", borderRadius: "14px", fontSize: "14px", lineHeight: 1.5, color: "#fff" },
  inputArea: { padding: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", gap: "12px" },
  input: { flex: 1, backgroundColor: "#1a1a2e", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "12px", color: "#fff", outline: "none" },
  sendBtn: { backgroundColor: "#e10600", border: "none", borderRadius: "10px", width: "45px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }
};
