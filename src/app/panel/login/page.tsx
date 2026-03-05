"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  // OTP state
  const [step, setStep] = useState<Step>("credentials");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendOtp = useCallback(async () => {
    setOtpSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("OTP gönderilemedi", "Failed to send OTP"));
      } else {
        setResendTimer(60);
      }
    } catch {
      setError(t("Bağlantı hatası", "Network error"));
    } finally {
      setOtpSending(false);
    }
  }, [email, t]);

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
      return;
    }

    // Check if OTP is needed
    try {
      const checkRes = await fetch("/api/auth/otp/check");
      const checkData = await checkRes.json();
      if (checkData.trusted) {
        router.push("/panel/dashboard");
        return;
      }
    } catch {
      // On error, require OTP
    }

    // Need OTP — send it (both email + SMS)
    setStep("otp");
    setLoading(false);
    await sendOtp();
  };

  const handleOtpComplete = async (code: string) => {
    setOtpVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || t("Geçersiz kod", "Invalid code"));
        setOtpValues(Array(6).fill(""));
        setOtpVerifying(false);
        return;
      }
      router.push("/panel/dashboard");
    } catch {
      setError(t("Bağlantı hatası", "Network error"));
      setOtpVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtpValues(Array(6).fill(""));
    await sendOtp();
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-6">
        <div className="absolute top-6 right-6">
          <LanguageToggle />
        </div>
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mx-auto mb-6">
              <Shield size={24} className="text-brand-gold" />
            </div>
            <h1 className="font-serif text-2xl mb-2">{t("Doğrulama Kodu", "Verification Code")}</h1>
            <p className="text-mist text-sm">
              {t(
                "E-posta ve SMS olarak gönderilen 6 haneli kodu girin",
                "Enter the 6-digit code sent via email and SMS"
              )}
            </p>
            <p className="text-xs text-mist/60 mt-1">{email}</p>
          </div>

          <OtpInput
            value={otpValues}
            onChange={setOtpValues}
            onComplete={handleOtpComplete}
            disabled={otpVerifying}
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {otpVerifying && (
            <p className="text-brand-gold text-sm text-center animate-pulse">
              {t("Doğrulanıyor...", "Verifying...")}
            </p>
          )}

          <div className="space-y-3">
            {/* Resend */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-mist">
                  {t("Tekrar gönder", "Resend in")} ({resendTimer}s)
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={otpSending}
                  className="text-xs text-brand-gold hover:text-brand-gold/80 transition-colors disabled:opacity-50"
                >
                  {otpSending
                    ? t("Gönderiliyor...", "Sending...")
                    : t("Kodu Tekrar Gönder", "Resend Code")}
                </button>
              )}
            </div>

            {/* Back to login */}
            <button
              onClick={() => { setStep("credentials"); setError(""); setOtpValues(Array(6).fill("")); }}
              className="w-full text-center text-xs text-mist hover:text-brand-white transition-colors py-2"
            >
              ← {t("Giriş ekranına dön", "Back to login")}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <Input label={t("E-posta", "Email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@ersandiamonds.com" required />
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
