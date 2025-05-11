"use client";

import { useAuth } from "@/lib/auth-context";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export function AppHeader() {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserData(userSnap.data() as UserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <span className="font-bold text-2xl font-nunito text-primary">Zaffaf</span>
        </Link>
        {user ? (
          <div className="flex justify-between items-center w-full sm:w-auto sm:justify-end sm:gap-4">
            <div className="flex items-center gap-2">
              {userData?.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User size={16} className="text-muted-foreground" />
                </div>
              )}
              <span className="text-sm hidden sm:inline">
                Bonjour, {userData?.firstName || user.email?.split('@')[0]}
              </span>
              <span className="text-sm sm:hidden">
                {userData?.firstName || user.email?.split('@')[0]}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="whitespace-nowrap ml-4">
              Se déconnecter
            </Button>
          </div>
        ) : !loading ? (
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/login">
              <Button variant="outline" size="sm">Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">S'inscrire</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
} 