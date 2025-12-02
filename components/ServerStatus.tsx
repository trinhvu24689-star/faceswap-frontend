"use client";

import { useEffect, useState } from "react";

export default function ServerStatus() {
  const [status, setStatus] = useState<"up" | "waking" | "down">("down");

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/system/status", { cache: "no-store" });
      const data = await res.json();

      if (data.waking_up) setStatus("waking");
      else setStatus("up");
    } catch {
      setStatus("down");
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000); // cập nhật mỗi 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="
      fixed bottom-3 left-1/2 -translate-x-1/2 
      px-4 py-2 text-sm font-medium rounded-full shadow-md 
      bg-white/10 backdrop-blur-md border border-white/20
      z-[9999]
    "
    >
      {status === "up" && (
        <span className="text-green-300">🟢 Server đang hoạt động</span>
      )}

      {status === "waking" && (
        <span className="text-yellow-300">🟡 Server đang khởi động...</span>
      )}

      {status === "down" && (
        <span className="text-red-300">🔴 Server đang bận / server bảo trì offline</span>
      )}
    </div>
  );
}