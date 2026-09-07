import React, { useEffect, useState } from "react";
import { holidaysOn } from "./holidays";
import { language } from "./translations";

export function useHolidays() {
  const [holidays, setHolidays] = useState(() =>
    holidaysOn(new Date(), language),
  );
  useEffect(() => {
    let timer;
    function refresh() {
      clearTimeout(timer);
      const now = new Date();
      setHolidays(holidaysOn(now, language));
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      timer = setTimeout(refresh, Math.max(1000, midnight - now + 100));
    }
    refresh();
    const resume = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", resume);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);
  return holidays;
}
const regions = {
  us: "United States",
  pt: "Portugal",
  jp: "Japan",
  la: "Louisiana",
};
const flags = { us: "us.png", pt: "pt.svg", jp: "jp.svg", la: "la.svg" };
export function HolidayBanner({ holidays }) {
  if (!holidays.length) return null;
  return (
    <aside
      className="holiday-strip"
      data-region={holidays[0].region}
      aria-label={
        { en: "Today's holidays", pt: "Feriados de hoje", ja: "今日の祝日" }[
          language
        ]
      }
    >
      <div
        className="holiday-confetti"
        aria-hidden="true"
        key={holidays.map((h) => h.key).join(",")}
      >
        {Array.from({ length: 16 }, (_, i) => (
          <i
            key={i}
            style={{
              "--x": `${(i * 37 + 3) % 100}%`,
              "--delay": `${(i % 4) * 0.15}s`,
              "--turn": `${i % 2 ? 80 : -60}deg`,
            }}
          />
        ))}
      </div>
      <div className="holiday-strip-content" tabIndex={0}>
        {holidays.map((holiday) => (
          <span className="holiday-message" key={holiday.key}>
            <span className="holiday-flags">
              {holiday.regions.map((region) => (
                <img
                  key={region}
                  src={`/images/flags/${flags[region]}`}
                  width="21"
                  height="14"
                  alt={regions[region]}
                  title={regions[region]}
                />
              ))}
            </span>
            <span>{holiday.name}</span>
          </span>
        ))}
      </div>
    </aside>
  );
}
