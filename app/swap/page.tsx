"use client";

import { useState } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";

// ====== CREDIT PACKS (CHỈ HIỂN THỊ) ======
const CREDIT_PACKS = [
  { id: "pack_36", label: "Gói 36❄️", credits: 36, price: "26.000đ" },
  { id: "pack_70", label: "Gói 70❄️", credits: 70, price: "52.000đ" },
  { id: "pack_150", label: "Gói 150❄️", credits: 150, price: "125.000đ" },
  { id: "pack_200", label: "Gói 200❄️", credits: 200, price: "185.000đ" },
  { id: "pack_400", label: "Gói 400❄️", credits: 400, price: "230.000đ" },
  { id: "pack_550", label: "Gói 550❄️", credits: 550, price: "375.000đ" },
  { id: "pack_750", label: "Gói 750❄️", credits: 750, price: "510.000đ" },
  { id: "pack_999", label: "Gói 999❄️", credits: 999, price: "760.000đ" },
  { id: "pack_1500", label: "Gói 1.500❄️", credits: 1500, price: "1.050.000đ" },
  { id: "pack_2600", label: "Gói 2.600❄️", credits: 2600, price: "1.500.000đ" },
  { id: "pack_4000", label: "Gói 4.000❄️", credits: 4000, price: "2.400.000đ" },
  { id: "pack_7600", label: "Gói 7.600❄️", credits: 7600, price: "3.600.000đ" },
  { id: "pack_10000", label: "Gói 10.000❄️", credits: 10000, price: "5.000.000đ" },
];

export default function SwapPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);

  return (
    <div className="relative flex justify-center bg-[#111] min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black via-[#121212] to-[#050505]" />

      <main className="w-full max-w-[420px] px-3 py-4 text-white">
        <header className="rounded-2xl bg-[#111111] border border-[#2b2b2b] px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-lime-400 flex items-center justify-center text-black font-bold text-xs">
              🐦‍🔥
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold">ZenitSwap AI</span>
              <span className="text-[10px] text-lime-300/90">
                Hoán Đổi Khuôn Mặt Bằng AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1 bg-[#222] px-2 py-1 rounded-full">
              <span className="text-yellow-300">❄️</span>
              <span>0</span>
            </div>
            <HamburgerMenu />
          </div>
        </header>

        <div className="mt-3 flex rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#181818] text-[12px] font-medium">
          <button className="flex-1 py-2 text-center bg-lime-400 text-black">
            Hoán đổi khuôn mặt ảnh
          </button>
          <button disabled className="flex-1 py-2 text-center bg-[#252525] text-slate-600">
            Hoán đổi khuôn mặt video
          </button>
        </div>

        <div className="mt-4 rounded-3xl bg-[#181818] border border-[#2a2a2a] p-3">
          <div className="aspect-video rounded-xl bg-black flex items-center justify-center text-slate-500 text-xs">
            Demo kết quả
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-lime-400 font-semibold">1 Tải lên hình ảnh gốc có khuôn mặt</div>
          <input type="file" className="mt-2 w-full rounded-xl bg-lime-400 py-2" />
        </div>

        <div className="mt-4">
          <div className="text-sm text-lime-400 font-semibold">2 Tải lên ảnh khuôn mặt</div>
          <input type="file" className="mt-2 w-full rounded-xl bg-lime-400 py-2" />
        </div>

        <div className="mt-4">
          <div className="text-sm text-lime-400 font-semibold">3 Bắt đầu hoán đổi khuôn mặt</div>
          <button className="mt-2 w-full rounded-xl bg-lime-400 text-black py-2">
            Hoán đổi khuôn mặt ›
          </button>
        </div>

        <div className="mt-4 bg-red-600 text-white text-center text-sm py-2 rounded-xl">
          Failed to fetch
        </div>

        <footer className="mt-6 text-[10px] text-center text-slate-400">
          ZenitSwap © 2025  
          Zalo: 085.684.8557 / Email: huuxhoang@gmail.com
        </footer>
      </main>
    </div>
  );
}