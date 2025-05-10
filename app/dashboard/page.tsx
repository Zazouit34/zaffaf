"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
  createdAt: any;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          setLoadingUserData(true);
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserData(userSnap.data() as UserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoadingUserData(false);
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

  if (loading || loadingUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span className="font-bold text-2xl font-nunito text-primary">Zaffaf</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
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
            <Button variant="outline" size="sm" onClick={handleSignOut} className="whitespace-nowrap">
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-nunito mb-6">Tableau de bord</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Bienvenue sur Zaffaf</h2>
            <p className="text-muted-foreground mb-4">
              Vous êtes maintenant connecté à votre compte. Commencez à explorer les lieux de mariage disponibles.
            </p>
            <Button className="w-full">Découvrir les lieux</Button>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Votre profil</h2>
            {userData ? (
              <div className="mb-4 space-y-2">
                <p><span className="font-medium">Nom:</span> {userData.firstName} {userData.lastName}</p>
                <p><span className="font-medium">Email:</span> {userData.email}</p>
                <p><span className="font-medium">Membre depuis:</span> {userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
              </div>
            ) : (
              <p className="text-muted-foreground mb-4">
                Complétez votre profil pour une expérience personnalisée.
              </p>
            )}
            <Button variant="outline" className="w-full">Modifier le profil</Button>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Favoris</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de lieux favoris.
            </p>
            <Button variant="secondary" className="w-full">Explorer</Button>
          </div>
        </div>
      </main>
    </div>
  );
} 