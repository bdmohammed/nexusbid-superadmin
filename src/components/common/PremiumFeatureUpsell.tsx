"use client";

import React from "react";
import { Lock, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

interface PremiumFeatureUpsellProps {
  title: string;
  description: string;
  moduleName: string;
  icon: React.ComponentType<any>;
}

export default function PremiumFeatureUpsell({
  title,
  description,
  moduleName,
  icon: IconComponent,
}: PremiumFeatureUpsellProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/40 p-8 text-center backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-h-[500px] max-w-3xl mx-auto my-8">
      {/* Premium Gradient Glows */}
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-6">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Enterprise Feature Upgrade</span>
      </div>

      {/* Floating Icon Sphere */}
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-xl ring-8 ring-primary/5">
        <IconComponent className="h-12 w-12 animate-pulse" />
        <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-black border-2 border-surface shadow-md">
          ★
        </div>
      </div>

      <h2 className="text-4xl font-extrabold tracking-tight text-text">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base text-text-light leading-relaxed">
        {description}
      </p>

      {/* Value Proposition Grid */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 w-full max-w-2xl">
        <div className="flex gap-3 rounded-2xl border border-border/60 bg-surface/50 p-4 text-left">
          <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-text">Instant Data Access</h4>
            <p className="text-xs text-text-light mt-1">Unlock real-time syncing and comprehensive dashboards.</p>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl border border-border/60 bg-surface/50 p-4 text-left">
          <ShieldCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-text">Enterprise Controls</h4>
            <p className="text-xs text-text-light mt-1">Strict RBAC verification, lock draft concurrency & auditable actions.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => alert("Access upgrade request submitted to your system administrator.")}
          className="px-8 py-3.5 font-bold text-sm bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 shadow-lg shadow-primary/20"
        >
          Request Access Upgrade
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = "mailto:enterprise-sales@nexusbid.local?subject=Request Access Upgrade"}
          className="px-8 py-3.5 font-semibold text-sm border-border/80 hover:bg-background"
        >
          Contact Administrator
        </Button>
      </div>
    </div>
  );
}
