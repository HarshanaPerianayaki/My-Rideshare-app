import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ROUTE_COLORS = ["#2563EB", "#7C3AED", "#16A34A", "#EA580C"];

// Auto bounds fitting sub-component
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

// Geocoding function to convert city name to coordinates
const geocodeLocation = async (cityName) => {
  try {
    // Add India location bias (lat=20, lon=78 = center of India)
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(cityName + ' India')}&limit=1&lat=20&lon=78`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      // Validate coordinates are within India bounds
      if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
        return { lat, lng };
      } else {
        console.warn(`Coordinates outside India for ${cityName}: ${lat}, ${lng}`);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Get route from OSRM API with fallback
const getRoute = async (pickup, drop) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  // Try OSRM first
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (data.code === 'Ok') {
      const coords = data.routes[0].geometry.coordinates;
      const polyline = coords.map(([lng, lat]) => [lat, lng]);
      const distance = (data.routes[0].distance / 1000).toFixed(1);
      const duration = Math.round(data.routes[0].duration / 60);
      return { coordinates: polyline, distance, duration };
    }
  } catch (e) {
    clearTimeout(timeoutId);
    console.warn('OSRM failed or timed out, using straight line fallback:', e);
    // Fallback: draw straight line with haversine distance
    const R = 6371;
    const dLat = (drop.lat - pickup.lat) * Math.PI / 180;
    const dLng = (drop.lng - pickup.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(pickup.lat * Math.PI / 180) *
      Math.cos(drop.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const distance = (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
    return {
      coordinates: [[pickup.lat, pickup.lng], [drop.lat, drop.lng]],
      distance,
      duration: Math.round(distance / 60 * 60),
      isStraightLine: true
    };
  }
};

const DynamicRouteMap = ({ locationPairs = [] }) => {
  const [routes, setRoutes] = useState([]);
  const [resolvedPairs, setResolvedPairs] = useState([]); // stores geocoded coords per pair
  const [distances, setDistances] = useState([]);
  const [durations, setDurations] = useState([]);
  const [bounds, setBounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (locationPairs.length === 0) {
      setLoading(false);
      return;
    }

    const processRoutes = async () => {
      try {
        setLoading(true);
        setError(null);

        const processedRoutes = [];
        const processedResolved = [];
        const processedDistances = [];
        const processedDurations = [];
        const allBounds = [];

        // Process each location pair
        for (let i = 0; i < locationPairs.length; i++) {
          const pair = locationPairs[i];

          // Get coordinates (geocode if needed)
          let pickupCoords, dropCoords;

          if (pair.pickupLat && pair.pickupLng) {
            pickupCoords = { lat: pair.pickupLat, lng: pair.pickupLng };
          } else if (pair.pickupLabel) {
            pickupCoords = await geocodeLocation(pair.pickupLabel);
            if (!pickupCoords) {
              console.warn(`Could not locate pickup: ${pair.pickupLabel}`);
              continue; // Skip this pair
            }
          } else {
            throw new Error(`No pickup coordinates or label for pair ${i + 1}`);
          }

          if (pair.dropLat && pair.dropLng) {
            dropCoords = { lat: pair.dropLat, lng: pair.dropLng };
          } else if (pair.dropLabel) {
            dropCoords = await geocodeLocation(pair.dropLabel);
            if (!dropCoords) {
              console.warn(`Could not locate drop: ${pair.dropLabel}`);
              continue; // Skip this pair
            }
          } else {
            throw new Error(`No drop coordinates or label for pair ${i + 1}`);
          }

          // Get route from OSRM
          const route = await getRoute(pickupCoords, dropCoords);

          if (route) {
            processedRoutes.push({
              coordinates: route.coordinates,
              color: ROUTE_COLORS[i % ROUTE_COLORS.length],
              isStraightLine: route.isStraightLine
            });

            // Store resolved coords so markers always have a position
            processedResolved.push({
              ...pair,
              pickupLat: pickupCoords.lat,
              pickupLng: pickupCoords.lng,
              dropLat: dropCoords.lat,
              dropLng: dropCoords.lng,
            });

            processedDistances.push(route.distance);
            processedDurations.push(route.duration);

            // Add bounds for auto-fitting
            allBounds.push([pickupCoords.lat, pickupCoords.lng]);
            allBounds.push([dropCoords.lat, dropCoords.lng]);
          } else {
            console.warn(`Could not get route for pair ${i + 1}`);
          }
        }

        setRoutes(processedRoutes);
        setResolvedPairs(processedResolved);
        setDistances(processedDistances);
        setDurations(processedDurations);
        setBounds(allBounds);
      } catch (err) {
        setError(err.message);
        console.error('Route processing error:', err);
      } finally {
        setLoading(false);
      }
    };

    processRoutes();
  }, [locationPairs]);


  // Create custom icons
  const createCustomIcon = (color, label) => {
    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">${label}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  const pickupIcon = (index) => createCustomIcon('#16A34A', 'P');
  const dropIcon = (index) => createCustomIcon('#DC2626', 'D');

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div>Loading route map...</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (routes.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#666', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        width: '48px',
        height: '48px',
        backgroundColor: '#f9fafb',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ color: '#9ca3af', fontSize: '24px' }}>📍</span>
      </div>
      <div>Could not load route. Please check city names and try again.</div>
    </div>
  );

  return (
    <div className="dynamic-route-map">
      <MapContainer
        style={{ height: '420px', width: '100%' }}
        zoom={13}
        center={bounds[0] || [13.0827, 80.2707]}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds to show all routes */}
        <FitBounds bounds={bounds} />

        {/* Render route polylines */}
        {routes.map((route, index) => (
          <Polyline
            key={index}
            positions={route.coordinates}
            color={route.color}
            weight={route.isStraightLine ? 2 : 4}
            opacity={route.isStraightLine ? 0.6 : 0.8}
            dashArray={route.isStraightLine ? "10, 10" : null}
          />
        ))}

        {/* Render pickup and drop markers */}
        {resolvedPairs.map((pair, index) => {
          const pickupPos = [pair.pickupLat, pair.pickupLng];
          const dropPos = [pair.dropLat, pair.dropLng];
          const color = ROUTE_COLORS[index % ROUTE_COLORS.length];

          return (
            <div key={index}>
              <Marker position={pickupPos} icon={pickupIcon(index)}>
                <Popup>
                  <div style={{ padding: '8px' }}>
                    <strong style={{ color: '#16A34A' }}>🟢 Pickup {index + 1}</strong><br />
                    {pair.pickupLabel}
                  </div>
                </Popup>
              </Marker>

              <Marker position={dropPos} icon={dropIcon(index)}>
                <Popup>
                  <div style={{ padding: '8px' }}>
                    <strong style={{ color: '#DC2626' }}>🔴 Drop {index + 1}</strong><br />
                    {pair.dropLabel}
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}

      </MapContainer>

      {/* Distance Info Panel */}
      <div className="route-info-panel">
        {routes.some(route => route.isStraightLine) && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: '#fef3c7',
            fontSize: '12px',
            color: '#92400e',
            marginBottom: '8px',
            border: '1px solid #fbbf24'
          }}>
            ⚠️ Some routes are shown as straight lines (dashed) due to routing service limitations
          </div>
        )}
        {locationPairs.map((pair, i) => (
          <div key={i} style={{ borderLeft: `4px solid ${ROUTE_COLORS[i % ROUTE_COLORS.length]}` }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>{pair.pickupLabel}</span>
            <span style={{ color: '#6b7280' }}> → </span>
            <span style={{ fontWeight: '600', color: '#374151' }}>{pair.dropLabel}</span>
            <span style={{ color: '#6b7280' }}> : </span>
            <span style={{ fontWeight: '600', color: '#059669' }}>{distances[i]} km</span>
            <span style={{ color: '#6b7280' }}> | </span>
            <span style={{ fontWeight: '600', color: '#7c3aed' }}>{durations[i]} mins</span>
            {routes[i]?.isStraightLine && (
              <span style={{ color: '#92400e', fontSize: '11px', marginLeft: '4px' }}>(straight line)</span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .dynamic-route-map {
          width: 100%;
          border-radius: 14px;
          overflow: hidden;
          margin-top: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        
        .route-info-panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 10px;
        }
        
        .route-info-panel > div {
          padding: 8px 12px;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          display: flex;
          gap: 8px;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .dynamic-route-map.loading,
        .dynamic-route-map.error,
        .dynamic-route-map.empty {
          width: 100%;
          height: 420px;
          border-radius: 14px;
          overflow: hidden;
          margin-top: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          background: #f9fafb;
          border: 2px dashed #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default DynamicRouteMap;
