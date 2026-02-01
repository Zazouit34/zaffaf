// Geographic coordinates for major Algerian cities
// Format: [city name, latitude, longitude, radius in kilometers]
export const cityCoordinates: [string, number, number, number][] = [
  ["Alger", 36.7538, 3.0588, 30],
  ["Oran", 35.6969, -0.6331, 25],
  ["Setif", 36.1898, 5.4108, 20],
  ["Tlemcen", 34.8784, -1.3143, 20],
  ["Annaba", 36.9009, 7.7659, 20],
  ["Batna", 35.5569, 6.1742, 20],
  ["Constantine", 36.3650, 6.6147, 20],
  ["Blida", 36.4722, 2.8278, 20],
  ["Bejaia", 36.7513, 5.0567, 20],
  ["Tizi Ouzou", 36.7169, 4.0476, 20],
  ["Ain Defla", 36.2614, 1.9214, 20],
  ["Bordj Bouarreridj", 36.0730, 4.7631, 20],
];

// Calculate distance between two points using Haversine formula (in kilometers)
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Determine the actual city based on coordinates
export const determineActualCity = (
  location: { lat: number; lng: number } | undefined, 
  searchCity: string
): string => {
  // If no location data, return the search city
  if (!location || !location.lat || !location.lng) {
    return searchCity;
  }
  
  let closestCity = searchCity;
  let closestDistance = Number.MAX_VALUE;
  
  // Find the closest city
  for (const [city, lat, lng, radius] of cityCoordinates) {
    const distance = calculateDistance(location.lat, location.lng, lat, lng);
    
    // If within radius and closer than previous match
    if (distance <= radius && distance < closestDistance) {
      closestCity = city;
      closestDistance = distance;
    }
  }
  
  return closestCity;
}; 