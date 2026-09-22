import { cn } from "../../lib/utils";

export function Skeleton({
  className,
  rounded = "md",
}: {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}) {
  const radius = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      aria-hidden
      className={cn("animate-pulse bg-sunken", radius, className)}
    />
  );
}
