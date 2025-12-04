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
    <div className="relative flex justify-center bg-[#0b0b0b] min-h-screen">
      <main className="w-full max-w-[430px] px-4 py-4 text-white">

        {/* HEADER */}
        <header className="rounded-2xl bg-[#111] border border-[#2b2b2b] px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-lime-400 flex items-center justify-center text-black font-bold text-sm">
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

        {/* TAB */}
        <div className="mt-3 flex rounded-full overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a] text-[12px] font-medium">
          <button className="flex-1 py-2 text-center bg-lime-400 text-black rounded-full">
            Hoán đổi khuôn mặt ảnh
          </button>
          <button
            disabled
            className="flex-1 py-2 text-center bg-transparent text-slate-500"
          >
            Hoán đổi khuôn mặt video
          </button>
        </div>

        {/* PREVIEW */}
        <div className="mt-4 rounded-[22px] bg-[#121212] border border-[#2a2a2a] p-3 shadow-inner">
          <div className="aspect-video rounded-[18px] bg-black overflow-hidden flex">
            <div className="w-1/2 h-full bg-cover bg-center" />
            <div className="w-1/2 h-full bg-cover bg-center" />
          </div>
        </div>

        {/* STEP 1 */}
        <div className="mt-4 flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center text-lime-400 text-xs font-bold">1</div>
          <div className="flex-1">
            <div className="text-sm text-lime-400 font-semibold">
              Tải lên hình ảnh gốc có khuôn mặt
            </div>
            <input
              type="file"
              onChange={(e) => setSourceFile(e.target.files?.[0] || null)}
              className="mt-2 w-full rounded-full bg-lime-400 text-black py-2 text-sm font-semibold text-center"
            />
            <div className="mt-1 text-[10px] text-slate-400">
              PNG / JPG / JPEG / WEBP / GIF
            </div>
          </div>
        </div>

        {/* STEP 2 */}
        <div className="mt-4 flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center text-lime-400 text-xs font-bold">2</div>
          <div className="flex-1">
            <div className="text-sm text-lime-400 font-semibold">
              Tải lên ảnh khuôn mặt
            </div>
            <input
              type="file"
              onChange={(e) => setTargetFile(e.target.files?.[0] || null)}
              className="mt-2 w-full rounded-full bg-lime-400 text-black py-2 text-sm font-semibold text-center"
            />
            <div className="mt-1 text-[10px] text-slate-400">
              PNG / JPG / JPEG / WEBP
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center text-lime-400 text-xs font-bold">3</div>
            <div className="text-sm text-lime-400 font-semibold">
              Bắt đầu hoán đổi khuôn mặt
            </div>
          </div>
          <button className="w-full rounded-full bg-lime-400 text-black py-3 text-sm font-bold">
            Hoán đổi khuôn mặt ›
          </button>
          <div className="mt-2 text-[11px] text-slate-400 text-center">
            Hạn ngạch miễn phí hàng ngày còn lại: Hình ảnh: 10
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-5 text-[10px] text-center text-slate-400">
          ZenitSwap © 2025  
          Zalo: 085.684.8557 / Email: huuxhoang@gmail.com
        </footer>
      </main>
    </div>
  );
}