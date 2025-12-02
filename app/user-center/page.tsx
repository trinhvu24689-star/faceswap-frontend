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

  // --------- AUTO LOAD UID (FIX LỖI 1) ----------
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_KEY);
      if (!stored) return;

      // Không xoá UID nếu lỗi — giữ để user còn copy
      fetchProfile(stored, false);
    } catch (err) {
      console.error("Init error:", err);
    }
  }, []);

  async function fetchProfile(id: string, showMessage = true) {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { "x-user-id": id },
      });

      if (!res.ok) {
        if (showMessage) {
          setMessage("User ID không tồn tại trên server.");
        }
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
      if (showMessage)
        setMessage("Không tải được tài khoản. Kiểm tra kết nối mạng.");
    }
  }

  async function handleCreateNewAccount() {
    try {
      setBusy(true);
      setMessage(null);

      const res = await fetch(`${API_URL}/auth/guest`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("fail");

      const data = await res.json();

      localStorage.setItem(LOCAL_KEY, data.user_id);
      setUserId(data.user_id);
      setCredits(data.credits);
      setInputId(data.user_id);
      setMessage("Tạo tài khoản mới thành công.");
    } catch {
      setMessage("Không tạo được tài khoản mới.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUseExistingId() {
    const id = inputId.trim();
    if (!id) {
      setMessage("Hãy nhập user_id.");
      return;
    }

    try {
      setBusy(true);

      const res = await fetch(`${API_URL}/profile`, {
        headers: { "x-user-id": id },
      });

      if (!res.ok) {
        setMessage("User ID không tồn tại.");
        return;
      }

      const data = await res.json();

      localStorage.setItem(LOCAL_KEY, id);
      setUserId(data.user_id);
      setCredits(data.credits);
      setCreatedAt(data.created_at ?? null);
      setMessage("Đăng nhập thành công.");
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(LOCAL_KEY);
    setUserId(null);
    setCredits(null);
    setCreatedAt(null);
    setInputId("");
    setMessage("Đã xoá user_id khỏi trình duyệt.");
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white/95 shadow-2xl border border-white/20 backdrop-blur px-6 py-7">

        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">
          User Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý user_id và trạng thái tài khoản.
        </p>

        {/* CURRENT USER BOX */}
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm">
            <span className="font-semibold">User ID:</span>{" "}
            <span className="break-all">{userId ?? "(chưa đăng nhập)"}</span>
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Credits:</span> {credits ?? 0}
          </p>
          {createdAt && (
            <p className="text-xs text-slate-400 mt-1">
              Tạo lúc: {new Date(createdAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* INPUT UID */}
        <label className="block mt-5 text-sm font-semibold text-slate-700">
          Đăng nhập bằng user_id
        </label>
        <input
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="Dán user_id tại đây"
          className="w-full mt-1 rounded-xl border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-violet-400 outline-none"
        />

        <button
          onClick={handleUseExistingId}
          disabled={busy}
          className="w-full mt-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-md disabled:opacity-60"
        >
          Dùng user_id này
        </button>

        {/* CREATE NEW */}
        <button
          onClick={handleCreateNewAccount}
          disabled={busy}
          className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-md disabled:opacity-60"
        >
          Tạo tài khoản mới
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          disabled={busy}
          className="w-full mt-2 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium disabled:opacity-60"
        >
          Xoá user_id khỏi hệ thống
        </button>

        {message && (
          <div className="mt-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-slate-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}