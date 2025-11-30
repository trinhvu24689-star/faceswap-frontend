"use client";

import React from "react";

export default function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex justify-center">
      <div
        className="
          w-full
          max-w-[520px]
          px-3 sm:px-4 md:px-5
          pt-4 pb-8
          mx-auto
        "
      >
        {children}
      </div>
    </div>
  );
}