import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-zinc-100">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">登录 Luminary</h1>
          <p className="mt-2 text-sm text-zinc-500">登录后会保持常态会话，默认 90 天内无需重复登录。</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-5 text-xs text-zinc-600">请使用 .env 中配置的账号登录；未配置时使用开发默认账号。</p>
      </section>
    </main>
  );
}
