import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export async function searchWeddingVenues(city) {
  try {
    // Search for wedding venues in the specified city
    const searchResponse = await axios.get(`${BASE_URL}/textsearch/json`, {
      params: {
        query: `wedding venues in ${city} Algeria`,
        key: API_KEY,
        language: 'fr'
      }
    });

    const venues = [];
    const results = searchResponse.data.results;

    // For each result, get detailed information
    for (const result of results) {
      const placeId = result.place_id;
      const detailsResponse = await axios.get(`${BASE_URL}/details/json`, {
        params: {
          place_id: placeId,
          key: API_KEY,
          language: 'fr',
          fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,reviews,photos,opening_hours,geometry,price_level'
        }
      });

      const placeDetails = detailsResponse.data.result;
      
      // Process photos to get URLs
      const images = placeDetails.photos 
        ? placeDetails.photos.slice(0, 4).map(photo => 
            `${BASE_URL}/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=${API_KEY}`)
        : ['/images/image-venue-landing.png'];

      // Process reviews
      const reviews = placeDetails.reviews 
        ? placeDetails.reviews.map(review => ({
            id: `r${Math.random().toString(36).substr(2, 9)}`,
            user: review.author_name,
            date: new Date(review.time * 1000).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            rating: review.rating,
            comment: review.text
          }))
        : [];

      // Create venue object with all required fields
      venues.push({
        id: placeId,
        name: placeDetails.name,
        address: placeDetails.formatted_address,
        rating: placeDetails.rating || 4.5,
        price: placeDetails.price_level 
          ? '€'.repeat(placeDetails.price_level) + ' - ' + '€'.repeat(placeDetails.price_level + 1)
          : "€€€ - €€€€",
        image: images[0],
        description: result.business_status === "OPERATIONAL" 
          ? "Un lieu de mariage élégant avec un excellent service et des installations modernes." 
          : "Ce lieu de mariage offre un cadre magnifique pour votre cérémonie et réception.",
        capacity: "Jusqu'à 300 invités",
        amenities: ["Espace de cérémonie", "Salle de réception", "Traiteur", "Parking", "Climatisation", "Sonorisation"],
        contactPhone: placeDetails.formatted_phone_number || placeDetails.international_phone_number || "+213 00 00 00 00",
        contactEmail: `contact@${placeDetails.name.toLowerCase().replace(/\s/g, '')}.dz`,
        website: placeDetails.website || `https://www.${placeDetails.name.toLowerCase().replace(/\s/g, '')}.dz`,
        googleMapsUrl: `https://maps.google.com/?q=${placeDetails.name}`,
        images: images,
        reviews: reviews,
        location: {
          lat: placeDetails.geometry.location.lat,
          lng: placeDetails.geometry.location.lng
        }
      });
    }
    
    return venues;
  } catch (error) {
    console.error("Error fetching wedding venues:", error);
    return [];
  }
}

export async function getCities() {
  return [
    { id: "bordj-bouarreridj", name: "Bordj Bou Arreridj" },
    { id: "algiers", name: "Alger" },
    { id: "setif", name: "Sétif" },
    { id: "oran", name: "Oran" },
    { id: "tlemcen", name: "Tlemcen" }
  ];
} 