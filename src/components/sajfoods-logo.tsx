import { cn } from "@/lib/utils";

export default function SajFoodsLogo({ className }: { className?: string }) {
  return (
     <svg
      className={cn("w-8 h-8", className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0ZM50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85Z" className="fill-primary/20" />
        <path d="M62.5 25H37.5C30.5964 25 25 30.5964 25 37.5V62.5C25 69.4036 30.5964 75 37.5 75H62.5C69.4036 75 75 69.4036 75 62.5V37.5C75 30.5964 69.4036 25 62.5 25Z" className="fill-primary/50" />
        <path d="M50 37.5C43.0964 37.5 37.5 43.0964 37.5 50C37.5 56.9036 43.0964 62.5 50 62.5C56.9036 62.5 62.5 56.9036 62.5 50C62.5 43.0964 56.9036 37.5 50 37.5Z" className="fill-primary" />
    </svg>
  );
}
