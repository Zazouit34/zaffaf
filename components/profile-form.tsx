import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin?: boolean;
  createdAt?: any;
}

interface ProfileFormProps {
  userData: UserData;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProfileForm({ userData, userId, onSuccess, onCancel }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Le prénom et le nom sont requis");
      return;
    }

    try {
      setLoading(true);
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Update Firestore document
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        firstName,
        lastName,
        displayName: fullName,
        updatedAt: serverTimestamp()
      });
      
      // Update Firebase Auth profile if user is the current user
      if (auth.currentUser && auth.currentUser.uid === userId) {
        await updateProfile(auth.currentUser, {
          displayName: fullName
        });
      }
      
      // Call success callback
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur s'est produite lors de la mise à jour du profil");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Modifier votre profil</h2>
        <p className="text-sm text-muted-foreground">
          Mettez à jour vos informations personnelles
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="edit-firstName">Prénom</Label>
          <Input
            id="edit-firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="edit-lastName">Nom</Label>
          <Input
            id="edit-lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            value={userData.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            L'adresse email ne peut pas être modifiée
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Mise à jour..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
} 