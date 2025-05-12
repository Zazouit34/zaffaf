'use server';

import axios from 'axios';
import pLimit from 'p-limit';
import { cities } from '@/app/data/cities';

interface VenuePhoto {
  photo_reference: string;
  width: number;
  height: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: string;
  image: string;
  isFavorite: boolean;
  city?: string;
  types?: string[];
  
  // Additional fields from Places API
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

// Placeholder image to use if no photo is available
const PLACEHOLDER_IMAGE = '/images/image-venue-landing.png';

// Different search terms to find diverse venue types
const searchTerms = [
  "salle des fetes mariage",
  "lieu de mariage",
  "salle de reception mariage", 
  "espace evenementiel mariage",
  "hotel mariage"
];

// Relevant place types for wedding venues
const RELEVANT_TYPES = [
  "banquet_hall",
  "event_venue",
  "restaurant",
  "lodging",
  "hotel",
  "establishment",
  "food",
  "point_of_interest",
  "premise",
  "tourist_attraction",
  "room",
  "bar"
];

// Minimum rating threshold
const MIN_RATING = 3.5;

// Helper function to delay execution for a specific amount of time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if a place is relevant based on its types
const isRelevantVenue = (place: any): boolean => {
  // Check if it has any relevant types
  if (!place.types || !Array.isArray(place.types)) {
    return false;
  }
  
  // Check if any of the place's types match our relevant types
  return place.types.some((type: string) => RELEVANT_TYPES.includes(type));
};

// Helper function to transform Google Places results into our venue format
const transformPlacesToVenues = (places: any[], city: string, apiKey: string): Venue[] => {
  return places
    .filter(place => {
      // Filter by relevant types
      const hasRelevantType = isRelevantVenue(place);
      
      // Filter by minimum rating threshold
      // If no rating available, we'll still include it (giving benefit of the doubt)
      const hasGoodRating = !place.rating || place.rating >= MIN_RATING;
      
      return hasRelevantType && hasGoodRating;
    })
    .map((place: any) => {
      // Get a photo URL if available
      let photoUrl = PLACEHOLDER_IMAGE;
      
      if (place.photos && place.photos.length > 0) {
        try {
          const photoReference = place.photos[0].photo_reference;
          if (photoReference) {
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${apiKey}`;
          }
        } catch (photoError) {
          console.warn('Error getting photo for venue:', photoError);
          photoUrl = PLACEHOLDER_IMAGE;
        }
      }
      
      // Default price range since Google Places doesn't provide pricing
      const priceRange = "Prix: Sur demande";
      
      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || 0,
        price: priceRange,
        image: photoUrl,
        isFavorite: false,
        city: city,
        types: place.types
      };
    });
};

// Function to fetch venues for a specific city and search term with pagination
async function fetchVenuesWithTerm(city: string, searchTerm: string, apiKey: string, maxPages: number = 2): Promise<Venue[]> {
  let allVenues: Venue[] = [];
  let nextPageToken: string | null = null;
  let currentPage = 0;
  
  try {
    do {
      // For the first page, use the standard query
      // For subsequent pages, use the nextPageToken
      const searchUrl: string = nextPageToken
        ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
        : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}+${encodeURIComponent(city)}+Algeria&key=${apiKey}`;
      
      // Wait 2 seconds before requesting with a next_page_token (Google's requirement)
      if (nextPageToken) {
        await delay(2000);
      }
      
      const response: any = await axios.get(searchUrl);
      
      if (response.data.status !== 'OK' || !response.data.results) {
        console.warn(`No results for ${city} with term "${searchTerm}" on page ${currentPage + 1}: ${response.data.status}`);
        break;
      }
      
      // Transform and add venues (filtering happens in transformPlacesToVenues)
      const venues = transformPlacesToVenues(response.data.results, city, apiKey);
      allVenues = [...allVenues, ...venues];
      
      // Get the next page token if available
      nextPageToken = response.data.next_page_token || null;
      
      currentPage++;
      
      // Break if we've reached maxPages
      if (currentPage >= maxPages) {
        break;
      }
      
    } while (nextPageToken);
    
    return allVenues;
    
  } catch (error) {
    console.error(`Error fetching venues for ${city} with term "${searchTerm}":`, error);
    return [];
  }
}

// Function to fetch venues for a specific city with multiple search terms
async function fetchVenuesForCity(city: string, apiKey: string): Promise<Venue[]> {
  try {
    // Create a rate limiter for search terms - max 2 concurrent searches per city
    const limit = pLimit(2);
    
    // Create search term promises with rate limiting
    const searchPromises = searchTerms.map(term => 
      limit(() => fetchVenuesWithTerm(city, term, apiKey))
    );
    
    // Wait for all search term results
    const termResults = await Promise.all(searchPromises);
    
    // Combine and deduplicate results
    const allVenues = termResults.flat();
    const uniqueVenues = Array.from(new Map(allVenues.map(v => [v.id, v])).values());
    
    return uniqueVenues;
  } catch (error) {
    console.error(`Error fetching venues for ${city}:`, error);
    return [];
  }
}

export async function fetchVenues(): Promise<Venue[]> {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Google Places API key is not defined');
    }
    
    // Create a rate limiter with max 3 concurrent requests for cities
    const cityLimit = pLimit(3);
    
    // Create an array of promises for each city search with rate limiting
    const cityPromises = cities.map((city) =>
      cityLimit(() => fetchVenuesForCity(city, API_KEY))
    );
    
    // Wait for all city searches to complete
    const cityResults = await Promise.all(cityPromises);
    
    // Flatten the array of arrays into a single array of venues
    const allVenues = cityResults.flat();
    
    // Final deduplication of venues across all cities
    const uniqueVenues = Array.from(new Map(allVenues.map(v => [v.id, v])).values());
    
    console.log(`Fetched a total of ${uniqueVenues.length} unique venues across ${cities.length} cities`);
    
    // Return all unique venues
    return uniqueVenues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
}

// Function to fetch detailed venue data for a single place
export async function fetchVenueDetails(placeId: string): Promise<Venue | null> {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Google Places API key is not defined');
    }
    
    // Make request to Places Details API
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,place_id,formatted_address,formatted_phone_number,international_phone_number,geometry,website,rating,user_ratings_total,reviews,photos,types,opening_hours&key=${API_KEY}`;
    
    const response: any = await axios.get(detailsUrl);
    
    if (response.data.status !== 'OK' || !response.data.result) {
      console.error(`Failed to fetch details for place ${placeId}: ${response.data.status}`);
      return null;
    }
    
    const place = response.data.result;
    
    // Transform photos
    const photos = place.photos ? place.photos.map((photo: any) => ({
      reference: photo.photo_reference,
      width: photo.width,
      height: photo.height
    })) : [];
    
    // Create image URLs for up to 4 photos
    const imageUrls = photos.slice(0, 4).map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.reference}&key=${API_KEY}`
    );
    
    // Transform reviews
    const reviews = place.reviews ? place.reviews.map((review: any) => ({
      authorName: review.author_name,
      authorPhoto: review.profile_photo_url,
      rating: review.rating,
      text: review.text,
      time: review.time,
      relativeTime: review.relative_time_description,
      language: review.language
    })) : [];
    
    // Build venue object
    const venue: Venue = {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || 0,
      price: "Prix: Sur demande", // Default price since Google Places doesn't provide pricing
      image: imageUrls[0] || '/images/image-venue-landing.png', // First photo or fallback
      isFavorite: false,
      phoneNumber: place.formatted_phone_number,
      internationalPhoneNumber: place.international_phone_number,
      website: place.website,
      openingHours: {
        isOpen: place.opening_hours?.open_now,
        weekdayText: place.opening_hours?.weekday_text
      },
      photos: photos,
      reviews: reviews,
      placeUrl: `https://maps.google.com/?q=${place.name}&cid=${place.place_id}`,
      userRatingsTotal: place.user_ratings_total,
      location: place.geometry?.location,
      types: place.types
    };
    
    return venue;
    
  } catch (error) {
    console.error(`Error fetching venue details for ${placeId}:`, error);
    return null;
  }
} 