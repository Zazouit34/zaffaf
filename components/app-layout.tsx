"use client";

import { Container } from "@/components/container";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = false }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !loading && !user) {
      router.push("/login");
    }
  }, [requireAuth, user, loading, router]);

  if (requireAuth && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <>
      <AppHeader />
      <main className="py-8">
        <Container>{children}</Container>
      </main>
    </>
  );
} 