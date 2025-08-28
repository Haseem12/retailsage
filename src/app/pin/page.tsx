
import PinLockScreen from "@/components/pin-lock-screen";

export default function PinPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')", filter: 'blur(2px) brightness(0.4)' }}
      ></div>
      <PinLockScreen />
    </main>
  );
}
