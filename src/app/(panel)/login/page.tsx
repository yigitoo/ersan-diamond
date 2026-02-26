"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      setError("Ge\u00e7ersiz email veya \u015fifre");
      setLoading(false);
    } else {
      router.push("/panel/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Logo variant="square" width={64} height={64} link={false} className="mx-auto mb-6" />
          <h1 className="font-serif text-2xl mb-2">Panel Login</h1>
          <p className="text-mist text-sm">Ersan Diamond Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@ersandiamond.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
