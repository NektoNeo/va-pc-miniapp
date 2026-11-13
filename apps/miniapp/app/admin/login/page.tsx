"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@vapc/ui/components/button";
import { Input } from "@vapc/ui/components/input";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Ошибка авторизации");
        return;
      }

      toast.success("Вход выполнен успешно");

      // Redirect to original destination or admin home
      const redirect = searchParams.get("redirect") || "/admin";
      router.push(redirect);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#2A1A3A] to-[#1A1A1A] p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">VA-PC</h1>
          <p className="mt-2 text-lg text-white/60">Панель администратора</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-[#9D4EDD]/20 bg-white/5 p-8 backdrop-blur-lg"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@va-pc.ru"
                required
                disabled={isLoading}
                className="border-[#9D4EDD]/20 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-white"
              >
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="border-[#9D4EDD]/20 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#9D4EDD] text-white hover:bg-[#9D4EDD]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </Button>

        </form>

        {/* Back to site link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-[#9D4EDD] hover:text-[#9D4EDD]/80"
          >
            ← Вернуться на сайт
          </Link>
        </div>
      </div>
    </div>
  );
}
