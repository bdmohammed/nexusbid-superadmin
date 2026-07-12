import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/tailwind/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E4E1EE] rounded-2xl shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
