/**
 * src/components/ui/VoiceNavigator.jsx
 * ------------------------------------
 * Hands-free navigation using Web Speech API.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff } from "lucide-react";

export function VoiceNavigator() {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const navigate = useNavigate();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) return null; // Browser not supported

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    setLastCommand(command);
    
    if (command.includes("dashboard") || command.includes("home")) navigate("/");
    if (command.includes("drivers") || command.includes("profiles")) navigate("/drivers");
    if (command.includes("lap") || command.includes("timing")) navigate("/lap-data");
    if (command.includes("prediction")) navigate("/predictions");
    if (command.includes("vs") || command.includes("comparison")) navigate("/comparison");
    if (command.includes("predictor")) navigate("/predictor");
    if (command.includes("pit")) navigate("/pit-wall");
    
    setIsListening(false);
  };

  recognition.onerror = () => setIsListening(false);
  recognition.onend = () => setIsListening(false);

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div style={styles.container}>
      {isListening && <div style={styles.pulse} />}
      <button 
        onClick={toggleListening} 
        style={{ ...styles.button, color: isListening ? "#e10600" : "#555" }}
        title="Voice Control"
      >
        {isListening ? <Mic size={18} /> : <MicOff size={18} />}
      </button>
      {isListening && <div style={styles.hint}>Listening for "Go to..."</div>}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  button: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    transition: "all 0.2s",
  },
  pulse: {
    position: "absolute",
    inset: -4,
    borderRadius: "50%",
    border: "2px solid #e10600",
    animation: "voice-pulse 1.5s infinite",
  },
  hint: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "10px",
    whiteSpace: "nowrap",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  }
};
