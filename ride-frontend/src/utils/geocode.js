export const geocodeLocation = async (place) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
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