"use client";

import React, { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://faceswap-server.onrender.com";

type Theme = "dark" | "light";

type PaymentHistoryItem = {
  id: string;
  amount?: number;
  credits?: number;
  status?: string;
  provider?: string;
  created_at?: string;
};

const PACKS = [
  { id: "pack_36", label: "Gói 36❄️", credits: 36, priceText: "26.000đ", priceVnd: 26000 },
  { id: "pack_70", label: "Gói 70❄️", credits: 70, priceText: "52.000đ", priceVnd: 52000 },
  { id: "pack_150", label: "Gói 150❄️", credits: 150, priceText: "125.000đ", priceVnd: 125000 },
  { id: "pack_200", label: "Gói 200❄️", credits: 200, priceText: "185.000đ", priceVnd: 185000 },
  { id: "pack_400", label: "Gói 400❄️", credits: 400, priceText: "230.000đ", priceVnd: 230000 },
  { id: "pack_550", label: "Gói 550❄️", credits: 550, priceText: "375.000đ", priceVnd: 375000 },
  { id: "pack_750", label: "Gói 750❄️", credits: 750, priceText: "510.000đ", priceVnd: 510000 },
  { id: "pack_999", label: "Gói 999❄️", credits: 999, priceText: "760.000đ", priceVnd: 760000 },
  { id: "pack_1500", label: "Gói 1.500❄️", credits: 1500, priceText: "1.050.000đ", priceVnd: 1050000 },
  { id: "pack_2600", label: "Gói 2.600❄️", credits: 2600, priceText: "1.500.000đ", priceVnd: 1500000 },
  { id: "pack_4000", label: "Gói 4.000❄️", credits: 4000, priceText: "2.400.000đ", priceVnd: 2400000 },
  { id: "pack_7600", label: "Gói 7.600❄️", credits: 7600, priceText: "3.600.000đ", priceVnd: 3600000 },
  { id: "pack_10000", label: "Gói 10.000❄️", credits: 10000, priceText: "5.000.000đ", priceVnd: 5000000 },
];

// 👉 Component chính, KHÔNG export default, giữ nguyên toàn bộ UI/text của bé
function ShopPageContent() {
  const [userId, setUserId] = useState<string | null>(null);

  // theme
  const [theme, setTheme] = useState<Theme>("dark");
  const isDark = theme === "dark";

  // stripe checkout
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // daily free
  const [claimingFree, setClaimingFree] = useState(false);
  const [freeMessage, setFreeMessage] = useState<string | null>(null);

  // coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // payment tab
  const [paymentTab, setPaymentTab] = useState<"stripe" | "momo">("stripe");

  // history
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  useEffect(() => {
    const uid = localStorage.getItem("faceswap_user_id");
    setUserId(uid || null);

    const savedTheme = localStorage.getItem("zenitswap_shop_theme") as Theme | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  const setThemePersist = (t: Theme) => {
    setTheme(t);
    localStorage.setItem("zenitswap_shop_theme", t);
  };

  // ========== CHECKOUT STRIPE ==========
  const handleCheckout = async (packId: string) => {
    if (!userId) {
      setError(
        "Không tìm thấy tài khoản tạm, bạn hãy quay lại trang chính chạy lại giúp anh nha 😢"
      );
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

      let data: any = {};
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          data = await res.json();
        } else {
          console.error("Checkout non-JSON:", await res.text());
        }
      } catch (err) {
        console.error("Checkout parse error:", err);
      }

      if (res.ok && data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setError(data?.detail || "Không tạo được phiên thanh toán");
      }
    } catch (e: any) {
      setError(e?.message || "Có lỗi thanh toán rồi user ơi :<");
    } finally {
      setLoadingCheckout(false);
    }
  };

  // ========== DAILY FREE ==========
  const handleClaimFree = async () => {
    if (!userId) {
      setError("Không xác định được tài khoản, tải lại trang thử nhé 💦");
      return;
    }

    try {
      setClaimingFree(true);
      setFreeMessage(null);
      setError(null);

      const res = await fetch(`${API_URL}/credits/free/daily`, {
        method: "POST",
        headers: {
          "x-user-id": userId,
        },
      });

      let data: any = {};
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          data = await res.json();
        } else {
          console.error("Daily free non-JSON:", await res.text());
        }
      } catch (err) {
        console.error("Daily free parse error:", err);
      }

      if (!res.ok) {
        setFreeMessage(null);
        throw new Error(
          data?.detail || `Không nhận được Bông Tuyết miễn phí (${res.status})`
        );
      }

      const added = typeof data?.added === "number" ? data.added : 0;
      const msg =
        data?.message ||
        `Đã tặng cho bạn ${added}❄️ Bông Tuyết miễn phí hôm nay ✨`;
      setFreeMessage(msg);
    } catch (e: any) {
      setError(e?.message || "Nhận Bông Tuyết miễn phí bị lỗi rồi :<");
    } finally {
      setClaimingFree(false);
    }
  };

  // ========== COUPON (FE-only) ==========
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponPercent(0);
      setCouponMessage("Bạn nhập mã rồi hãy ấn áp dụng nha 😚");
      return;
    }

    if (code === "ZENIT97") {
      setCouponPercent(20);
      setCouponMessage("Đã áp dụng mã ZENIT97: Giảm 20% giá gói (hiển thị) ✨");
    } else if (code === "ZENIT999") {
      setCouponPercent(9,99);
      setCouponMessage("Đã áp dụng mã ZENIT999: Giảm 9,99% giá gói (hiển thị) 🔥");
    } else {
      setCouponPercent(0);
      setCouponMessage("Mã này không hợp lệ hoặc đã hết hạn rồi user ơi 🥲");
    }
  };

  // ========== HISTORY ==========
  const loadHistory = async () => {
    if (!userId) {
      setError("Không xác định được tài khoản, tải lại trang thử nhé 💦");
      return;
    }

    try {
      setLoadingHistory(true);
      setError(null);

      const res = await fetch(`${API_URL}/payment/history`, {
        headers: {
          "x-user-id": userId,
        },
      });

      let data: any = {};
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          data = await res.json();
        } else {
          console.error("History non-JSON:", await res.text());
        }
      } catch (err) {
        console.error("History parse error:", err);
      }

      if (!res.ok) {
        throw new Error(
          data?.detail || `Không tải được lịch sử thanh toán (${res.status})`
        );
      }

      if (Array.isArray(data)) {
        setPaymentHistory(data);
      } else if (Array.isArray(data?.items)) {
        setPaymentHistory(data.items);
      } else {
        setPaymentHistory([]);
      }
    } catch (e: any) {
      setError(e?.message || "Không tải được lịch sử thanh toán rồi :<");
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next && paymentHistory.length === 0) {
      loadHistory();
    }
  };

  // ========== UI CLASS ==========
  const containerClass = isDark
    ? "min-h-screen bg-[#050607] text-white"
    : "min-h-screen bg-slate-50 text-slate-900";

  const cardClass = isDark
    ? "bg-[#181818] border border-[#2b2b2b]"
    : "bg-white border border-slate-200";

  const subtleText = isDark ? "text-slate-300" : "text-slate-600";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={containerClass}>
      <div className="max-w-[520px] mx-auto px-4 py-6 flex flex-col gap-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            className={
              "text-[13px] px-3 py-1 rounded-xl border " +
              (isDark
                ? "bg-[#111] border-[#2b2b2b] text-slate-100"
                : "bg-white border-slate-200 text-slate-700")
            }
            onClick={() => (window.location.href = "/")}
          >
            ← Về trang chính
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-lime-300">
              Shop Bông Tuyết ❄️
            </span>
            <button
              className={
                "w-8 h-8 rounded-full text-[11px] flex items-center justify-center border " +
                (isDark
                  ? "bg-[#111] border-[#2b2b2b] text-yellow-300"
                  : "bg-white border-slate-200 text-yellow-500")
              }
              onClick={() =>
                setThemePersist(isDark ? "light" : "dark")
              }
              title="Đổi giao diện sáng/tối"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* BANNER SHOP */}
        <div
          className={
            "rounded-3xl p-4 border relative overflow-hidden " +
            (isDark
              ? "bg-gradient-to-r from-[#111827] via-[#0f172a] to-black border-[#1f2937]"
              : "bg-gradient-to-r from-sky-100 via-indigo-100 to-white border-slate-200")
          }
        >
          <div className="relative z-10">
            <div className="text-[11px] uppercase tracking-wide text-lime-300 font-semibold">
              ZenitSwap Credits
            </div>
            <div className="mt-1 text-[18px] font-bold">
              Bông Tuyết TD cho ảnh & video AI UHD
            </div>
            <div className={"mt-1 text-[12px] " + subtleText}>
              Nạp Bông Tuyết để hoán đổi khuôn mặt UHD, hỗ trợ cả ảnh & video, xử lý trực tiếp trên ZenitSwap.
            </div>

            {/* FREE CLAIM */}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] items-center">
              <button
                onClick={handleClaimFree}
                disabled={claimingFree}
                className="px-3 py-1.5 rounded-full bg-lime-400 text-black font-semibold disabled:bg-slate-500 disabled:text-slate-200"
              >
                {claimingFree ? "Đang nhận free..." : "🎁 Nhận Bông Tuyết miễn phí mỗi ngày"}
              </button>
              <span className={mutedText}>
                1 lần / ngày • Tặng Bông Tuyết dùng thử(Bông Tuyết Miễn Phí không được cộng dồn sang ngày hôm sau!)
              </span>
            </div>

            {freeMessage && (
              <div className="mt-2 text-[11px] text-lime-300">
                {freeMessage}
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute right-3 bottom-1 text-5xl opacity-20">
            ❄️
          </div>
        </div>

        {/* COUPON + PAYMENT TABS */}
        <div className={"rounded-2xl p-3 flex flex-col gap-3 " + cardClass}>
          {/* COUPON */}
          <div>
            <div className="text-[12px] font-semibold mb-1">Coupon giảm giá</div>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Nhập mã (vd: ZENITH10, ZENITH20)"
                className={
                  "flex-1 rounded-xl px-3 py-2 text-[12px] outline-none border " +
                  (isDark
                    ? "bg-[#0b0b0b] border-[#333] text-slate-100 placeholder:text-slate-500"
                    : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400")
                }
              />
              <button
                onClick={handleApplyCoupon}
                className="px-3 py-2 rounded-xl bg-lime-400 text-black text-[12px] font-semibold"
              >
                Áp dụng
              </button>
            </div>
            {couponMessage && (
              <div
                className={
                  "mt-1 text-[11px] " +
                  (couponPercent > 0 ? "text-lime-300" : "text-red-300")
                }
              >
                {couponMessage}
              </div>
            )}
          </div>

          {/* TABS */}
          <div className="flex rounded-xl overflow-hidden border border-[#2a2a2a] text-[12px]">
            <button
              className={
                "flex-1 py-2 text-center " +
                (paymentTab === "stripe"
                  ? "bg-lime-400 text-black font-semibold"
                  : isDark
                  ? "bg-[#111] text-slate-300"
                  : "bg-slate-100 text-slate-700")
              }
              onClick={() => setPaymentTab("stripe")}
            >
              Stripe / Thẻ quốc tế
            </button>
            <button
              className={
                "flex-1 py-2 text-center " +
                (paymentTab === "momo"
                  ? "bg-lime-400 text-black font-semibold"
                  : isDark
                  ? "bg-[#111] text-slate-300"
                  : "bg-slate-100 text-slate-700")
              }
              onClick={() => setPaymentTab("momo")}
            >
              Momo / VietQR
            </button>
          </div>
        </div>

        {/* STRIPE PACKS */}
        {paymentTab === "stripe" && (
          <div className={"rounded-2xl p-4 space-y-3 " + cardClass}>
            <div className="text-[13px] font-semibold mb-1">
              Gói Bông Tuyết (Thanh toán Stripe)
            </div>
            <div className={mutedText + " text-[11px] mb-2"}>
              Thanh toán tự động, cộng Bông Tuyết ngay sau khi hệ thống xác nhận thành công.
            </div>

            <div className="space-y-3">
              {PACKS.map((p, idx) => {
                const finalPrice =
                  couponPercent > 0
                    ? Math.round(p.priceVnd * (1 - couponPercent / 100))
                    : p.priceVnd;

                const bestDeal = p.id === "pack_150" || p.id === "pack_550";

                return (
                  <div
                    key={p.id}
                    className={
                      "flex items-center justify-between rounded-2xl px-3 py-2.5 border " +
                      (isDark
                        ? "bg-[#111111]/70 border-[#2b2b2b]"
                        : "bg-white border-slate-200")
                    }
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold">
                          {p.label}
                        </span>
                        {bestDeal && (
                          <span className="px-2 py-0.5 rounded-full bg-lime-400 text-black text-[10px] font-semibold">
                            BEST DEAL
                          </span>
                        )}
                      </div>
                      <span className={mutedText + " text-[11px]"}>
                        Nhận {p.credits}❄️ Bông Tuyết để dùng swap ảnh & video
                      </span>
                      {couponPercent > 0 && (
                        <span className="text-[11px] text-lime-300">
                          Đã giảm {couponPercent}% • còn{" "}
                          {finalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>
                    <button
                      disabled={loadingCheckout}
                      onClick={() => handleCheckout(p.id)}
                      className="px-3 py-2 rounded-xl bg-lime-400 text-black text-[12px] font-semibold disabled:bg-slate-500 disabled:text-slate-200"
                    >
                      {couponPercent > 0
                        ? finalPrice.toLocaleString("vi-VN") + "đ"
                        : p.priceText}
                    </button>
                  </div>
                );
              })}
            </div>

            {loadingCheckout && (
              <div className={"mt-2 text-[11px] " + subtleText}>
                Đang tạo phiên thanh toán cho bạn, đợi xíu nha…
              </div>
            )}
          </div>
        )}

        {/* MOMO / VIETQR (manual) */}
        {paymentTab === "momo" && (
          <div className={"rounded-2xl p-4 space-y-3 " + cardClass}>
            <div className="text-[13px] font-semibold mb-1">
              Thanh toán qua Momo / VietQR
            </div>
            <div className={mutedText + " text-[11px]"}>
              •Bạn vui lòng chuyển khoản theo thông tin bên dưới rồi chụp màn hình build/hóa đơn rồi gửi qua Zalo để được cộng
              Bông Tuyết nha 💖
              •Lưu ý: Chuyển khoản đúng thông tin để được xử lý,thông tin chuyể khoản là của NV đổi tiền NDT của tôi,vì tôi là người TQ.Xin cảm ơn!
            </div>

            <div
              className={
                "rounded-2xl p-3 border " +
                (isDark ? "border-[#333] bg-[#0b0b0b]" : "border-slate-200 bg-slate-50")
              }
            >
              <div className="text-[12px] font-semibold mb-1">
                Thông tin chuyển khoản
              </div>
              <ul className={"text-[11px] space-y-1 " + subtleText}>
                <li>• Ngân hàng: MB BANK</li>
                <li>• Số tài khoản: 86862699969999</li>
                <li>• Chủ tài khoản(N.V.T.G Đổi Tiền NDT $): SAM BA VUONG</li>
                <li>
                  • Nội dung: <b>ID USER + SỐ BÔNG TUYẾT</b>
                </li>
              </ul>
              <div className="mt-2 text-[11px] text-lime-300">
                Sau khi chuyển, chụp màn hình & gửi qua Zalo chủ Shop: 0856 848 557 để được cộng Bông Tuyết.
              </div>
            </div>

            <div
              className={
                "rounded-2xl p-3 border " +
                (isDark ? "border-[#333] bg-[#0b0b0b]" : "border-slate-200 bg-slate-50")
              }
            >
              <div className="text-[12px] font-semibold mb-1">
                Mã QR (Momo / VietQR)
              </div>
              <div
                className={
                  "w-full h-40 rounded-2xl border flex items-center justify-center text-[11px] " +
                  (isDark ? "border-[#333] text-slate-400" : "border-slate-300 text-slate-500")
                }
              >
                Chỗ này bé thay bằng ảnh QR thật (Momo / VietQR) nha
              </div>
            </div>
          </div>
        )}

        {/* HISTORY SHOP */}
        <div className={"rounded-2xl p-3 flex flex-col gap-2 " + cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold">
                Lịch sử mua Bông Tuyết
              </div>
              <div className={mutedText + " text-[11px]"}>
                Hiển thị các giao dịch nạp Bông Tuyết của tài khoản hiện tại.
              </div>
            </div>
            <button
              onClick={toggleHistory}
              className="text-[11px] px-3 py-1 rounded-full bg-[#111]/70 border border-[#2b2b2b]"
            >
              {showHistory ? "Ẩn lịch sử" : "Xem lịch sử"}
            </button>
          </div>

          {showHistory && (
            <div className="mt-2 max-h-[260px] overflow-y-auto space-y-2 text-[11px]">
              {loadingHistory && (
                <div className={subtleText}>
                  Đang tải lịch sử thanh toán cho bé…
                </div>
              )}

              {!loadingHistory && paymentHistory.length === 0 && (
                <div className={mutedText}>
                  Chưa có giao dịch nào, bé thử nạp gói đầu tiên xem sao 😘
                </div>
              )}

              {!loadingHistory &&
                paymentHistory.length > 0 &&
                paymentHistory.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl px-3 py-2 border border-[#333] bg-[#101010]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[12px]">
                          {p.credits ?? "??"}❄️ Bông Tuyết
                        </div>
                        <div className={mutedText}>
                          {p.amount
                            ? `${p.amount.toLocaleString("vi-VN")}đ`
                            : "Số tiền không rõ"}{" "}
                          • {p.provider || "Stripe"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={
                            "font-semibold " +
                            (p.status === "paid"
                              ? "text-lime-300"
                              : p.status === "pending"
                              ? "text-yellow-300"
                              : "text-red-300")
                          }
                        >
                          {p.status || "unknown"}
                        </div>
                        <div className={mutedText + " text-[10px]"}>
                          {p.created_at}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ERROR GLOBAL */}
        {error && (
          <div className="mt-2 text-[12px] text-red-100 bg-red-500/40 border border-red-400/70 px-3 py-2 rounded-xl">
            {error}
          </div>
        )}

        {/* FOOTER */}
        <div className={"mt-4 text-[10px] text-center " + mutedText}>
          Shop Bông Tuyết ZenitSwap ❄ — Made with Quang Hổ Master — Zalo: 0856 848 557
        </div>
      </div>
    </div>
  );
}

// 👉 Wrapper responsive cho mọi thiết bị, không đụng text của bé
function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="w-full max-w-[520px] px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-6">
        {children}
      </div>
    </div>
  );
}

// 👉 Chỉ CÒN 1 default export duy nhất
export default function ShopPage() {
  return (
    <ResponsiveContainer>
      <ShopPageContent />
    </ResponsiveContainer>
  );
}