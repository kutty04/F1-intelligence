import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X, Play, Zap, Cpu, Map, Thermometer } from "lucide-react";

const STEPS = [
  {
    title: "Welcome to Season 2",
    description: "Your F1 Intelligence Dashboard has been upgraded to a professional mission control. Let's walk through the new systems.",
    icon: <Zap size={40} color="#e10600" />,
    image: "/assets/f1_night_lights_1778315959809.png"
  },
  {
    title: "Retractable Navigation",
    description: "Click the menu icon in the top left to slide out the sidebar. Access Standings, Drivers, and Race Data without cluttering your view.",
    icon: <Map size={40} color="#3671c6" />,
    image: "/assets/f1_tech_map_1778315982442.png"
  },
  {
    title: "The AI Strategist",
    description: "Need a race engineer? Click the 'Strategist' button. Our Groq-powered AI provides real-time strategy advice and technical data.",
    icon: <Cpu size={40} color="#a855f7" />,
    image: "/assets/f1_ai_strategist_1778316201631.png"
  },
  {
    title: "Live Telemetry",
    description: "The header now features real-time weather sensors. Track temperature, humidity, and air conditions are pulled live from the circuit.",
    icon: <Thermometer size={40} color="#22c55e" />,
    image: "/assets/f1_weather_radar_1778316253786.png"
  }
];

export function WelcomeTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("f1_tour_completed");
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem("f1_tour_completed", "true");
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      <div style={styles.overlay}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={styles.modal}
        >
          <button onClick={completeTour} style={styles.closeBtn}><X size={20} /></button>
          
          <div style={styles.content}>
            <div style={styles.imageContainer}>
              <img src={step.image} alt="Tour" style={styles.image} />
              <div style={styles.iconOverlay}>{step.icon}</div>
            </div>

            <div style={styles.textContainer}>
              <div style={styles.progress}>Step {currentStep + 1} of {STEPS.length}</div>
              <h2 style={styles.title}>{step.title}</h2>
              <p style={styles.description}>{step.description}</p>
              
              <div style={styles.footer}>
                <button 
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  style={{ ...styles.navBtn, opacity: currentStep === 0 ? 0.3 : 1 }}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <button onClick={handleNext} style={styles.primaryBtn}>
                  {currentStep === STEPS.length - 1 ? "Start Engineering" : "Next System"}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(8px)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  modal: {
    backgroundColor: "#0d0d1a",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "24px",
    overflow: "hidden",
    position: "relative",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "none",
    border: "none",
    color: "#888",
    cursor: "pointer",
    zIndex: 10
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "450px"
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#000"
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.6
  },
  iconOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))"
  },
  textContainer: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  progress: {
    color: "#e10600",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "10px"
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "16px",
    lineHeight: 1.2
  },
  description: {
    fontSize: "16px",
    color: "#aaa",
    lineHeight: 1.6,
    marginBottom: "32px"
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto"
  },
  navBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "none",
    color: "#fff",
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  primaryBtn: {
    backgroundColor: "#e10600",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "transform 0.2s"
  }
};
