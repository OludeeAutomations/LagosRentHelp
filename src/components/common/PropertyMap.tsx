import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Navigation } from "lucide-react";
import StreetViewModal from "./StreetViewMap";

interface PropertyMapProps {
  address: string;
  coordinates?: { lat: number; lng: number };
  height?: string;
  showStreetViewButton?: boolean;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  address,
  coordinates,
  height = "256px",
  showStreetViewButton = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [error, setError] = useState("");
  const [isStreetViewModalOpen, setIsStreetViewModalOpen] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        // If we already have an instance, just update it
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        let mapLat = coordinates?.lat;
        let mapLng = coordinates?.lng;

        // Fallback to geocoding if coordinates are missing
        if (!mapLat || !mapLng) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                address
              )}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
              mapLat = parseFloat(data[0].lat);
              mapLng = parseFloat(data[0].lon);
            }
          } catch (e) {
            console.error("Geocoding failed", e);
          }
        }

        if (!mapLat || !mapLng) {
          setStatus("error");
          setError("Location coordinates not found.");
          return;
        }

        const map = L.map(mapRef.current).setView([mapLat, mapLng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        markerRef.current = L.marker([mapLat, mapLng]).addTo(map).bindPopup(address);

        mapInstanceRef.current = map;
        setStatus("loaded");
      } catch (err) {
        console.error("Map initialization error", err);
        setStatus("error");
        setError("Error initializing map");
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address, coordinates]);

  if (status === "error") {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <div
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-lg border border-gray-200 z-0"
        />

        {/* Note: Street View is a Google Maps specific feature. 
            If the user wants to keep it, it will require Google Maps API.
            For now, we'll keep the button but it might need coordinates passed to the modal.
        */}
        {showStreetViewButton && (
          <button
            onClick={() => setIsStreetViewModalOpen(true)}
            className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Navigation className="h-4 w-4" />
            Street View
          </button>
        )}
      </div>

      <StreetViewModal
        isOpen={isStreetViewModalOpen}
        onClose={() => setIsStreetViewModalOpen(false)}
        address={address}
        coordinates={coordinates}
      />
    </>
  );
};

export default PropertyMap;
