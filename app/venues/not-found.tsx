import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VenueNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-muted p-6">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold font-nunito mb-3">Lieu non trouvé</h1>
        <p className="text-muted-foreground mb-8">
          Le lieu que vous recherchez n'existe pas ou a été supprimé.
        </p>
        
        <Button asChild>
          <Link href="/venues">
            Voir tous les lieux
          </Link>
        </Button>
      </div>
    </div>
  );
} 