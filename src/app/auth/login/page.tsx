"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, continueAsGuest } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!login.trim() || !password.trim()) {
      setError("Fill in all fields, survivor.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (isRegister && password.length < 6) {
      setError("Password too short. Min 6 characters.");
      return;
    }

    setLoading(true);

    const result = isRegister
      ? await signUp(login.trim(), password)
      : await signIn(login.trim(), password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <img
          src="/images/fish-logo.png"
          alt="FishAI"
          className="w-32 h-auto mx-auto mb-4 animate-float drop-shadow-[0_0_12px_rgba(200,176,106,0.2)]"
        />
        <h1 className="font-game text-lg text-[#c8b06a] mb-2 tracking-wider">
          {isRegister ? "Join the Village" : "Enter the Village"}
        </h1>
        <p className="text-xs text-[#777]">
          {isRegister
            ? "Create an account. Or continue as guest."
            : "Sign in to save catches and track scores."}
        </p>
      </div>

      <div className="rust-card">
        <div className="relative z-10">
          {/* Tab switcher */}
          <div className="flex" style={{ borderBottom: "1px solid rgba(80, 72, 58, 0.4)" }}>
            <button
              onClick={() => { setIsRegister(false); setError(""); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                !isRegister
                  ? "text-white"
                  : "text-[#666] hover:text-[#999]"
              }`}
              style={!isRegister ? { background: "rgba(140, 80, 40, 0.5)" } : {}}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                isRegister
                  ? "text-white"
                  : "text-[#666] hover:text-[#999]"
              }`}
              style={isRegister ? { background: "rgba(140, 80, 40, 0.5)" } : {}}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-[10px] text-[#888] mb-1.5 uppercase tracking-widest">
                Login
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="your_nickname"
                className="input-rust"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#888] mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="--------"
                className="input-rust"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                disabled={loading}
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-[10px] text-[#888] mb-1.5 uppercase tracking-widest">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="--------"
                  className="input-rust"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="text-xs px-3 py-2" style={{ color: "#cd6133", background: "rgba(180, 60, 40, 0.1)", border: "1px solid rgba(180, 60, 40, 0.3)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-rust w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  {isRegister ? "Creating..." : "Signing in..."}
                </>
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 px-5">
            <div className="flex-1 h-px" style={{ background: "rgba(80, 72, 58, 0.4)" }} />
            <span className="text-[10px] text-[#555] uppercase tracking-widest">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(80, 72, 58, 0.4)" }} />
          </div>

          {/* Guest button */}
          <div className="p-5 pt-4">
            <button
              onClick={handleGuest}
              className="btn-rust-outline w-full"
            >
              Continue as Guest
            </button>
            <p className="text-center text-[10px] text-[#555] mt-2">
              Guest data is stored locally only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
