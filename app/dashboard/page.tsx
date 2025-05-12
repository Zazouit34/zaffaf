"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/firebase";

import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { ProfileEditDialog } from "@/components/profile-edit-dialog";
import { AppLayout } from "@/components/app-layout";

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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

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

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleProfileUpdate = () => {
    // Refresh user data after profile update
    fetchUserData();
  };

  if (loadingUserData) {
    return (
      <AppLayout requireAuth={true}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requireAuth={true}>
      <h1 className="text-3xl font-bold font-nunito mb-6">Tableau de bord</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Bienvenue sur Zaffaf</h2>
          <p className="text-muted-foreground mb-4">
            Vous êtes maintenant connecté à votre compte. Commencez à explorer les lieux de mariage disponibles.
          </p>
          <Link href="/venues" className="w-full">
            <Button className="w-full">Découvrir les lieux</Button>
          </Link>
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
          {userData && user && (
            <ProfileEditDialog 
              userData={userData} 
              userId={user.uid} 
              onProfileUpdate={handleProfileUpdate}
            >
              <Button variant="outline" className="w-full">
                Modifier le profil
              </Button>
            </ProfileEditDialog>
          )}
        </div>
        
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Favoris</h2>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore de lieux favoris.
          </p>
          <Button variant="secondary" className="w-full">Explorer</Button>
        </div>
      </div>
    </AppLayout>
  );
} 