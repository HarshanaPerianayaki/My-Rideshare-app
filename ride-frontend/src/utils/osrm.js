export const calculateDistance = async (pickup, drop) => {
  try {
    // First geocode the locations
    const pickupCoords = await geocodeLocation(pickup);
    const dropCoords = await geocodeLocation(drop);
    
    // Then calculate distance using OSRM
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropCoords.lng},${dropCoords.lat}?overview=false`
    );
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const distanceInKm = (data.routes[0].distance / 1000).toFixed(2);
      return parseFloat(distanceInKm);
    }
    
    throw new Error("Unable to calculate distance");
  } catch (error) {
    console.error("Distance calculation error:", error);
    // Fallback to hardcoded distance for demo
    return 500; // 500km fallback
  }
};

export const geocodeLocation = async (place) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
  );

  const data = await response.json();

  if (data.length === 0) {
    throw new Error("Location not found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
};
