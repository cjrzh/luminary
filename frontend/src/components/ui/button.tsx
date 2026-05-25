import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-amber-400 text-zinc-950 hover:bg-amber-300",
        variant === "secondary" &&
          "border border-white/10 bg-white/10 text-zinc-100 hover:bg-white/15",
        variant === "ghost" && "text-zinc-300 hover:bg-white/10 hover:text-white",
        className,
      )}
      {...props}
    />
  );
}
