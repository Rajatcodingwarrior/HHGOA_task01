"use client";

import React, { useEffect, useState } from "react";

export default function EventTimer() {
  const targetDate = new Date("2026-10-28T09:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="font-mono text-[9px] bg-accent/10 text-accent border border-accent/20 px-3 py-1.5 rounded-sm select-none uppercase tracking-wider">
        🚀 HACKER HOUSE GOA 2026 HAS BEGUN!
      </div>
    );
  }

  const formatNum = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex flex-col gap-2 w-full max-w-md font-mono select-none my-6">
      <span className="text-[7.5px] text-accent/80 font-bold tracking-[0.25em] uppercase">
        ⏳ EVENT DEPARTURE COUNTDOWN:
      </span>

      <div className="grid grid-cols-4 gap-2">
        {/* Days */}
        <div className="flex flex-col items-center bg-[#01371e] border border-[#ebb614]/30 rounded-sm p-2 text-center">
          <span className="text-[20px] md:text-[24px] font-extrabold text-[#ebb614] leading-none">
            {formatNum(timeLeft.days)}
          </span>
          <span className="text-[6.5px] text-white/50 tracking-wider uppercase mt-1">DAYS</span>
        </div>

        {/* Hours */}
        <div className="flex flex-col items-center bg-[#01371e] border border-[#ebb614]/30 rounded-sm p-2 text-center">
          <span className="text-[20px] md:text-[24px] font-extrabold text-[#ebb614] leading-none">
            {formatNum(timeLeft.hours)}
          </span>
          <span className="text-[6.5px] text-white/50 tracking-wider uppercase mt-1">HOURS</span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center bg-[#01371e] border border-[#ebb614]/30 rounded-sm p-2 text-center">
          <span className="text-[20px] md:text-[24px] font-extrabold text-[#ebb614] leading-none">
            {formatNum(timeLeft.minutes)}
          </span>
          <span className="text-[6.5px] text-white/50 tracking-wider uppercase mt-1">MINS</span>
        </div>

        {/* Seconds */}
        <div className="flex flex-col items-center bg-[#01371e] border border-[#ebb614]/30 rounded-sm p-2 text-center">
          <span className="text-[20px] md:text-[24px] font-extrabold text-[#ebb614] leading-none animate-pulse">
            {formatNum(timeLeft.seconds)}
          </span>
          <span className="text-[6.5px] text-white/50 tracking-wider uppercase mt-1">SECS</span>
        </div>
      </div>
    </div>
  );
}
