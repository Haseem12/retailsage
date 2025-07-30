import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')", filter: 'blur(2px) brightness(0.4)' }}
        data-ai-hint="leafy greens"
      ></div>
      <LoginForm />
    </main>
  );
}
