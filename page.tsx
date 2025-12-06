"use client";

import { useEffect, useState } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";

const API_URL = "https://faceswap-backend-clean.fly.dev";

export default function UserCenter() {
  const [userId, setUserId] = useState("");
  const [credits, setCredits] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [vip, setVip] = useState("FREE");
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleCreateUserId = async () => {
  const res = await fetch(
    "https://faceswap-backend-clean.fly.dev/auth/guest",
    { method: "POST" }
  );

  const data = await res.json();

  // ✅ CHỈ DÙNG 1 KEY DUY NHẤT
  localStorage.setItem("faceswap_user_id", data.user_id);
  setUserId(data.user_id);
  setCredits(data.credits);

  alert("Đã tạo User ID từ backend");
};


// ================= USER ID CORE =================
useEffect(() => {
  const uid = localStorage.getItem("faceswap_user_id");
  if (uid) setUserId(uid);   // ✅ KHÔNG TỰ TẠO guest nữa
}, []);

const handleConfirmUserId = async () => {
    const res = await fetch(`${API_URL}/me?user_id=${userId}`);

    if (!res.ok) {
      alert("User ID không tồn tại");
      return;
    }

    const data = await res.json();

    const data = await res.json();

    // 👉 LƯU LẠI USER ID HỢP LỆ
    localStorage.setItem("faceswap_user_id", userId);
    setCredits(data.credits);

    alert("Đã đồng bộ User ID thành công");
  };

  // ================= LOAD PROFILE =================
  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/me?user_id=${userId}`);
        if (!res.ok) return;

        const data = await res.json();
        setProfile(data);
        setVip(data?.vip || "FREE");

        if (data?.avatar) {
          setAvatar(data.avatar);
        } else {
          const rand = Math.floor(Math.random() * 10) + 1;
          setAvatar(`/avatars/random-${rand}.png`);
        }
      } catch {}
    };

    loadProfile();
  }, [userId]);

  // ================= REGISTER =================
  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Register failed");
      }

      setOtpSent(true);
      alert("Đăng ký thành công, vui lòng xác thực OTP");
    } catch (e: any) {
      setError(e?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Login failed");
      }

      const uid = data?.user_id || data?.id;
      if (!uid) throw new Error("Không nhận được user_id");

      localStorage.setItem("faceswap_user_id", uid);
      setUserId(uid);
      location.reload();
    } catch (e: any) {
      setError(e?.message || "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND OTP =================
  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await fetch(`${API_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, user_id: userId }),
      });
      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) throw new Error("OTP fail");
      alert("OTP xác thực thành công");
    } catch {
      alert("OTP sai");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPLOAD AVATAR =================
  const handleUploadAvatar = async () => {
    if (!avatarFile || !userId) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);
    formData.append("user_id", userId);

    const res = await fetch(`${API_URL}/upload-avatar`, {
      method: "POST",
      headers: {
        "x-user-id": userId,   // ← HEADER BẮT BUỘC
      },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setAvatar(data.avatar.url);
    }
  };

  // ================= DELETE ACCOUNT =================
  const handleDeleteAccount = async () => {
    if (!userId) return;

    if (!confirm("XÓA TÀI KHOẢN VĨNH VIỄN?")) return;

    await fetch(`${API_URL}/delete-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    localStorage.removeItem("faceswap_user_id");
    const newId = `guest-${Date.now()}`;
    localStorage.setItem("faceswap_user_id", newId);
    location.reload();
  };

  // ================= UI =================
  return (
    <div className="relative min-h-screen bg-[#111] text-white flex justify-center">
      <main className="w-full max-w-[420px] px-4 py-4">

        <div className="bg-yellow-200 text-black text-xs p-2 rounded mb-3">
    Đăng ký và login trực tiếp:
    Chọn tạo User ID → Nhập User ID → Nhập TK & MK → Bấm Register → Bấm Verify → Bấm Login
  </div>

        <header className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">User Center</h1>
          <HamburgerMenu />
        </header>

        <div className="bg-[#1b1b1b] p-4 rounded-2xl space-y-4">

          <div className="flex items-center gap-4">
            <img
              src={avatar}
              className="w-16 h-16 rounded-full object-cover"
            />
            <input type="file" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            <button onClick={handleUploadAvatar} className="bg-lime-400 text-black px-3 py-1 rounded">
              Upload
            </button>
          </div>

          <div className="text-sm">
            <div>User ID: {userId}</div>
            <div>VIP: {vip}</div>
          </div>

          <div className="space-y-2">

  <button
    onClick={handleCreateUserId}
    className="w-full bg-lime-400 text-black py-2 rounded"
  >
    Tạo User ID
  </button>

  <input
    value={userId}
    onChange={(e) => setUserId(e.target.value)}
    placeholder="Nhập User ID"
    className="w-full p-2 rounded bg-[#222]"
  />

  <button
    onClick={handleConfirmUserId}
    className="w-full bg-sky-400 text-black py-2 rounded"
  >
    Xác nhận User ID
  </button>

</div>

          <input
            className="w-full p-2 rounded bg-[#222]"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-2 rounded bg-[#222]"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-2">
            <button onClick={handleRegister} className="flex-1 bg-lime-400 text-black py-2 rounded">
              Register
            </button>
            <button onClick={handleLogin} className="flex-1 bg-sky-400 text-black py-2 rounded">
              Login
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSendOTP} className="flex-1 bg-yellow-400 text-black py-2 rounded">
              Send OTP
            </button>
            <input
              className="flex-1 p-2 rounded bg-[#222]"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOTP} className="bg-emerald-400 text-black px-3 rounded">
              Verify
            </button>
          </div>

          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-500 py-2 rounded font-bold"
          >
            XÓA TÀI KHOẢN
          </button>

          {error && <div className="text-red-400 text-sm">{error}</div>}
        </div>
      </main>
    </div>
  );
}