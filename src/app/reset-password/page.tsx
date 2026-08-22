"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { resetPassword, isResetting } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValid = password.length >= 8 && confirmPassword.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing password reset token.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({ token, password });
      toast.success("Password reset successfully! Redirecting to login…");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      const msg = getErrorMessage(err) || "Failed to reset password.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-[var(--background)] to-[var(--surface-secondary)]">
      <div className="w-full max-w-md p-8 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#003EC7] opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#003EC7] opacity-10 blur-3xl rounded-full"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            New Password
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Enter your new password below
          </p>
        </div>

        {!token && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-lg text-xs font-medium text-center">
            Missing reset token. Please click the link in your email again.
          </div>
        )}

        {token && (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!isValid || isResetting}
              className="w-full py-3.5 px-4 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isResetting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                "Save Password"
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-[var(--muted)] relative z-10">
          Back to{" "}
          <Link
            href="/login"
            className="font-semibold text-[#003EC7] hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-linear-to-b from-[var(--background)] to-[var(--surface-secondary)]">
          <div className="text-[var(--muted)]">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
