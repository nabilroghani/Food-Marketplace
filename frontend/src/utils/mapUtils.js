export const haversineDistanceKilometers = (from, to) => {
  if (
    from?.lat == null ||
    from?.lon == null ||
    to?.lat == null ||
    to?.lon == null
  ) {
    return Infinity;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLon = toRadians(to.lon - from.lon);
  const startLat = toRadians(from.lat);
  const endLat = toRadians(to.lat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(startLat) *
      Math.cos(endLat) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (earthRadius * c) / 1000;
};

export const getDistanceInKilometers = (from, to) => {
  return haversineDistanceKilometers(from, to);
};

export const fetchRoadRoute = async (origin, destination, signal) => {
  if (
    origin?.lat == null ||
    origin?.lon == null ||
    destination?.lat == null ||
    destination?.lon == null
  ) {
    return [];
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch route from OSRM.");
  }

  const data = await response.json();
  const coordinates = data?.routes?.[0]?.geometry?.coordinates;

  if (!coordinates?.length) {
    return [];
  }

  return coordinates.map(([lon, lat]) => [lat, lon]);
};
