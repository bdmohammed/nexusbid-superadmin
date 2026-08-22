"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090a0f] text-white p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#11131c]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-10 text-center shadow-2xl relative z-10">
        <div className="inline-flex p-4 bg-red-500/10 rounded-2xl text-red-500 mb-6 border border-red-500/20">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
          403 Forbidden
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed text-sm">
          Access Denied. The initial system installation and setup wizard has
          already been completed. Further administrator registration is blocked.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Sign In
        </button>
      </div>
    </div>
  );
}
