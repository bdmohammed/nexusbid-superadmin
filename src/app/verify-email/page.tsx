"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { verifyEmail, resendVerification, isResendingVerification } =
    useAuth();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [email, setEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendSuccess(false);
    setResendError("");
    try {
      await resendVerification(email);
      setResendSuccess(true);
      setEmail("");
    } catch (err: any) {
      setResendError(
        getErrorMessage(err) || "Failed to resend. Please try again.",
      );
    }
  };

  useEffect(() => {
    if (token) {
      setStatus("loading");
      verifyEmail(token)
        .then(() => {
          setStatus("success");
          setTimeout(() => {
            router.push("/login");
          }, 4000);
        })
        .catch((err: any) => {
          setStatus("error");
          setErrorMsg(
            getErrorMessage(err) ||
              "Verification failed. The token may be invalid or expired.",
          );
        });
    } else {
      setStatus("error");
      setErrorMsg(
        "No verification token provided. Check the link sent to your email.",
      );
    }
  }, [token, verifyEmail, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-[var(--background)] to-[var(--surface-secondary)]">
      <div className="w-full max-w-md p-8 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-xl relative overflow-hidden text-center">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#003EC7] opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#003EC7] opacity-10 blur-3xl rounded-full"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] mb-6">
            Email Verification
          </h1>

          {status === "loading" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-10 w-10 text-[#003EC7]"
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
              </div>
              <p className="text-[var(--muted)]">
                Verifying your email address...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
              </div>
              <p className="text-green-500 font-semibold">
                Email Verified Successfully!
              </p>
              <p className="text-xs text-[var(--muted)]">
                Redirecting to the login page...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center text-xl font-bold">
                  ✕
                </div>
              </div>
              <p className="text-red-500 font-semibold">{errorMsg}</p>
              <div className="pt-4 flex justify-center gap-4">
                <Link
                  href="/login"
                  className="inline-block py-2.5 px-6 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-lg shadow-md transition-all duration-200"
                >
                  Back to Login
                </Link>
              </div>

              <div className="pt-6 border-t border-[var(--border)] mt-6 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Need a new verification link?
                </p>
                <form onSubmit={handleResendSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted)] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#003EC7] focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isResendingVerification || !email}
                    className="w-full py-2.5 bg-[#003EC7] hover:bg-[#002fad] text-white font-semibold rounded-lg text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isResendingVerification
                      ? "Sending..."
                      : "Request New Link"}
                  </button>
                </form>
                {resendSuccess && (
                  <p className="text-green-600 font-semibold mt-2 text-xs">
                    ✓ Verification link sent successfully!
                  </p>
                )}
                {resendError && (
                  <p className="text-red-500 font-semibold mt-2 text-xs">
                    ✕ {resendError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-linear-to-b from-[var(--background)] to-[var(--surface-secondary)]">
          <div className="text-[var(--muted)]">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
