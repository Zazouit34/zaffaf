'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { FavoriteVenue, getUserFavorites, onFavoriteChange } from '@/lib/favorites-service';
import { VenueCard } from '@/components/venue-card';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteVenue[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const userFavorites = await getUserFavorites();
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();

    // Listen for changes to favorites
    const unsubscribe = onFavoriteChange((venueId, isFavorite) => {
      // If a venue is removed from favorites, remove it from the local state
      if (!isFavorite) {
        setFavorites(prevFavorites => 
          prevFavorites.filter(venue => venue.id !== venueId)
        );
      } else {
        // If a venue is added to favorites while we're on this page, refresh the list
        loadFavorites();
      }
    });

    return () => {
      // Clean up the event listener when component unmounts
      unsubscribe();
    };
  }, []);

  return (
    <AppLayout requireAuth={true}>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Mes Salles Favorites</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Heart className="h-16 w-16 mx-auto text-gray-300" />
            <h2 className="text-xl font-medium text-gray-600">Aucune salle favorite</h2>
            <p className="text-gray-500">
              Enregistrez vos salles préférées pour les retrouver facilement
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((venue) => (
              <VenueCard
                key={venue.id}
                id={venue.id}
                name={venue.name}
                address={venue.address}
                rating={venue.rating}
                price={venue.price}
                image={venue.image}
                isFavorite={true}
                city={venue.city}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
} 