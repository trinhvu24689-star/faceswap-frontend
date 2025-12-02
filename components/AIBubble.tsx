"use client";

import { useState } from "react";

export default function AIBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bong bóng mini */}
      <div
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full 
        bg-gradient-to-br from-pink-500 to-purple-500 
        shadow-xl flex items-center justify-center text-white text-2xl 
        cursor-pointer z-[9999] animate-bounce"
      >
        🤖
      </div>

      {/* Popup chat */}
      {open && (
        <div className="fixed bottom-20 right-6 w-72 bg-white/10 backdrop-blur-xl 
          border border-white/20 p-4 rounded-xl shadow-2xl z-[9999]"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold">AI Hỗ Trợ CSKH 💗</h3>
            <button onClick={() => setOpen(false)} className="text-white text-xl">×</button>
          </div>

          {/* Nội dung chat */}
          <p className="text-white/80 text-sm">
            Bạn cần giúp gì? Swap không ra mong muốn? Tải ảnh lỗi? Hay xem gói nạp? 😊
          </p>

          <textarea
            className="w-full mt-3 p-2 rounded bg-white/20 text-white outline-none resize-none"
            rows={3}
            placeholder="Nhập câu hỏi của bạn…"
          />

          <button className="w-full mt-3 py-2 bg-pink-500 rounded-lg text-white font-semibold hover:bg-pink-600">
            Gửi 💗
          </button>
        </div>
      )}
    </>
  );
}