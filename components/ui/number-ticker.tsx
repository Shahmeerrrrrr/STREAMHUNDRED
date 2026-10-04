"use client";

import React from "react";
import NumberFlow, { type Value, type Format } from "@number-flow/react";
import { cn } from "@/lib/utils";

export type NumberTickerProps = {
  value: Value;
  label?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  format?: Format;
  showDot?: boolean;
  className?: string;
  numberClassName?: string;
  labelClassName?: string;
};

/**
 * NumberTicker - High-fidelity statistics counter with animated digit rolling
 */
export function NumberTicker({
  value,
  label,
  prefix,
  suffix,
  decimals = 0,
  format,
  showDot = true,
  className,
  numberClassName,
  labelClassName,
}: NumberTickerProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {showDot && (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      )}

      <NumberFlow
        value={value}
        prefix={prefix}
        suffix={suffix}
        format={
          format || {
            notation: "standard",
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }
        }
        className={cn("tabular-nums", numberClassName)}
      />

      {label && (
        <span className={cn("text-xs font-medium text-white/75", labelClassName)}>
          {label}
        </span>
      )}
    </div>
  );
}

export default NumberTicker;
