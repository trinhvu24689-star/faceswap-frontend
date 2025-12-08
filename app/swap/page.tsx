"use client";

import { useState } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";

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
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slider, setSlider] = useState(50);

  const handleSwap = async () => {
    if (!sourceFile || !targetFile) {
      alert("Vui lòng chọn đủ 2 ảnh");
      return;
    }

    setLoading(true);
    setResultImg(null);
    setSlider(50);

    try {
      const form = new FormData();
      form.append("source_image", sourceFile);
      form.append("target_image", targetFile);

      const res = await fetch(
        "https://faceswap-backend-clean.fly.dev/faceswap/full",
        { method: "POST", body: form }
      );

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultImg(url);
    } catch {
      alert("Lỗi hoán đổi khuôn mặt!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center bg-[#0b0b0b] min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black via-[#0f0f0f] to-black" />

      <main className="w-full max-w-[430px] px-3 py-4">
        <header className="rounded-2xl bg-[#111] border border-[#2b2b2b] px-3 py-2 flex items-center justify-between">
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
          <HamburgerMenu />
        </header>

        {/* KHUNG PREVIEW */}
        <div className="mt-4 rounded-[28px] bg-[#0e0e0e] border border-[#2a2a2a] p-4">
          <div className="relative grid grid-cols-2 gap-4 rounded-[22px] bg-[#0b0b0b] p-4 border border-[#1f1f1f] pointer-events-none">

            <div className="pointer-events-auto h-[180px] rounded-[18px] bg-black flex items-center justify-center border border-[#1f1f1f] overflow-hidden">
              {sourcePreview ? <img src={sourcePreview} className="w-full h-full object-cover" /> : <span className="text-[#9ca3af] text-sm">Ảnh gốc của bạn</span>}
            </div>

            <div className="pointer-events-auto h-[180px] rounded-[18px] bg-black flex items-center justify-center border border-[#1f1f1f] overflow-hidden">
              {targetPreview ? <img src={targetPreview} className="w-full h-full object-cover" /> : <span className="text-[#9ca3af] text-sm">Ảnh muốn thay mặt</span>}
            </div>

            {resultImg && (
              <div className="absolute inset-0 z-10 rounded-[18px] overflow-hidden">
                <img src={resultImg} className="absolute inset-0 w-full h-full object-contain" />
                <div style={{ width: slider + "%" }} className="absolute inset-0 overflow-hidden">
                  <img src={targetPreview!} className="w-full h-full object-contain" />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={slider}
                  onChange={(e) => setSlider(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />
                <div className="absolute top-0 bottom-0 w-[2px] bg-lime-400" style={{ left: slider + "%" }} />
              </div>
            )}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative w-[55px] h-[55px] rounded-full border-[3px] border-lime-400 flex items-center justify-center text-lime-400">
                ❄️
                {loading && <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-black animate-spin"></div>}
              </div>
            </div>

          </div>
        </div>

        {/* STEP 1 */}
        <label className="relative z-20 block bg-lime-400 text-black font-semibold rounded-full py-2 mt-4 text-center cursor-pointer">
          Tải lên hình ảnh ↑
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setSourceFile(file);
              setSourcePreview(URL.createObjectURL(file));
            }}
          />
        </label>

        {/* STEP 2 */}
        <label className="relative z-20 block bg-lime-400 text-black font-semibold rounded-full py-2 mt-2 text-center cursor-pointer">
          Tải lên hình ảnh ↑
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setTargetFile(file);
              setTargetPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        <button
          onClick={handleSwap}
          disabled={loading}
          className="w-full bg-lime-400 text-black font-bold py-3 rounded-full mt-4 disabled:opacity-50"
        >
          {loading ? "Đang hoán đổi..." : "Hoán đổi khuôn mặt →"}
        </button>

        <footer className="mt-5 text-[10px] text-center text-slate-400">
          ZenitSwap © 2025  
          Zalo: 085.684.8557 / Email: huuxhoang@gmail.com
        </footer>
      </main>
    </div>
  );
}