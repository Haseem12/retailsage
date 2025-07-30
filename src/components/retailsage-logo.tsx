import { cn } from "@/lib/utils";

export default function RetailSageLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-8 h-8", className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 80H45L45 60L35 60L35 20L70 20V40H50L50 80H75L75 20C75 8.95431 66.0457 0 55 0L35 0C23.9543 0 15 8.95431 15 20L15 80H20Z"
        className="fill-primary"
      />
    </svg>
  );
}
