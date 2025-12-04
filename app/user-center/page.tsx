"use client";

import { useEffect, useState } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";

const API_URL = "https://faceswap-backend-clean.fly.dev";

export default function UserCenter() {
  const [userId, setUserId] = useState<string | null>(null);

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

  // ================= USER ID CORE =================
  useEffect(() => {
    let uid = localStorage.getItem("faceswap_user_id");
    if (!uid) {
      uid = `guest-${Date.now()}`;
      localStorage.setItem("faceswap_user_id", uid);
    }
    setUserId(uid);
  }, []);

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
        setAvatar(data?.avatar || `/avatars/random-${(Math.floor(Math.random() * 10) + 1)}.png`);
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

      if (!res.ok) throw new Error("Register failed");
      setOtpSent(true);
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

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      localStorage.setItem("faceswap_user_id", data.user_id);
      setUserId(data.user_id);
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
    } catch (e: any) {
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
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setAvatar(data.url);
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