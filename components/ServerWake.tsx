"use client";
import { useEffect, useState } from "react";

export default function ServerWake() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // ❄️ SNOW ARRAY
  const snowflakes = Array.from({ length: 12 });

  useEffect(() => {
    const interval = setInterval(async () => {
      let res = await fetch("/api/system/status");
      let data = await res.json();

      setProgress(data.progress);

      if (!data.waking_up) {
        setFadeOut(true);
        setTimeout(() => setLoading(false), 450); // mờ dần
        clearInterval(interval);
      }
    }, 200);

    fetch("/api/system/wake", { method: "POST" });

    return () => clearInterval(interval);
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center
      bg-black/70 backdrop-blur-md transition-opacity duration-500
      ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >

      {/* ❄️ SNOWFALL EFFECT */}
      {snowflakes.map((_, i) => (
        <div
          key={i}
          className="snowflake absolute text-white text-2xl opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            animation: `snowfall ${3 + Math.random() * 4}s linear infinite`,
            top: `${-20 - Math.random() * 40}px`,
          }}
        >
          ❄️
        </div>
      ))}

      {/* MAIN CARD */}
      <div
        className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl
        p-6 w-[90%] max-w-[360px] shadow-2xl text-center animate-fadeIn"
      >
        {/* TEXT ⭐ */}
        <h2 className="text-white text-lg font-semibold mb-3 animate-pulse">
          🔄 Đang khởi động server, vui lòng chờ...
        </h2>

        {/* 💗1 — Loader xoay */}
        <div className="flex justify-center mb-4">
          <div className="w-9 h-9 border-4 border-white/30 border-t-pink-400 rounded-full animate-spin" />
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-pink-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 💗4 — Text dùng Bông Tuyết % giữ nguyên */}
        <p className="text-white text-sm opacity-90">
          {progress}% Bông Tuyết
        </p>
      </div>

      {/* CSS FOR SNOWFALL */}
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}