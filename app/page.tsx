"use client";

import { useState, useEffect } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://faceswap-server.onrender.com";

// gói nạp credit (Bông Tuyết TD)
const CREDIT_PACKS = [
  { id: "pack_small", label: "Gói 50 Bông Tuyết", credits: 50, price: "29.000đ" },
  { id: "pack_medium", label: "Gói 150 Bông Tuyết", credits: 150, price: "79.000đ" },
  { id: "pack_big", label: "Gói 400 Bông Tuyết", credits: 400, price: "199.000đ" },
];

type PaymentHistoryItem = {
  id: string;
  amount?: number;
  credits?: number;
  status?: string;
  provider?: string;
  created_at?: string;
};

export default function Home() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ====== USER + CREDITS ======
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // ====== TAB ẢNH / VIDEO ======
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");

  // ====== SHOP + LỊCH SỬ THANH TOÁN ======
  const [showShop, setShowShop] = useState(false);
  const [showPayHistory, setShowPayHistory] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  // ====== VIDEO SWAP ======
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    const init = async () => {
      let uid: string | null = localStorage.getItem("faceswap_user_id");

      try {
        // 1) Nếu chưa có uid -> thử tạo guest
        if (!uid) {
          const res = await fetch(`${API_URL}/auth/guest`, { method: "POST" });

          if (res.ok) {
            let data: any = {};
            try {
              const ct = res.headers.get("content-type") || "";
              if (ct.includes("application/json")) {
                data = await res.json();
              } else {
                console.error("Create guest non-JSON:", await res.text());
              }
            } catch (e) {
              console.error("Create guest parse error:", e);
            }

            if (data?.user_id) {
              const newUid = String(data.user_id); // chắc chắn là string
              uid = newUid;
              localStorage.setItem("faceswap_user_id", newUid);
              if (typeof data?.credits === "number") {
                setCredits(data.credits);
              }
            }
          } else {
            console.error("Create guest failed status:", res.status);
          }
        }

        // 2) Nếu đã có uid (cũ hoặc mới) -> thử lấy credits
        if (uid) {
          const res2 = await fetch(`${API_URL}/credits`, {
            headers: { "x-user-id": uid },
          });

          if (res2.ok) {
            try {
              const ct = res2.headers.get("content-type") || "";
              if (ct.includes("application/json")) {
                const data2: any = await res2.json();
                if (typeof data2?.credits === "number") {
                  setCredits(data2.credits);
                } else {
                  setCredits((prev) => (prev ?? 0));
                }
              } else {
                console.error("Credits non-JSON response:", await res2.text());
              }
            } catch (e) {
              console.error("Credits parse error:", e);
            }
          } else {
            console.error("Credits fetch error status:", res2.status);
          }
        }
      } catch (e) {
        // Không show lỗi ra UI nữa, chỉ log
        console.error("Init user/credits big error", e);
      } finally {
        // Nếu đến đây vẫn chưa có uid -> tạo tạm 1 uid local cho chắc
        if (!uid) {
          uid = `local-${Date.now()}`;
          localStorage.setItem("faceswap_user_id", uid);
          // credits để 0
          setCredits((prev) => (prev ?? 0));
        }

        setUserId(uid);
        setLoadingCredits(false);
      }
    };

    init();
  }, []);

  // =================== ẢNH ===================
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
      setVideoResultUrl(null);

      const formData = new FormData();
      formData.append("source_image", sourceFile);
      formData.append("target_image", targetFile);

      const res = await fetch(`${API_URL}/faceswap`, {
        method: "POST",
        body: formData,
        headers: {
          "x-user-id": userId,
        },
      });

      if (!res.ok) {
        let msg = `Lỗi server (${res.status})`;
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            if (data?.detail) msg = data.detail;
          } else {
            console.error("Faceswap non-JSON error response:", await res.text());
          }
        } catch (e) {
          /* ignore */
        }
        throw new Error(msg);
      }

      const remain = res.headers.get("x-credits-remaining");
      if (remain !== null) {
        setCredits(Number(remain));
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultImg(url);
    } catch (e: any) {
      setError(e?.message || "Có lỗi gì đó rồi :<");
    } finally {
      setLoading(false);
    }
  };

  // =================== VIDEO ===================
  const handleSwapVideo = async () => {
    if (!videoFile || !targetFile) {
      setError("Bé chọn đầy đủ video + ảnh khuôn mặt đã nha 😘");
      return;
    }

    if (!userId) {
      setError("Không xác định được tài khoản, tải lại trang thử nhé 💦");
      return;
    }

    try {
      setLoadingVideo(true);
      setError(null);
      setResultImg(null);
      setVideoResultUrl(null);

      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("target_image", targetFile);

      const res = await fetch(`${API_URL}/faceswap/video`, {
        method: "POST",
        headers: {
          "x-user-id": userId,
        },
        body: formData,
      });

      if (!res.ok) {
        let msg = `Lỗi server (${res.status})`;
        if (res.status === 404) {
          msg =
            "API hoán đổi khuôn mặt cho video chưa được bật trên server, anh sẽ cấu hình tiếp cho bé sau nha 🥺";
        } else {
          try {
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
              const data = await res.json();
              if (data?.detail) msg = data.detail;
            } else {
              console.error("Video swap non-JSON error response:", await res.text());
            }
          } catch {
            /* ignore */
          }
        }
        throw new Error(msg);
      }

      const remain = res.headers.get("x-credits-remaining");
      if (remain !== null) {
        setCredits(Number(remain));
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoResultUrl(url);
    } catch (e: any) {
      setError(e?.message || "Có lỗi gì đó rồi :<");
    } finally {
      setLoadingVideo(false);
    }
  };

  // =================== SHOP CREDIT ===================
  const openShop = () => {
    setShowShop(true);
  };

  const handleCheckout = async (packId: string) => {
    if (!userId) {
      setError("Không xác định được tài khoản, tải lại trang thử nhé 💦");
      return;
    }

    try {
      setLoadingCheckout(true);
      setError(null);

      const res = await fetch(`${API_URL}/credits/checkout/stripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ pack_id: packId }),
      });

      if (!res.ok) {
        let msg = `Không tạo được phiên thanh toán (${res.status})`;
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            if (data?.detail) msg = data.detail;
          } else {
            console.error(
              "Checkout non-JSON error response:",
              await res.text()
            );
          }
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const data = await res.json();
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("Không lấy được link thanh toán, bé thử lại sau nha 🥺");
      }
    } catch (e: any) {
      setError(e?.message || "Thanh toán bị lỗi, bé thử lại chút nữa nha :<");
    } finally {
      setLoadingCheckout(false);
    }
  };

  // =================== LỊCH SỬ THANH TOÁN ===================
  const openPayHistory = async () => {
    setShowPayHistory(true);
    if (!userId) return;

    try {
      setLoadingHistory(true);
      setError(null);

      const res = await fetch(`${API_URL}/payment/history`, {
        headers: {
          "x-user-id": userId,
        },
      });

      if (!res.ok) {
        let msg = `Không tải được lịch sử thanh toán (${res.status})`;
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            if (data?.detail) msg = data.detail;
          }
        } catch (e) {
          /* ignore parse error */
        }
        throw new Error(msg);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setPaymentHistory(data);
      } else if (Array.isArray(data?.items)) {
        setPaymentHistory(data.items);
      } else {
        setPaymentHistory([]);
      }
    } catch (e: any) {
      setError(e?.message || "Không lấy được lịch sử thanh toán rồi :<");
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div
      className="relative flex justify-center bg-[#111]"
      style={{
        minHeight: "100svh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* BG nhẹ cho đỡ trống */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black via-[#121212] to-[#050505]" />

      {/* MAIN CONTAINER giống mobile Vidmage */}
      <main
        id="top-section"
        className="w-full max-w-[480px] px-3 py-4 sm:px-4 sm:py-6 text-white"
      >
        {/* HEADER ĐEN */}
        <header className="rounded-2xl bg-[#111111] border border-[#2b2b2b] px-3 py-2 flex items-center justify-between">
          {/* Logo + tên */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-lime-400 flex items-center justify-center text-black font-bold text-xs">
              🐦‍🔥
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold">
                ZenitSwap AI
              </span>
              <span className="text-[10px] text-lime-300/90">
                Hoán Đổi Khuôn Mặt Bằng AI UHD
              </span>
            </div>
          </div>

          {/* coin + avatar + menu */}
          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              className="flex items-center gap-1 bg-[#222] px-2 py-1 rounded-full"
              onClick={openShop}
            >
              <span className="text-yellow-300">❄️</span>
              <span>{loadingCredits ? "..." : credits !== null ? credits : 0}</span>
            </button>

            <div className="h-7 w-7 rounded-full overflow-hidden border border-white/40 bg-slate-600 flex items-center justify-center text-[10px]">
              QH
            </div>

            <button
              type="button"
              className="h-7 w-7 rounded-full bg-[#222] flex items-center justify-center text-xs"
              title="Lịch sử"
              onClick={openPayHistory}
            >
              ⟳
            </button>

            <HamburgerMenu />
          </div>
        </header>

        {/* TAB BAR */}
        <div className="mt-3 flex rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#181818] text-[12px] font-medium">
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "image"
                ? "bg-lime-400 text-black"
                : "bg-[#252525] text-slate-400"
            }`}
            onClick={() => setActiveTab("image")}
          >
            Hoán đổi khuôn mặt ảnh
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "video"
                ? "bg-lime-400 text-black"
                : "bg-[#252525] text-slate-400"
            }`}
            onClick={() => (window.location.href = "/video")}
          >
            Hoán đổi khuôn mặt video
          </button>
        </div>

        {/* KHUNG CHÍNH */}
        <section className="mt-4 rounded-3xl bg-[#181818] border border-[#2a2a2a] px-3 pt-3 pb-4 shadow-[0_0_0_1px_rgba(0,0,0,0.6)]">
          {activeTab === "image" && (
            <>
              {/* PREVIEW 2 ẢNH */}
              <div className="relative rounded-3xl border border-[#3a3a3a] bg-[#101010] px-2 py-2 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl overflow-hidden bg-black/40 border border-[#444] h-40">
                    {sourceFile ? (
                      <img
                        src={URL.createObjectURL(sourceFile)}
                        alt="Source"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">
                        Ảnh gốc của bạn
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl overflow-hidden bg-black/40 border border-[#444] h-40">
                    {targetFile ? (
                      <img
                        src={URL.createObjectURL(targetFile)}
                        alt="Target"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">
                        Ảnh muốn thay mặt
                      </div>
                    )}
                  </div>
                </div>

                {/* avatar tròn ở giữa + mũi tên */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                  <div className="h-14 w-14 rounded-full border-4 border-lime-400 overflow-hidden bg-black/70 flex items-center justify-center">
                    {sourceFile ? (
                      <img
                        src={URL.createObjectURL(sourceFile)}
                        alt="face"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-200 text-center px-1">
                        💞
                      </span>
                    )}
                  </div>
                  <span className="text-lime-300 text-xl">↪</span>
                </div>
              </div>

              {/* 3 BƯỚC */}
              <section id="steps-section" className="space-y-3 text-[12px]">
                {/* Bước 1 */}
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-lime-300 font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lime-300">
                      Tải lên hình ảnh gốc có khuôn mặt
                    </div>
                    <button
                      className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px] flex items-center justify-center gap-1"
                      onClick={() =>
                        document.getElementById("source-input")?.click()
                      }
                    >
                      Tải lên hình ảnh ⬆
                    </button>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      PNG / JPG / JPEG / WEBP / GIF
                    </div>
                    <input
                      id="source-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setSourceFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>

                {/* Bước 2 */}
                <div className="flex gap-2" id="target-section">
                  <div className="h-8 w-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-lime-300 font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lime-300">
                      Tải lên ảnh khuôn mặt
                    </div>
                    <button
                      className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px] flex items-center justify-center gap-1"
                      onClick={() =>
                        document.getElementById("target-input")?.click()
                      }
                    >
                      Tải lên hình ảnh ⬆
                    </button>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      PNG / JPG / JPEG / WEBP
                    </div>
                    <input
                      id="target-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setTargetFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>

                {/* Bước 3 */}
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-lime-300 font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lime-300">
                      Bắt đầu hoán đổi khuôn mặt
                    </div>
                    <button
                      onClick={handleSwap}
                      disabled={loading || loadingCredits}
                      className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px] flex items-center justify-center gap-1 disabled:bg-slate-500 disabled:text-slate-200"
                    >
                      {loading ? "Đang hoán đổi..." : "Hoán đổi khuôn mặt ›"}
                    </button>
                    <div className="mt-0.5 text-[10px] text-slate-300">
                      Hạn ngạch miễn phí hàng ngày còn lại: Hình ảnh:{"1"}
                      {credits ?? 0}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "video" && (
            <section className="space-y-3 text-[12px]">
              {/* PREVIEW VIDEO + ẢNH MẶT */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-2xl overflow-hidden bg-black/40 border border-[#444] h-40 flex items-center justify-center">
                  {videoFile ? (
                    <video
                      src={URL.createObjectURL(videoFile)}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400 px-2 text-center">
                      Video gốc của bạn
                    </div>
                  )}
                </div>
                <div className="rounded-2xl overflow-hidden bg-black/40 border border-[#444] h-40 flex items-center justify-center">
                  {targetFile ? (
                    <img
                      src={URL.createObjectURL(targetFile)}
                      alt="Target"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400 px-2 text-center">
                      Ảnh khuôn mặt muốn thay
                    </div>
                  )}
                </div>
              </div>

              {/* Bước chọn video */}
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-lime-300 font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lime-300">
                    Chọn video gốc có khuôn mặt
                  </div>
                  <button
                    className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px] flex items-center justify-center gap-1"
                    onClick={() =>
                      document.getElementById("video-input")?.click()
                    }
                  >
                    Tải lên video ⬆
                  </button>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    Hỗ trợ MP4 / MOV / WEBM (khuyên dùng video ngắn & rõ mặt)
                  </div>
                  <input
                    id="video-input"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Bước chọn ảnh mặt */}
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-lime-300 font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lime-300">
                    Chọn ảnh khuôn mặt muốn thay
                  </div>
                  <button
                    className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px] flex items-center justify-center gap-1"
                    onClick={() =>
                      document.getElementById("target-input")?.click()
                    }
                  >
                    Tải lên hình ảnh ⬆
                  </button>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    PNG / JPG / JPEG / WEBP
                  </div>
                </div>
              </div>

              {/* Bước bắt đầu */}
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-lime-300 font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lime-300">
                    Bắt đầu hoán đổi khuôn mặt cho video
                  </div>
                  <button
                    onClick={handleSwapVideo}
                    disabled={loadingVideo || loadingCredits}
                    className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px] flex items-center justify-center gap-1 disabled:bg-slate-500 disabled:text-slate-200"
                  >
                    {loadingVideo
                      ? "Đang hoán đổi video..."
                      : "Hoán đổi khuôn mặt video ›"}
                  </button>
                  <div className="mt-0.5 text-[10px] text-slate-300">
                    Mỗi lần hoán đổi video sẽ trừ thêm Bông Tuyết, bé nhớ cân
                    nhắc trước khi chạy nha 💸
                  </div>
                </div>
              </div>
            </section>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="mt-3 text-[12px] text-red-100 bg-red-500/40 border border-red-300/80 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* KẾT QUẢ ẢNH */}
        {resultImg && (
          <section
            id="result-section"
            className="mt-4 rounded-3xl bg-[#181818] border border-[#2a2a2a] px-3 py-3"
          >
            <div className="font-semibold text-[13px] mb-2">
              💖 Hoàn tất quá trình: Kết quả
            </div>
            <img
              src={resultImg}
              alt="Result"
              className="w-full max-h-[420px] object-contain rounded-2xl border border-[#3a3a3a] bg-black"
            />
            <a
              href={resultImg}
              download="faceswap_result.jpg"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px]"
            >
              ⬇ Tải ảnh về máy
            </a>
          </section>
        )}

        {/* KẾT QUẢ VIDEO */}
        {videoResultUrl && (
          <section className="mt-4 rounded-3xl bg-[#181818] border border-[#2a2a2a] px-3 py-3">
            <div className="font-semibold text-[13px] mb-2">
              💖 Hoàn tất quá trình: Video kết quả
            </div>
            <video
              src={videoResultUrl}
              controls
              className="w-full max-h-[420px] object-contain rounded-2xl border border-[#3a3a3a] bg-black"
            />
            <a
              href={videoResultUrl}
              download="faceswap_video_result.mp4"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px]"
            >
              ⬇ Tải video về máy
            </a>
          </section>
        )}

        {/* FOOTER */}
        <footer
          id="footer-section"
          className="mt-4 text-[10px] text-center text-slate-400"
        >
          Made with Quang Hổ Master 🩵 — Zalo: 0856 848 557 🩵
        </footer>
      </main>

      {/* MODAL SHOP CREDIT */}
      {showShop && (
        <div
          className="fixed inset-0 z-40 bg-black/70 flex items-end justify-center"
          onClick={() => setShowShop(false)}
        >
          <div
            className="w-full max-w-[480px] bg-[#111] rounded-t-3xl border-t border-white/10 px-4 pt-3 pb-5 text-[12px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">❄️</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-50">
                    Shop Bông Tuyết TD
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Số dư hiện tại: {credits ?? 0} Bông Tuyết
                  </span>
                </div>
              </div>
              <button
                className="text-xs text-slate-300 hover:text-white"
                onClick={() => setShowShop(false)}
              >
                Đóng
              </button>
            </div>

            <div className="space-y-2">
              {CREDIT_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  disabled={loadingCheckout}
                  onClick={() => handleCheckout(pack.id)}
                  className="w-full flex items-center justify-between rounded-2xl bg-[#181818] border border-[#333] px-3 py-2.5 hover:border-lime-400 transition disabled:opacity-60"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-50">
                      {pack.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Nhận thêm {pack.credits} Bông Tuyết để hoán đổi ảnh/video
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-lime-300">
                      {pack.price}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Thanh toán Stripe/Ví quốc tế
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {loadingCheckout && (
              <div className="mt-3 text-[11px] text-slate-300">
                Đang tạo phiên thanh toán cho bé, đợi xíu nha…
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL LỊCH SỬ THANH TOÁN */}
      {showPayHistory && (
        <div
          className="fixed inset-0 z-40 bg-black/70 flex items-end justify-center"
          onClick={() => setShowPayHistory(false)}
        >
          <div
            className="w-full max-w-[480px] bg-[#111] rounded-t-3xl border-t border-white/10 px-4 pt-3 pb-5 text-[12px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-50">
                    Lịch sử thanh toán
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Theo tài khoản guest hiện tại
                  </span>
                </div>
              </div>
              <button
                className="text-xs text-slate-300 hover:text-white"
                onClick={() => setShowPayHistory(false)}
              >
                Đóng
              </button>
            </div>

            {loadingHistory && (
              <div className="text-[11px] text-slate-300">
                Đang tải lịch sử thanh toán cho bé…
              </div>
            )}

            {!loadingHistory && paymentHistory.length === 0 && (
              <div className="text-[11px] text-slate-400">
                Chưa có giao dịch nào, bé thử nạp Bông Tuyết lần đầu xem sao 😘
              </div>
            )}

            {!loadingHistory && paymentHistory.length > 0 && (
              <div className="space-y-2 max-h-[260px] overflow-y-auto">
                {paymentHistory.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-[#181818] border border-[#333] px-3 py-2.5 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-50">
                        {p.credits ?? "??"} Bông Tuyết
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.amount
                          ? `${p.amount.toLocaleString("vi-VN")}đ`
                          : "Số tiền không rõ"}
                        {" • "}
                        {p.provider || "Stripe"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-[11px] font-semibold ${
                          p.status === "paid"
                            ? "text-lime-300"
                            : p.status === "pending"
                            ? "text-yellow-300"
                            : "text-red-300"
                        }`}
                      >
                        {p.status || "unknown"}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {p.created_at}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}