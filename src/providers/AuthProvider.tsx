"use client";

import { useEffect } from "react";
import { useCurrentUser } from "@/features/auth/api/queries";
import { useAuthStore } from "@/features/auth/store/store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useCurrentUser();

  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    if (isLoading) return;
    console.log('initialize')
    initialize(user as any ?? null);
  }, [isLoading, user, initialize]);

  return children;
}