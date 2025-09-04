import { motion } from "framer-motion";

interface Props {
  code: number | null;
}

const WeatherBackground: React.FC<Props> = ({ code }) => {
  let bgColors = ["#60a5fa", "#2563eb"]; // default blue
  let animation = {};

  if (code === 0) {
    // ☀️ Sunny
    bgColors = ["#facc15", "#f97316", "#ef4444"];
    animation = { x: [0, 30, -30, 0], y: [0, 20, -20, 0] };
  } else if ([1, 2, 3].includes(code ?? -1)) {
    // ⛅ Cloudy
    bgColors = ["#9ca3af", "#6b7280", "#374151"];
    animation = { x: [0, 40, -40, 0], opacity: [1, 0.8, 1] };
  } else if ([61, 63, 65, 80, 81, 82].includes(code ?? -1)) {
    // 🌧 Rainy
    bgColors = ["#3b82f6", "#1e40af", "#1e3a8a"];
    animation = { y: [0, 50, -50, 0] };
  } else if ([71, 73, 75, 85, 86].includes(code ?? -1)) {
    // ❄️ Snowy
    bgColors = ["#e0f2fe", "#ffffff", "#bae6fd"];
    animation = { y: [0, 20, -20, 0], opacity: [1, 0.9, 1] };
  } else if ([95, 96, 99].includes(code ?? -1)) {
    // ⛈ Storm
    bgColors = ["#7e22ce", "#1e1b4b", "#111827"];
    animation = { rotate: [0, 5, -5, 0] };
  }

  return (
    <motion.div
      className="fixed inset-0 -z-10"
      animate={animation}
      transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      style={{
        background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1]}, ${bgColors[2]})`,
        backgroundSize: "400% 400%",
      }}
    />
  );
};

export default WeatherBackground;
