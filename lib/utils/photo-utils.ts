/**
 * Utility functions for handling photos from Google Places API
 */

/**
 * Constructs a photo URL for Google Places API photos
 * @param photoReference The photo reference from Google Places API
 * @param maxWidth The maximum width of the photo
 * @returns A string URL to the photo
 */
export function constructPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  const PHOTO_BASE_URL = 'https://maps.googleapis.com/maps/api/place/photo';
  const GOOGLE_API_KEY = 'AIzaSyCX0FSwT9Mb7vrv_5jzLy3aOfSEdta38s8';
  return `${PHOTO_BASE_URL}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
} 