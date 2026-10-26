import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { ExternalLink, Navigation, Layers } from "lucide-react";

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
    "loading",
  );
  const [error, setError] = useState("");
  const [resolvedCoordinates, setResolvedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(coordinates ?? null);
  const [isSatellite, setIsSatellite] = useState(true);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const STREETS_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const SATELLITE_TILES =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const SATELLITE_ATTR =
    "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

  const primaryColor = "#129B36";
  const customIcon = L.divIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="${primaryColor}" stroke="white" stroke-width="1.5"/>
    </svg>`,
    className: "custom-marker-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const initializeMap = async () => {
      try {
        setStatus("loading");
        setError("");

        // If we already have an instance, just update it
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        let mapLat = coordinates?.lat;
        let mapLng = coordinates?.lng;

        // Fallback to progressively broader geocoding if coordinates are missing.
        // Area-review names can contain both a neighbourhood and a nearby district,
        // which a geocoder may not recognise when combined with the LGA.
        if (!mapLat || !mapLng) {
          const addressParts = address.split(",").map((part) => part.trim()).filter(Boolean);
          const country = addressParts[addressParts.length - 1] || "Nigeria";
          const state = addressParts[addressParts.length - 2] || "Lagos";
          const candidates = [
            address,
            addressParts[0] ? `${addressParts[0]}, ${state}, ${country}` : "",
            addressParts[1] ? `${addressParts[1]}, ${state}, ${country}` : "",
            `${state}, ${country}`,
          ].filter((candidate, index, list) => candidate && list.indexOf(candidate) === index);

          for (const candidate of candidates) {
            try {
              const params = new URLSearchParams({
                format: "jsonv2",
                q: candidate,
                countrycodes: "ng",
                limit: "1",
              });
              const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
                headers: { Accept: "application/json" },
              });
              if (!response.ok) continue;
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                mapLat = Number.parseFloat(data[0].lat);
                mapLng = Number.parseFloat(data[0].lon);
                break;
              }
            } catch (geocodingError) {
              console.error(`Geocoding failed for ${candidate}`, geocodingError);
            }
          }
        }

        if (!mapLat || !mapLng) {
          setStatus("error");
          setError("Location coordinates not found.");
          return;
        }

        setResolvedCoordinates({ lat: mapLat, lng: mapLng });

        const map = L.map(mapElement).setView([mapLat, mapLng], 15);

        const tiles = L.tileLayer(
          isSatellite ? SATELLITE_TILES : STREETS_TILES,
          {
            attribution: isSatellite
              ? SATELLITE_ATTR
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        ).addTo(map);

        tileLayerRef.current = tiles;

        markerRef.current = L.marker([mapLat, mapLng], { icon: customIcon })
          .addTo(map)
          .bindPopup(address);

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

  // Handle tile layer switching
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    // Remove current layer
    tileLayerRef.current.remove();

    // Create and add new layer
    const newTiles = L.tileLayer(
      isSatellite ? SATELLITE_TILES : STREETS_TILES,
      {
        attribution: isSatellite
          ? SATELLITE_ATTR
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    ).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTiles;
  }, [isSatellite]);

  const streetViewUrl = resolvedCoordinates
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${resolvedCoordinates.lat},${resolvedCoordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

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
      <div className="relative">
        <div
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-lg border border-gray-200 z-0"
        />

        {showStreetViewButton && (
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
            <a
              href={streetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-200">
              <Navigation className="h-4 w-4 text-blue-600" />
              Open Street View
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
            </a>
            <button
              onClick={() => setIsSatellite(!isSatellite)}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-xs font-medium border border-gray-200">
              <Layers className="h-3.5 w-3.5 text-blue-600" />
              {isSatellite ? "Map" : "Satellite"}
            </button>
          </div>
        )}
      </div>
  );
};

export default PropertyMap;
