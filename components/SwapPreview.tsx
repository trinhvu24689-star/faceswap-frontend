"use client";

import { forwardRef, useImperativeHandle, useState } from "react";

// ⭐ THÊM TYPE — KHÔNG ĐỤNG CODE CŨ
type SwapPreviewProps = {
  source: any;
  target: any;
};

// ⭐ BỌC forwardRef + THÊM TYPE (KHÔNG ĐỔI CODE CŨ)
const SwapPreview = forwardRef<any, SwapPreviewProps>(function SwapPreview(
  { source, target },
  ref
) {
  // ⭐ GIỮ NGUYÊN CODE BÉ
  const [show, setShow] = useState(false);

  // Gọi khi bé bấm nút Swap
  const startPreview = (cb) => {
    setShow(true);

    setTimeout(() => {
      setShow(false);
      cb(); // tiếp tục thực hiện swap thật sự
    }, 900); // hiệu ứng 0.9s
  };

  // ⭐ THÊM useImperativeHandle (KHÔNG ĐỔI CODE CŨ)
  useImperativeHandle(ref, () => ({
    startPreview,
  }));

  return (
    <>
      {show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center">
          <div className="relative w-64 h-64">

            {/* Ảnh Source */}
            <img
              src={source}
              className="absolute inset-0 w-full h-full object-cover rounded-xl animate-slideLeft"
            />

            {/* Ảnh Target */}
            <img
              src={target}
              className="absolute inset-0 w-full h-full object-cover rounded-xl animate-slideRight"
            />
          </div>
        </div>
      )}
    </>
  );
});

export default SwapPreview;