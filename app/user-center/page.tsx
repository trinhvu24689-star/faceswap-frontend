"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://faceswap-server.onrender.com";

type Profile = {
  user_id: string;
  credits: number;
  created_at?: string | null;
};

const LOCAL_KEY = "faceswap_user_id";

export default function UserCenterPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [inputId, setInputId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function fetchProfile(id: string) {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: {
          "x-user-id": id,
        },
      });

      if (!res.ok) {
        throw new Error("Profile not found");
      }

      const data: Profile = await res.json();
      setUserId(data.user_id);
      setCredits(data.credits);
      setCreatedAt(data.created_at ?? null);
      setInputId(data.user_id);
      setMessage(null);
    } catch (err) {
      console.error(err);
      setMessage("Không tìm thấy tài khoản với ID này.");
    } finally {
      setLoading(false);
    }
  }

  // Khởi tạo từ localStorage (nếu có)
  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem(LOCAL_KEY);
        if (stored) {
          await fetchProfile(stored);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    init();
  }, []);

  // Tạo tài khoản mới (gọi /auth/guest)
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
      setMessage("Không tạo được tài khoản mới, thử lại sau nha.");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }

  // Đăng nhập / đổi sang user_id khác
  async function handleUseExistingId() {
    const trimmed = inputId.trim();
    if (!trimmed) {
      setMessage("Nhập user_id trước đã.");
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
      setMessage("Có lỗi khi đăng nhập bằng User ID, thử lại sau nha.");
    } finally {
      setBusy(false);
      setLoading(false);
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(236,72,153,0.15))",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 12px 30px rgba(15,23,42,0.15)",
          padding: "20px 18px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "4px",
          }}
        >
          User Center
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "16px",
          }}
        >
          Quản lý <b>user_id</b> đang dùng cho FaceSwap AI. Có thể tạo tài
          khoản mới hoặc đăng nhập bằng user_id khác.
        </p>

        {/* Thông tin tài khoản hiện tại */}
        <div
          style={{
            borderRadius: "10px",
            background: "#f9fafb",
            padding: "10px 12px",
            marginBottom: "14px",
            fontSize: "12px",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            <span style={{ fontWeight: 600 }}>User hiện tại:</span>{" "}
            <span style={{ wordBreak: "break-all" }}>
              {userId ?? "(chưa đăng nhập)"}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Credits:</span>{" "}
            {loading ? "Đang tải..." : credits ?? 0}
          </div>
          {createdAt && (
            <div style={{ marginTop: "2px", color: "#9ca3af" }}>
              Tạo lúc: {new Date(createdAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Ô nhập user id để đăng nhập / đổi account */}
        <label
          style={{
            fontSize: "12px",
            fontWeight: 600,
            display: "block",
            marginBottom: "4px",
          }}
        >
          Đăng nhập bằng user_id có sẵn
        </label>
        <input
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="Dán user_id vào đây"
          style={{
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            padding: "8px 10px",
            fontSize: "12px",
            marginBottom: "8px",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleUseExistingId}
          disabled={busy}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4f46e5",
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "10px",
            opacity: busy ? 0.7 : 1,
          }}
        >
          Dùng user_id này
        </button>

        <button
          onClick={handleCreateNewAccount}
          disabled={busy}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#10b981",
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "8px",
            opacity: busy ? 0.7 : 1,
          }}
        >
          Tạo tài khoản mới
        </button>

        <button
          onClick={handleLogout}
          disabled={busy}
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: "white",
            color: "#6b7280",
            fontSize: "12px",
            cursor: "pointer",
            marginBottom: "8px",
            opacity: busy ? 0.7 : 1,
          }}
        >
          Xoá user_id khỏi trình duyệt
        </button>

        {message && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "12px",
              color: "#374151",
              background: "#fef9c3",
              borderRadius: "8px",
              padding: "6px 8px",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}