"use client";

import { useState, useEffect } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";

const API_URL = "https://faceswap-backend-clean.fly.dev";


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


export default function Home() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useEffect(() => {
    const init = async () => {
      let uid = localStorage.getItem("faceswap_user_id");

      try {
        if (!uid) {
          uid = `guest-${Date.now()}`;
          localStorage.setItem("faceswap_user_id", uid);
        }

        const res = await fetch(`${API_URL}/credits?user_id=${uid}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data?.credits === "number") {
            setCredits(data.credits);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setUserId(uid);
        setLoadingCredits(false);
      }
    };

    init();
  }, []);

  const handleSwap = async () => {
    if (!sourceFile || !targetFile) {
      setError("Select Full 2 Picturer 😘");
      return;
    }

    if (!userId) {
      setError("Không xác định được tài khoản, tải lại trang thử nhé 💦");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultImg(null);

      const formData = new FormData();
      formData.append("source_image", sourceFile);
      formData.append("target_image", targetFile);
      formData.append("user_id", userId);

      const res = await fetch(`${API_URL}/faceswap`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Lỗi server");
      }

      const data = await res.json();
      if (typeof data?.credits_left === "number") {
        setCredits(data.credits_left);
      }

      const imgRes = await fetch(`${API_URL}${data.result_url}`);
      const blob = await imgRes.blob();
      const url = URL.createObjectURL(blob);
      setResultImg(url);
    } catch (e: any) {
      setError(e?.message || "Có lỗi gì đó rồi :<");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center bg-[#111] min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black via-[#121212] to-[#050505]" />

      <main className="w-full max-w-[420px] px-3 py-4 text-white">
        {/* HEADER */}
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
              <span>{loadingCredits ? "..." : credits}</span>
            </div>
            <HamburgerMenu />
          </div>
        </header>

        {/* TAB */}
        <div className="mt-3 flex rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#181818] text-[12px] font-medium">
          <button className="flex-1 py-2 text-center bg-lime-400 text-black">
            Hoán đổi khuôn mặt ảnh
          </button>
          <button
            disabled
            className="flex-1 py-2 text-center bg-[#252525] text-slate-600 cursor-not-allowed"
          >
            Hoán đổi khuôn mặt video (Đang bảo trì)
          </button>
        </div>

        {/* KHUNG DEMO */}
        <div className="mt-4 rounded-3xl bg-[#181818] border border-[#2a2a2a] p-3">
          <div className="aspect-video rounded-xl bg-black flex items-center justify-center text-slate-500 text-xs">
            Demo kết quả
          </div>
        </div>

        {/* STEP 1 */}
        <div className="mt-4 text-sm">
          <span className="text-lime-400 font-bold mr-2">1</span>
          Tải lên hình ảnh gốc có khuôn mặt
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSourceFile(e.target.files?.[0] || null)}
          className="mt-2 w-full rounded-xl bg-lime-400 text-black font-semibold py-2"
        />

        {/* STEP 2 */}
        <div className="mt-4 text-sm">
          <span className="text-lime-400 font-bold mr-2">2</span>
          Tải lên ảnh khuôn mặt
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setTargetFile(e.target.files?.[0] || null)}
          className="mt-2 w-full rounded-xl bg-lime-400 text-black font-semibold py-2"
        />

        {/* STEP 3 */}
        <div className="mt-4 text-sm">
          <span className="text-lime-400 font-bold mr-2">3</span>
          Bắt đầu hoán đổi khuôn mặt
        </div>
        <button
          onClick={handleSwap}
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-lime-400 text-black font-semibold py-2"
        >
          {loading ? "Đang hoán đổi..." : "Hoán đổi khuôn mặt"}
        </button>

        {error && (
          <div className="mt-3 text-[12px] text-red-100 bg-red-500/40 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {resultImg && (
          <section className="mt-4 rounded-3xl bg-[#181818] border px-3 py-3">
            <img
              src={resultImg}
              alt="Kết quả hoán đổi"
              className="w-full object-contain rounded-xl"
            />
            <a
              href={resultImg}
              download="faceswap_result.jpg"
              className="mt-3 block text-center bg-lime-400 text-black py-2 rounded-xl font-semibold"
            >
              ⬇ Tải ảnh về máy
            </a>
          </section>
        )}

        <footer className="mt-4 text-[10px] text-center text-slate-400">
          ZenitSwap © 2025  
          Zalo: 085.684.8557 / Email: huuxhoang@gmail.com
        </footer>
      </main>
    </div>
  );