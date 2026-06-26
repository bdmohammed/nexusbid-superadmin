"use client";

import { useState } from "react";
import {
  FileText,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function Login() {
  const [status, setStatus] = useState("idle");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (status !== "idle") return;

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
      }, 1000);
    }, 1500);
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-primary-light/40 blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-110">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <FileText size={20} />
              </div>
              <span className="text-lg font-semibold tracking-tight text-text">
                TenderPro
              </span>
            </div>
            <span className="mb-4 inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Super Admin
            </span>
            <h1 className="mb-1.5 text-2xl font-semibold text-text">
              Welcome Back
            </h1>
            <p className="text-sm text-text-light">
              Sign in to manage the enterprise marketplace
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface/80 p-6 shadow-xl shadow-border/30 backdrop-blur-xl sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="ml-1 text-sm font-medium text-text-light"
                >
                  Email Address
                </label>
                <div className="group relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light transition-colors group-focus-within:text-primary"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="admin@tenderpro.com"
                    className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-light/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-text-light"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-semibold text-primary transition-colors hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="group relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light transition-colors group-focus-within:text-primary"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="********"
                    className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-11 text-sm text-text placeholder:text-text-light/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-light transition-colors hover:text-text"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <label
                  htmlFor="remember"
                  className="select-none text-sm text-text-light"
                >
                  Stay signed in for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={status !== "idle"}
                className={
                  status === "success"
                    ? "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:active:scale-100 bg-green-600"
                    : "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:active:scale-100 bg-primary hover:bg-primary/90"
                }
              >
                {status === "idle" && (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
                {status === "loading" && (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                )}
                {status === "success" && (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Success</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
