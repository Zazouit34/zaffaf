'use server';

import { cache } from 'react';

export interface GooglePlacePhoto {
  photo_reference: string;
  width: number;
  height: number;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: GooglePlacePhoto[];
  opening_hours?: {
    open_now: boolean;
  };
  formatted_phone_number?: string;
  international_phone_number?: string;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    profile_photo_url?: string;
  }>;
  price_level?: number;
  website?: string;
  vicinity?: string;
}

export interface VenuesSearchResult {
  results: GooglePlaceResult[];
  next_page_token?: string;
  status: string;
}

export interface VenueDetailsResult {
  result: GooglePlaceResult;
  status: string;
}

const GOOGLE_API_KEY = 'AIzaSyCX0FSwT9Mb7vrv_5jzLy3aOfSEdta38s8';
const PHOTO_BASE_URL = 'https://maps.googleapis.com/maps/api/place/photo';

// Helper function to get photo URL from photo reference
export async function getPhotoUrl(photoReference: string, maxWidth: number = 400): Promise<string> {
  return `${PHOTO_BASE_URL}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

// Search for wedding venues in Bordj Bouarreridj, Algeria
export const searchWeddingVenues = cache(async (pageToken?: string): Promise<VenuesSearchResult> => {
  try {
    // Search for wedding venues in Bordj Bouarreridj
    const query = 'wedding venues in Bordj Bouarreridj Algeria';
    const endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    
    const url = new URL(endpoint);
    url.searchParams.append('query', query);
    url.searchParams.append('key', GOOGLE_API_KEY);
    
    if (pageToken) {
      url.searchParams.append('pagetoken', pageToken);
    }
    
    const response = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Cache for 1 hour
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data: VenuesSearchResult = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching wedding venues:', error);
    return { results: [], status: 'ERROR' };
  }
});

// Get details for a specific venue
export const getVenueDetails = cache(async (placeId: string): Promise<VenueDetailsResult | null> => {
  try {
    const endpoint = 'https://maps.googleapis.com/maps/api/place/details/json';
    
    const url = new URL(endpoint);
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('fields', 'name,formatted_address,rating,user_ratings_total,photos,opening_hours,formatted_phone_number,international_phone_number,reviews,price_level,website,vicinity');
    url.searchParams.append('key', GOOGLE_API_KEY);
    
    const response = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Cache for 1 hour
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data: VenueDetailsResult = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching venue details:', error);
    return null;
  }
}); 