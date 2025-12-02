"use client";

import { forwardRef, useImperativeHandle, useState } from "react";

// ⭐ BỌC THÊM forwardRef (KHÔNG ĐỤNG CODE CŨ)
const SwapFeedback = forwardRef(function SwapFeedback({ onSubmit }, ref) {

  // ⭐ GIỮ NGUYÊN CODE GỐC CỦA BÉ
  const [show, setShow] = useState(false);

  const open = () => setShow(true);

  const send = (stars) => {
    setShow(false);
    onSubmit(stars);
  };

  // ⭐ THÊM useImperativeHandle — KHÔNG ĐỔI NỘI DUNG CŨ
  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <>
      {show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl text-center w-[90%] max-w-[320px]">
            <h3 className="text-white text-lg font-semibold mb-3">
              Ảnh/video tráo mặt này thế nào user của tôi? 💗
            </h3>

            <div className="flex justify-center gap-3 text-2xl mb-4">
              <button onClick={() => send(5)}>⭐</button>
              <button onClick={() => send(4)}>⭐</button>
              <button onClick={() => send(3)}>⭐</button>
              <button onClick={() => send(2)}>⭐</button>
              <button onClick={() => send(1)}>⭐</button>
            </div>

            <p className="text-white/70 text-sm">Cảm ơn bạn đã đánh giá,chúng tôi sẽ cải thiện tốt hơn 💗</p>
          </div>
        </div>
      )}
    </>
  );
});

export default SwapFeedback;