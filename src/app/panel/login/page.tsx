"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("Geçersiz e-posta veya şifre", "Invalid email or password"));
      setLoading(false);
    } else {
      router.push("/panel/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-6">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Logo variant="square" width={64} height={64} link={false} className="mx-auto mb-6" />
          <h1 className="font-serif text-2xl mb-2">{t("Satış Paneli", "Sales Panel")}</h1>
          <p className="text-mist text-sm">{t("Sadece Yetkili Personel", "Internal Use Only")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label={t("E-posta", "Email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@ersandiamond.com" required />
          <Input label={t("Şifre", "Password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            {t("Giriş Yap", "Sign In")}
          </Button>
        </form>
      </div>
    </div>
  );
}
