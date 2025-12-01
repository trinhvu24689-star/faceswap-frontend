"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://faceswap-server.onrender.com";

const LOCAL_KEY = "faceswap_user_id";

type Profile = {
  user_id: string;
  credits: number;
  created_at?: string | null;
};

export default function UserCenterPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [inputId, setInputId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Khởi tạo: nếu có faceswap_user_id thì load profile
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_KEY);
      if (!stored) return;
      fetchProfile(stored);
    } catch (err) {
      console.error("Init user center error:", err);
    }
  }, []);

  async function fetchProfile(id: string) {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: {
          "x-user-id": id,
        },
      });

      if (!res.ok) {
        console.warn("Profile not found for id:", id);
        setUserId(null);
        setCredits(null);
        setCreatedAt(null);
        return;
      }

      const data: Profile = await res.json();
      setUserId(data.user_id);
      setCredits(data.credits);
      setCreatedAt(data.created_at ?? null);
      setInputId(data.user_id);
      setMessage(null);
    } catch (err) {
      console.error(err);
      setMessage("Không tải được thông tin tài khoản. Hãy thử lại sau.");
    }
  }

  // Tạo tài khoản mới (guest)
  async function handleCreateNewAccount() {
    try {
      setBusy(true);
      setMessage(null);

      const res = await fetch(`${API_URL}/auth/guest`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to create guest user");
      }

      const data = (await res.json()) as { user_id: string; credits: number };

      localStorage.setItem(LOCAL_KEY, data.user_id);
      setUserId(data.user_id);
      setCredits(data.credits);
      setCreatedAt(null);
      setInputId(data.user_id);

      setMessage("Đã tạo tài khoản mới và đăng nhập thành công.");
    } catch (err) {
      console.error(err);
      setMessage("Không tạo được tài khoản mới, hãy thử lại sau.");
    } finally {
      setBusy(false);
    }
  }

  // Dùng user_id đã nhập
  async function handleUseExistingId() {
    const trimmed = inputId.trim();
    if (!trimmed) {
      setMessage("Hãy nhập user_id trước.");
      return;
    }

    try {
      setBusy(true);
      setMessage(null);

      const res = await fetch(`${API_URL}/profile`, {
        headers: {
          "x-user-id": trimmed,
        },
      });

      if (!res.ok) {
        setMessage("User ID này không tồn tại trong hệ thống.");
        return;
      }

      const data: Profile = await res.json();

      localStorage.setItem(LOCAL_KEY, data.user_id);
      setUserId(data.user_id);
      setCredits(data.credits);
      setCreatedAt(data.created_at ?? null);

      setMessage("Đã đăng nhập bằng User ID này.");
    } catch (err) {
      console.error(err);
      setMessage("Có lỗi khi đăng nhập bằng User ID, hãy thử lại sau.");
    } finally {
      setBusy(false);
    }
  }

  // Xoá user_id khỏi trình duyệt
  function handleLogout() {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch (err) {
      console.error(err);
    }
    setUserId(null);
    setCredits(null);
    setCreatedAt(null);
    setInputId("");
    setMessage("Đã xoá user_id khỏi trình duyệt.");
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white/95 text-slate-900 shadow-2xl border border-white/10 backdrop-blur-md px-5 py-6 sm:px-6 sm:py-7">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
            User Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-snug">
            Quản lý <span className="font-semibold">user_id</span> đang dùng cho
            FaceSwap AI. Bạn có thể tạo tài khoản mới hoặc đăng nhập bằng
            user_id khác.
          </p>
        </div>

        {/* Thông tin tài khoản hiện tại */}
        <div className="mb-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs sm:text-sm">
          <div className="mb-1">
            <span className="font-semibold">User hiện tại:</span>{" "}
            <span className="break-all">
              {userId ?? "(chưa đăng nhập)"}
            </span>
          </div>
          <div className="mb-1">
            <span className="font-semibold">Credits:</span>{" "}
            {credits ?? 0}
          </div>
          {createdAt && (
            <div className="text-[11px] sm:text-xs text-slate-400">
              Tạo lúc: {new Date(createdAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Nhập user_id có sẵn */}
        <div className="mb-3">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
            Đăng nhập bằng user_id có sẵn
          </label>
          <input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Dán user_id vào đây"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
          />
        </div>

        {/* Nút dùng user_id */}
        <button
          onClick={handleUseExistingId}
          disabled={busy}
          className="w-full mb-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs sm:text-sm font-semibold py-2.5 shadow-md shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          Login user_id
        </button>

        {/* Nút tạo tài khoản mới */}
        <button
          onClick={handleCreateNewAccount}
          disabled={busy}
          className="w-full mb-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs sm:text-sm font-semibold py-2.5 shadow-md shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          Tạo tài khoản mới
        </button>

        {/* Nút xoá user_id */}
        <button
          onClick={handleLogout}
          disabled={busy}
          className="w-full mb-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] sm:text-xs text-slate-600 font-medium py-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          Xoá user_id khỏi trình duyệt
        </button>

        {/* Message */}
        {message && (
          <div className="mt-2 rounded-xl bg-yellow-50 border border-yellow-100 px-3 py-2 text-[11px] sm:text-xs text-slate-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}