"use client";

import { useState, useRef } from "react";

// ★ IMPORT FEEDBACK
import SwapFeedback from "@/components/SwapFeedback";

export default function SwapPage() {
  const [sourcePreview, setSourcePreview] = useState("");
  const [targetPreview, setTargetPreview] = useState("");

  // ★ FEEDBACK REF
  const feedbackRef = useRef<any>(null);

  // =============== LOGIC NHẬN FILE (KHÔNG ĐỤNG CODE CŨ) ===============
  const handleSource = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourcePreview(URL.createObjectURL(file));
  };

  const handleTarget = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTargetPreview(URL.createObjectURL(file));
  };

  // =============== NHẤN NÚT SWAP ===============
  const thựcHiệnSwapThật = async () => {
    // 👉 BÉ GẮN LOGIC SWAP CŨ VÀO ĐÂY  
    // fetch API /faceswap hoặc /faceswap/full tùy bé
    // nhớ khi API trả về thành công → gọi feedbackRef.current.open();

    console.log("Swap thật đang chạy… (bạn gắn code cũ vào đây)");

    // GIẢ LẬP swap thành công 1s
    setTimeout(() => {
      feedbackRef.current.open();
    }, 1000);
  };

  const handleSwap = () => {
    if (!sourcePreview || !targetPreview) {
      alert("Chọn đủ 2 ảnh đã user😭💗");
      return;
    }

    thựcHiệnSwapThật();
  };

  return (
    <div className="p-4 pt-20 text-white">
      <h1 className="text-2xl font-bold mb-4">Face Swap AI</h1>

      {/* UPLOAD ẢNH */}
      <div className="flex flex-col gap-4">
        <input type="file" accept="image/*" onChange={handleSource} />
        <input type="file" accept="image/*" onChange={handleTarget} />

        {/* PREVIEW ẢNH */}
        {sourcePreview && <img src={sourcePreview} className="w-40 rounded" />}
        {targetPreview && <img src={targetPreview} className="w-40 rounded" />}

        {/* NÚT SWAP */}
        <button
          onClick={handleSwap}
          className="mt-4 py-2 px-4 bg-pink-500 rounded-lg"
        >
          Swap Now 💗
        </button>
      </div>

      {/* ★ GẮN FEEDBACK (Ở CUỐI CÙNG) */}
      <SwapFeedback
        ref={feedbackRef}
        onSubmit={(stars) => {
          console.log("Rating:", stars);
        }}
      />
    </div>
  );
}