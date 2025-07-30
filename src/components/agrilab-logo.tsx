import { cn } from "@/lib/utils";

export default function AgriLabLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-8 h-8", className)}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 0L0 80H25L50 40L75 80H100L50 0Z"
        className="fill-primary"
      />
    </svg>
  );
}
