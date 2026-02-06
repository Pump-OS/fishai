export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-7 h-7", lg: "w-10 h-10" };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border border-[rgba(80,72,58,0.4)] border-t-[#c8b06a] animate-spin`}
      />
    </div>
  );
}
