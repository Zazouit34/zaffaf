import { auth, db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'sonner';

const FAVORITES_COLLECTION = 'favorites';

export interface FavoriteVenue {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: string;
  image: string;
  city?: string;
  userId: string;
  createdAt: number;
}

export const addToFavorites = async (venue: Omit<FavoriteVenue, 'userId' | 'createdAt'>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des favoris');
      return false;
    }

    const favoriteRef = doc(db, FAVORITES_COLLECTION, `${user.uid}_${venue.id}`);
    await setDoc(favoriteRef, {
      ...venue,
      userId: user.uid,
      createdAt: Date.now()
    });

    toast.success(`La salle "${venue.name}" a été sauvegardée`);
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    toast.error('Erreur lors de l\'ajout aux favoris');
    return false;
  }
};

export const removeFromFavorites = async (venueId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté pour gérer vos favoris');
      return false;
    }

    const favoriteRef = doc(db, FAVORITES_COLLECTION, `${user.uid}_${venueId}`);
    await deleteDoc(favoriteRef);
    
    toast.success('Supprimé des favoris');
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    toast.error('Erreur lors de la suppression des favoris');
    return false;
  }
};

export const getUserFavorites = async (): Promise<FavoriteVenue[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return [];
    }

    const favoritesQuery = query(
      collection(db, FAVORITES_COLLECTION),
      where('userId', '==', user.uid)
    );
    
    const snapshot = await getDocs(favoritesQuery);
    return snapshot.docs.map(doc => doc.data() as FavoriteVenue);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    toast.error('Erreur lors de la récupération des favoris');
    return [];
  }
};

export const checkIsFavorite = async (venueId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    const favoritesQuery = query(
      collection(db, FAVORITES_COLLECTION),
      where('userId', '==', user.uid),
      where('id', '==', venueId)
    );
    
    const snapshot = await getDocs(favoritesQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}; 