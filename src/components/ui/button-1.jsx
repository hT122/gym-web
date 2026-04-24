import React from "react";
import { Spinner } from "./spinner-1";
import clsx from "clsx";

const sizes = [
  {
    tiny:   "px-1.5 h-6 text-sm",
    small:  "px-1.5 h-8 text-sm",
    medium: "px-2.5 h-10 text-sm",
    large:  "px-3.5 h-12 text-base",
  },
  {
    tiny:   "w-6 h-6 text-sm",
    small:  "w-8 h-8 text-sm",
    medium: "w-10 h-10 text-sm",
    large:  "w-12 h-12 text-base",
  },
];

const types = {
  primary:   "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-fg)]",
  secondary: "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] border border-[var(--color-border)]",
  tertiary:  "bg-transparent hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]",
  error:     "bg-[var(--color-danger-text)] hover:opacity-90 text-white",
  warning:   "bg-amber-500 hover:bg-amber-600 text-black",
};

const shapes = {
  square:  { tiny: "rounded",    small: "rounded-md", medium: "rounded-md", large: "rounded-lg" },
  circle:  { tiny: "rounded-full", small: "rounded-full", medium: "rounded-full", large: "rounded-full" },
  rounded: { tiny: "rounded-full", small: "rounded-full", medium: "rounded-full", large: "rounded-full" },
};

export const Button = ({
  size = "medium",
  type = "primary",
  variant = "styled",
  shape = "square",
  svgOnly = false,
  children,
  prefix,
  suffix,
  shadow = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className,
  ...rest
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      tabIndex={0}
      className={clsx(
        "flex justify-center items-center gap-0.5 duration-150 cursor-pointer font-medium",
        sizes[+svgOnly][size],
        (disabled || loading)
          ? "opacity-40 cursor-not-allowed"
          : types[type],
        shapes[shape][size],
        fullWidth && "w-full",
        variant === "unstyled" ? "outline-none px-0 h-fit bg-transparent hover:bg-transparent" : "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
        className
      )}
      {...rest}
    >
      {loading ? <Spinner size={size === "large" ? 24 : 16} /> : prefix}
      <span className={clsx(
        "relative overflow-hidden whitespace-nowrap overflow-ellipsis font-sans",
        size !== "tiny" && variant !== "unstyled" && "px-1.5"
      )}>
        {children}
      </span>
      {!loading && suffix}
    </button>
  );
};
