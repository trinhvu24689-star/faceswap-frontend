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
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  const [resultImg, setResultImg] = useState<string | null>(null);


const handleSwap = async () => {
  if (!sourceFile || !targetFile) {
    alert("Thiếu ảnh");
    return;
  }

  const form = new FormData();
  form.append("source_image", sourceFile);
  form.append("target_image", targetFile);

const userId = localStorage.getItem("faceswap_user_id") || "";

const res = await fetch(
  "https://faceswap-backend-clean.fly.dev/faceswap/full",
  {
    method: "POST",
    headers: {
      "x-user-id": userId,
    },
    body: form,
  }
);


  const blob = await res.blob();
  setResultImg(URL.createObjectURL(blob));
};

  return (
    <div className="relative flex justify-center bg-[#0b0b0b] min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black via-[#0f0f0f] to-black" />

      <main className="w-full max-w-[430px] px-3 py-4">
        {/* HEADER */}
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

        {/* TAB */}
        <div className="mt-3 flex rounded-full overflow-hidden bg-[#1c1c1c] border border-[#2a2a2a] text-[13px]">
          <div className="flex-1 py-2 text-center bg-lime-400 text-black rounded-full">
            Hoán đổi khuôn mặt ảnh
          </div>
          <div className="flex-1 py-2 text-center text-slate-400">
            Hoán đổi khuôn mặt video
          </div>
        </div>

{/* KHUNG PREVIEW CHUẨN THEO ẢNH */}
<div className="mt-4 rounded-[28px] bg-[#0e0e0e] border border-[#2a2a2a] p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.85)]">
  <div className="relative grid grid-cols-2 gap-4 rounded-[22px] bg-[#0b0b0b] p-4 border border-[#1f1f1f]">
    
{/* ẢNH GỐC */}
<div className="h-[180px] rounded-[18px] bg-black flex items-center justify-center border border-[#1f1f1f] overflow-hidden">
  {sourcePreview ? (
    <img src={sourcePreview} className="w-full h-full object-cover" />
  ) : (
    <span className="text-[#9ca3af] text-sm">Ảnh gốc của bạn</span>
  )}
</div>

{/* ẢNH MUỐN THAY */}
<div className="h-[180px] rounded-[18px] bg-black flex items-center justify-center border border-[#1f1f1f] overflow-hidden">
  {targetPreview ? (
    <img src={targetPreview} className="w-full h-full object-cover" />
  ) : (
    <span className="text-[#9ca3af] text-sm">Ảnh muốn thay mặt</span>
  )}
</div>

    {/* AVATAR TRÒN GIỮA */}
<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">

{/* Vòng tròn rỗng viền mỏng */}
  <div className="w-[55px] h-[55px] rounded-full bg-transparent border-[3px] border-lime-400 flex items-center justify-center text-lime-400 text-[19px] font-medium shadow-[0_0_18px_rgba(163,255,0,0.85)]">
    ❄️
  </div>

{/* Mũi tên cong như ảnh */}
<svg width="28" height="18" viewBox="0 0 36 18" className="mt-1">
  <path
    d="M2 9C10 3, 26 3, 34 9"
    fill="none"
    stroke="#A3FF00"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M34 9 L28 4"
    stroke="#A3FF00"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M34 9 L28 14"
    stroke="#A3FF00"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

</div>
</div>
</div>

        {/* STEP 1 */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-lime-400 text-black text-xs flex items-center justify-center font-bold">
              1
            </div>
            <span className="font-semibold text-sm">
              Tải lên hình ảnh gốc có khuôn mặt
            </span>
          </div>

          <label className="block bg-lime-400 text-black font-semibold rounded-full py-2 text-center cursor-pointer">
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
          <div className="text-[11px] text-slate-400 mt-1">
            PNG / JPG / JPEG / WEBP / GIF
          </div>
        </div>

        {/* STEP 2 */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-lime-400 text-black text-xs flex items-center justify-center font-bold">
              2
            </div>
            <span className="font-semibold text-sm">
              Tải lên ảnh khuôn mặt
            </span>
          </div>

          <label className="block bg-lime-400 text-black font-semibold rounded-full py-2 text-center cursor-pointer">
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
          <div className="text-[11px] text-slate-400 mt-1">
            PNG / JPG / JPEG / WEBP
          </div>
        </div>

        {/* STEP 3 */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-lime-400 text-black text-xs flex items-center justify-center font-bold">
              3
            </div>
            <span className="font-semibold text-sm">
              Bắt đầu hoán đổi khuôn mặt
            </span>
          </div>

          <button
            onClick={handleSwap}
            className="w-full bg-lime-400 text-black font-bold py-3 rounded-full mt-1">
            Hoán đổi khuôn mặt →
          </button>

          <div className="text-[11px] text-slate-400 mt-1">
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