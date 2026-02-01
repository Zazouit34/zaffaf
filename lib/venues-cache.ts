import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

// Minimal venue shape we cache; matches Venue in app/actions/venues.ts
export interface CachedVenue {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: string;
  image: string;
  isFavorite: boolean;
  city?: string;
  types?: string[];
  phoneNumber?: string;
  internationalPhoneNumber?: string;
  website?: string;
  openingHours?: {
    isOpen?: boolean;
    weekdayText?: string[];
  };
  photos?: {
    reference: string;
    width: number;
    height: number;
  }[];
  reviews?: {
    authorName: string;
    authorPhoto?: string;
    rating: number;
    text: string;
    time: number;
    relativeTime: string;
    language?: string;
  }[];
  placeUrl?: string;
  userRatingsTotal?: number;
  location?: {
    lat: number;
    lng: number;
  };
}

const VENUE_CACHE_COLLECTION = "venuesCache";
const SEARCH_CACHE_COLLECTION = "venueSearchCache";

export const ENABLE_GOOGLE_FETCH =
  (process.env.ENABLE_GOOGLE_FETCH || "").toLowerCase() === "true";

export const getCachedVenue = async (
  placeId: string
): Promise<CachedVenue | null> => {
  try {
    const ref = doc(db, VENUE_CACHE_COLLECTION, placeId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...(data.data as CachedVenue),
    };
  } catch (error) {
    console.error("Error reading cached venue:", error);
    return null;
  }
};

export const setCachedVenue = async (
  placeId: string,
  payload: CachedVenue
) => {
  try {
    const ref = doc(db, VENUE_CACHE_COLLECTION, placeId);
    await setDoc(ref, {
      data: payload,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error writing cached venue:", error);
  }
};

export const getCachedSearch = async (
  key: string
): Promise<CachedVenue[] | null> => {
  try {
    const ref = doc(db, SEARCH_CACHE_COLLECTION, key);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return (data.results || []) as CachedVenue[];
  } catch (error) {
    console.error("Error reading cached search:", error);
    return null;
  }
};

export const setCachedSearch = async (key: string, results: CachedVenue[]) => {
  try {
    const ref = doc(db, SEARCH_CACHE_COLLECTION, key);
    await setDoc(ref, {
      results,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error writing cached search:", error);
  }
};
