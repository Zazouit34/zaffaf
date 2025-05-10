"use client";

import { RegisterForm } from "@/components/register-form"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span className="font-bold text-2xl font-nunito text-primary">Zaffaf</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/images/zaffaf-landing.png"
          alt="Image de mariage"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="max-w-md text-center p-8">
            <h2 className="text-3xl font-bold font-nunito mb-4">Rejoignez notre communauté</h2>
            <p className="text-white/80">Créez un compte pour accéder à tous nos services et trouver le lieu de mariage parfait</p>
          </div>
        </div>
      </div>
    </div>
  )
} 