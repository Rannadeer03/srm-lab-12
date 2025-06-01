import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { GraduationCap, Book, Shield } from "lucide-react";
import useSound from "use-sound";
import { useNavigate } from 'react-router-dom';

// Using a CDN-hosted sound file instead of local file
const WHOOSH_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

// Particle Background Component
const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: { value: "transparent" } },
        particles: {
          number: { value: 80 },
          shape: { type: "circle" },
          color: { value: "#ffffff" },
          opacity: { value: 0.5 },
          size: { value: 4 },
          move: {
            enable: true,
            speed: 2,
            attract: { enable: true, rotateX: 600, rotateY: 600 },
          },
        },
        interactivity: {
          events: {
            onhover: { enable: true, mode: "repulse" },
          },
        },
      }}
    />
  );
};

// Icon Morphing Component
const IconMorph = () => {
  const [icon, setIcon] = useState("cap");

  useEffect(() => {
    const interval = setInterval(() => {
      setIcon((prev) =>
        prev === "cap" ? "book" : prev === "book" ? "shield" : "cap"
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={icon}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-block mb-8"
    >
      {icon === "cap" && <GraduationCap className="w-24 h-24 text-white holographic" />}
      {icon === "book" && <Book className="w-24 h-24 text-white holographic" />}
      {icon === "shield" && <Shield className="w-24 h-24 text-white holographic" />}
    </motion.div>
  );
};

// Typewriter Effect Component
const Typewriter = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

// Custom Cursor Component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <motion.div
      className="w-8 h-8 bg-white rounded-full fixed pointer-events-none"
      style={{ left: position.x, top: position.y }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.5 }}
    />
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin" />
);

// Progress Bar Component
const ProgressBar = ({ progress }: { progress: number }) => (
  <motion.div
    className="w-full bg-gray-200 rounded-full h-2"
    style={{ width: `${progress}%` }}
    animate={{ width: `${progress}%` }}
    transition={{ duration: 1 }}
  />
);

// SplashScreen Component
const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [themeIndex, setThemeIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [play] = useSound('/sounds/splash.mp3', { 
    volume: 0.5,
    onplay: () => {
      if (audioContext?.state === 'suspended') {
        audioContext.resume();
      }
    }
  });
  const [loadingProgress, setLoadingProgress] = useState(0);

  const themes = [
    { background: "from-indigo-500 to-purple-600" },
    { background: "from-blue-500 to-teal-600" },
    { background: "from-red-500 to-orange-600" },
  ];

  useEffect(() => {
    // Initialize audio context after user interaction
    const initAudio = () => {
      if (!audioContext) {
        const context = new AudioContext();
        setAudioContext(context);
      }
    };

    // Add click event listener to initialize audio
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    // Navigate to login after splash screen
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, [navigate, audioContext]);

  useEffect(() => {
    const interval = setInterval(() => {
      setThemeIndex((prev) => (prev + 1) % themes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 10, 100));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`fixed inset-0 bg-gradient-to-br ${themes[themeIndex].background} flex items-center justify-center`}
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 1 }}
    >
      <ParticleBackground />
      <IconMorph />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Typewriter text="Welcome to Our Amazing Platform" />
      </motion.span>
      <CustomCursor />
      <div className="absolute top-5 left-5">
        <LoadingSpinner />
        <ProgressBar progress={loadingProgress} />
      </div>
      {!showLogin ? (
        <motion.div>
          {/* Splash content */}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          {/* Login form */}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SplashScreen;