import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Routing = ({ source, destination, setDistance }) => {
  useEffect(() => {
    if (!source || !destination) return;

    const calculateOSRMDistance = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=false`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const distanceInKm = (data.routes[0].distance / 1000).toFixed(2);
          setDistance(parseFloat(distanceInKm));
        }
      } catch (error) {
        console.error("OSRM routing error:", error);
        // Fallback distance
        setDistance(500);
      }
    };

    calculateOSRMDistance();
  }, [source, destination]);

  return null;
};

export default function RideMap({ source, destination, setDistance }) {
  return (
    <MapContainer
      center={[13.0827, 80.2707]}  // Chennai default
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {source && (
        <Marker position={[source.lat, source.lng]}>
          <Popup>
            <div>
              <strong>Start Location</strong><br/>
              Lat: {source.lat.toFixed(4)}, Lng: {source.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      )}
      
      {destination && (
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>
            <div>
              <strong>Destination</strong><br/>
              Lat: {destination.lat.toFixed(4)}, Lng: {destination.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      )}
      
      <Routing
        source={source}
        destination={destination}
        setDistance={setDistance}
      />
    </MapContainer>
  );
}