import { cn } from "@/lib/tailwind/utils";

export interface AvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export default function Avatar({ name = "A", size = "md" }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 font-semibold text-white ring-2 ring-indigo-500/20",
        sizes[size],
      )}
    >
      {initial}
    </div>
  );
}
