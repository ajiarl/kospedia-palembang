"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

const labels: Record<number, string> = {
  1: "Buruk",
  2: "Kurang",
  3: "Cukup",
  4: "Baik",
  5: "Sangat baik",
};

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-100 hover:scale-110 hover:bg-amber-50 active:scale-95",
              star <= active ? "text-amber-400" : "text-muted-foreground/25 hover:text-amber-300"
            )}
            aria-label={`Rating ${star}`}
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <span className="text-sm font-medium text-muted-foreground">
          {labels[active]}
        </span>
      )}
    </div>
  );
}
