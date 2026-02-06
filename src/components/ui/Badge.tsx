import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "score" | "pro" | "warning";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "text-[#999] border-[rgba(80,72,58,0.5)]",
    score: "text-[#c8b06a] border-[rgba(200,176,106,0.3)]",
    pro: "text-[#b070d0] border-[rgba(176,112,208,0.3)]",
    warning: "text-[#cd6133] border-[rgba(205,97,51,0.3)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
        variants[variant],
        className
      )}
      style={{ background: "rgba(50, 48, 38, 0.6)" }}
    >
      {children}
    </span>
  );
}
