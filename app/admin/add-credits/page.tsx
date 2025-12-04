"use client";

import { useState } from "react";

const API_URL = "https://faceswap-backend-clean.fly.dev";
const ADMIN_KEY = "ZENITHADMIN"; // ✅ KEY CỐ ĐỊNH CHO VK

export default function AdminAddCredits() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    setResult("Đang gửi yêu cầu...");

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("amount", amount);

    try {
      const res = await fetch(`${API_URL}/admin/credits/add`, {
        method: "POST",
        headers: {
          "x-admin-key": ADMIN_KEY, // ✅ TỰ GỬI KEY
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(
          `✅ Thành công!\nUser: ${data.user_id}\nCộng: ${data.added}❄️\nHiện có: ${data.credits_now}❄️`
        );
      } else {
        setResult(`❌ Lỗi: ${data.detail || "Không xác định"}`);
      }
    } catch (err) {
      setResult("❌ Không kết nối được tới Backend Fly.io");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">Hệ Thống Admin ❄️</h1>

      <div className="space-y-4 max-w-md">
        <input
          className="w-full p-2 rounded bg-gray-800"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <input
          className="w-full p-2 rounded bg-gray-800"
          placeholder="Số ❄️ cần cộng"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          Cộng Bông Tuyết
        </button>

        {result && (
          <pre className="whitespace-pre-wrap bg-gray-900 p-3 rounded text-sm">
            {result}
          </pre>
        )}

        <div className="text-xs text-white/40 mt-2">
          Backend: https://faceswap-backend-clean.fly.dev
        </div>
      </div>
    </div>
  );
}