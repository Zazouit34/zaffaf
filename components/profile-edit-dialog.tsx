import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile-form";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin?: boolean;
  createdAt?: any;
}

interface ProfileEditDialogProps {
  userData: UserData;
  userId: string;
  onProfileUpdate: () => void;
  children?: React.ReactNode;
}

export function ProfileEditDialog({
  userData,
  userId,
  onProfileUpdate,
  children
}: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onProfileUpdate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Modifier le profil</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <ProfileForm
          userData={userData}
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 