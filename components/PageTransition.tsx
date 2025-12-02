"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="
      fixed inset-0 bg-black/60 backdrop-blur-sm 
      z-[9998] flex items-center justify-center 
      animate-fadeIn
     "
    >
      <div className="w-8 h-8 border-4 border-white/30 border-t-pink-300 rounded-full animate-spin"></div>
    </div>
  );
}