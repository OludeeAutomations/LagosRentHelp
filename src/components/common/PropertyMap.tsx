// components/PropertyMap.tsx
import React, { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";
import StreetViewModal from "./StreetViewMap";

interface PropertyMapProps {
  address: string;
  height?: string;
  showStreetViewButton?: boolean;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  address,
  height = "256px",
  showStreetViewButton = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [error, setError] = useState("");
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);
  const [isStreetViewModalOpen, setIsStreetViewModalOpen] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", initializeMap);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      setStatus("error");
      setError("Failed to load Google Maps");
    };

    document.head.appendChild(script);

    async function initializeMap() {
      if (!mapRef.current) return;

      try {
        const map = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: { lat: 40.7128, lng: -74.006 },
          mapTypeId: "satellite",
          mapTypeControl: true,
          mapId: "febe7f4b8621c1169df35bb2",
        });

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address }, async (results, status) => {
          if (status === "OK" && results?.[0]) {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(17);

            // Use AdvancedMarkerElement
            const { AdvancedMarkerElement } = (await google.maps.importLibrary(
              "marker"
            )) as google.maps.MarkerLibrary;

            new AdvancedMarkerElement({
              map,
              position: location,
              title: address,
            });

            // Check Street View availability
            const streetViewService = new google.maps.StreetViewService();
            streetViewService.getPanorama(
              {
                location: location,
                radius: 50,
              },
              (data, streetViewStatus) => {
                setStreetViewAvailable(streetViewStatus === "OK");
              }
            );

            setStatus("loaded");
          } else {
            setStatus("error");
            setError("Address not found");
          }
        });
      } catch (err) {
        setStatus("error");
        setError("Error initializing map");
      }
    }

    return () => {
      const script = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (script) {
        script.removeEventListener("load", initializeMap);
      }
    };
  }, [address]);

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
          className="w-full rounded-lg border border-gray-200"
        />

        {/* Street View Button */}
        {showStreetViewButton && streetViewAvailable && (
          <button
            onClick={() => setIsStreetViewModalOpen(true)}
            className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Navigation className="h-4 w-4" />
            Street View
          </button>
        )}
      </div>

      {/* Street View Modal */}
      <StreetViewModal
        isOpen={isStreetViewModalOpen}
        onClose={() => setIsStreetViewModalOpen(false)}
        address={address}
      />
    </>
  );
};

export default PropertyMap;
