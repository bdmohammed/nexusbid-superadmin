import { cn } from "@/lib/utils";

export default function Button({
    fullWidth = false,
  children,
  variant = "primary",
  size = "md",
  className,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}) {
  const variants = {
    primary:
      "bg-primary text-white hover:opacity-90 border border-primary",

    secondary:
      "bg-surface border border-border text-text hover:bg-sidebar-hover",

    danger:
      "bg-red-600 text-white hover:bg-red-700 border border-red-600",

    ghost:
      "bg-transparent hover:bg-sidebar-hover text-text",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {LeftIcon && <LeftIcon size={18} />}

      {children}

      {RightIcon && <RightIcon size={18} />}
    </button>
  );
}