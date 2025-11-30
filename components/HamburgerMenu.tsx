"use client";

import { useState } from "react";
import Link from "next/link";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* BUTTON 3 GẠCH */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-xl"
      >
        ☰
      </button>

      {/* MENU OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MENU PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#111] text-white z-50 shadow-2xl transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="px-4 py-4 text-lg font-semibold border-b border-white/10">
          Menu
        </div>

        {/* WRAPPER CUỘN */}
        <div className="overflow-y-auto h-[calc(100vh-110px)] px-3 py-4">

          {/* MENU ITEMS */}
          <div className="flex flex-col gap-2 text-sm">

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg"
            >
              🏠 Trang chính
            </button>

            <button
              onClick={() => (window.location.href = "/swap")}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg"
            >
              🔄 Swap ảnh/video
            </button>

            <button
              onClick={() => (window.location.href = "/history")}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg"
            >
              🖼️ Lịch sử
            </button>

            {/* SHOP */}
            <button
              onClick={() => (window.location.href = "/shop")}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg"
            >
              🛍️ Shop Bông Tuyết
            </button>

          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t border-white/10 text-xs text-white/60">
          ZenitSwap © 2025
        </div>
      </div>
    </div>
  );
}