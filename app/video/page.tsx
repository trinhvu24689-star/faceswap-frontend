"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // 👈 thêm dòng này

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://faceswap-server.onrender.com";

export default function VideoSwapPage() {
  // ==== user + credit (dùng chung với web ảnh) ====
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==== file video + ảnh mặt ====
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);

  // ==== kết quả ====
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);

  // ==== khởi tạo user/credits (y chang bên ảnh, chỉ copy ra) ====
    // ==== khởi tạo user/credits (bản hiền, giống trang ảnh) ====
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
                console.error("Guest non-JSON:", await res.text());
              }
            } catch (err) {
              console.error("Guest parse error:", err);
            }

            if (data?.user_id) {
              const newUid = String(data.user_id);
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

        // 2) Nếu đã có uid -> thử lấy credits (nếu lỗi thì bỏ qua, không quăng error)
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
                }
              } else {
                console.error("Credits non-JSON response:", await res2.text());
              }
            } catch (err) {
              console.error("Credits parse error:", err);
            }
          } else {
            console.error("Credits fetch error status:", res2.status);
          }
        }
      } catch (e) {
        // không show lỗi đỏ nữa, chỉ log
        console.error("Init user/credits (video) error:", e);
      } finally {
        // Nếu vẫn chưa có uid thì tạo tạm local
        if (!uid) {
          uid = `local-${Date.now()}`;
          localStorage.setItem("faceswap_user_id", uid);
          setCredits((prev) => prev ?? 0);
        }
        setUserId(uid);
        setLoadingCredits(false);
      }
    };

    init();
  }, []);

  // ==== gọi API hoán đổi video ====
  const handleSwapVideo = async () => {
    if (!videoFile || !faceFile) {
      setError("Bạn hãy chọn đủ **video gốc** và **ảnh khuôn mặt** đã nha 😘");
      return;
    }
    if (!userId) {
      setError("Không xác định được tài khoản, tải lại trang thử nhé 💦");
      return;
    }

    try {
      setLoadingVideo(true);
      setError(null);
      setVideoResultUrl(null);

      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("target_image", faceFile);

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
            "API /faceswap/video chưa được bật trên server. Khi nào backend xong, anh bật cho bé dùng luôn nha 🥺";
        } else {
          try {
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
              const data = await res.json();
              if (data?.detail) msg = data.detail;
            } else {
              console.error("Video error non-JSON:", await res.text());
            }
          } catch {
            /* ignore */
          }
        }
        throw new Error(msg);
      }

      const remain = res.headers.get("x-credits-remaining");
      if (remain !== null) setCredits(Number(remain));

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoResultUrl(url);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Có lỗi khi hoán đổi video rồi :<");
    } finally {
      setLoadingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[480px] px-3 py-4 text-white">
        {/* HEADER giống style trang chính nhưng đơn giản hơn */}
        <header className="rounded-2xl bg-[#111] border border-[#2b2b2b] px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-lime-400 flex items-center justify-center text-black text-xs font-bold">
              🐦‍🔥
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold">ZenitSwap AI</span>
              <span className="text-[10px] text-lime-300/90">
                Hoán Đổi Khuôn Mặt Cho Video
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end text-[10px]">
            <span className="text-slate-400">Bông Tuyết còn lại</span>
            <span className="text-lime-300 font-semibold">
              {loadingCredits ? "..." : credits ?? 0}
            </span>
          </div>
        </header>

        {/* TAB SWITCH ẢNH / VIDEO */}
        <div className="flex justify-center gap-2 mt-3">
          {/* Tab ảnh → quay lại trang chính / */}
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-[#2a2a2a] text-white font-semibold text-[13px] border border-[#3a3a3a] hover:bg-[#333] transition inline-flex items-center justify-center"
          >
            Hoán đổi khuôn mặt ảnh
          </Link>

          {/* Tab video (đang ở trang này) */}
          <Link
            href="/video"
            className="px-4 py-2 rounded-full bg-lime-400 text-black font-semibold text-[13px] inline-flex items-center justify-center"
          >
            Hoán đổi khuôn mặt video
          </Link>
        </div>

        {/* KHỐI CHÍNH */}
        <section className="mt-4 rounded-3xl bg-[#181818] border border-[#2a2a2a] px-3 pt-3 pb-4">
          {/* preview video + ảnh mặt */}
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
              {faceFile ? (
                <img
                  src={URL.createObjectURL(faceFile)}
                  alt="face"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400 px-2 text-center">
                  Ảnh khuôn mặt muốn thay
                </div>
              )}
            </div>
          </div>

          {/* bước chọn video */}
          <div className="flex gap-2 mb-3 text-[12px]">
            <div className="h-8 w-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-lime-300 font-bold text-sm">
              1
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lime-300">
                Chọn video gốc có khuôn mặt
              </div>
              <button
                className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px]"
                onClick={() =>
                  document.getElementById("video-input")?.click()
                }
              >
                Tải lên video ⬆
              </button>
              <div className="mt-0.5 text-[10px] text-slate-400">
                Hỗ trợ MP4 / MOV / WEBM (video, rõ mặt càng tốt)
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

          {/* bước chọn ảnh mặt */}
          <div className="flex gap-2 mb-3 text-[12px]">
            <div className="h-8 w-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-lime-300 font-bold text-sm">
              2
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lime-300">
                Chọn ảnh khuôn mặt muốn thay
              </div>
              <button
                className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px]"
                onClick={() =>
                  document.getElementById("face-input")?.click()
                }
              >
                Tải lên hình ảnh ⬆
              </button>
              <div className="mt-0.5 text-[10px] text-slate-400">
                PNG / JPG / JPEG / WEBP
              </div>
              <input
                id="face-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFaceFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* bắt đầu hoán đổi */}
          <div className="flex gap-2 text-[12px]">
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
                className="mt-1 w-full rounded-xl bg-lime-400 text-black font-semibold py-2 text-[12px] disabled:bg-slate-500 disabled:text-slate-200"
              >
                {loadingVideo
                  ? "Đang hoán đổi video..."
                  : "Hoán đổi khuôn mặt video ›"}
              </button>
              <div className="mt-0.5 text-[10px] text-slate-300">
                Bông Tuyết sẽ trừ theo số giây(30s/15❄️)
              </div>
            </div>
          </div>
        </section>

        {/* lỗi */}
        {error && (
          <div className="mt-3 text-[12px] text-red-100 bg-red-500/40 border border-red-300/80 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* kết quả video */}
        {videoResultUrl && (
          <section className="mt-4 rounded-3xl bg-[#181818] border border-[#2a2a2a] px-3 py-3">
            <div className="font-semibold text-[13px] mb-2">
              💖 Hoàn tất quá trình: Kết Quả Video
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

        <footer className="mt-4 text-[10px] text-center text-slate-400">
          Made with Quang Hổ Master 🩵 — Zalo: 0856 848 557 🩵
        </footer>
      </div>
    </div>
  );
}