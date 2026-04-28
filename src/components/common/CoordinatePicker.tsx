import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, MapPin, Layers } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CoordinatePickerProps {
  value?: { lat: number; lng: number };
  onChange: (value: { lat: number; lng: number } | undefined) => void;
  label?: string;
}

const CoordinatePicker: React.FC<CoordinatePickerProps> = ({
  value,
  onChange,
  label = "Property Geolocation",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
   const [inputValue, setInputValue] = useState(
    value ? `${value.lat}, ${value.lng}` : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSatellite, setIsSatellite] = useState(true);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const STREETS_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const SATELLITE_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const SATELLITE_ATTR = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center (Lagos)
    const initialLat = value?.lat || 6.5244;
    const initialLng = value?.lng || 3.3792;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);

    // Use OpenStreetMap tiles initially
    const tiles = L.tileLayer(isSatellite ? SATELLITE_TILES : STREETS_TILES, {
      attribution: isSatellite
        ? SATELLITE_ATTR
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayerRef.current = tiles;

    mapInstanceRef.current = map;

    // Marker management
    if (value) {
      markerRef.current = L.marker([value.lat, value.lng], { icon: customIcon }).addTo(map);
    }

    // Map click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setInputValue(formatted);
      setError(null);
      
      updateMarker(lat, lng);
      onChange({ lat, lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map when value changes from outside (e.g., initial load)
  useEffect(() => {
    if (value && mapInstanceRef.current) {
      const currentPos = markerRef.current?.getLatLng();
      if (!currentPos || currentPos.lat !== value.lat || currentPos.lng !== value.lng) {
        updateMarker(value.lat, value.lng);
        mapInstanceRef.current.setView([value.lat, value.lng], 15);
        setInputValue(`${value.lat}, ${value.lng}`);
      }
    }
  }, [value]);

  // Handle tile layer switching
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    // Remove current layer
    tileLayerRef.current.remove();

    // Create and add new layer
    const newTiles = L.tileLayer(isSatellite ? SATELLITE_TILES : STREETS_TILES, {
      attribution: isSatellite
        ? SATELLITE_ATTR
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTiles;
  }, [isSatellite]);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!val.trim()) {
      setError(null);
      markerRef.current?.remove();
      markerRef.current = null;
      onChange(undefined);
      return;
    }

    const parts = val.split(",").map((p) => p.trim());
    if (parts.length !== 2) {
      setError("Invalid format. Use: latitude, longitude");
      return;
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Coordinates must be valid numbers.");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Latitude must be -90 to 90, and Longitude -180 to 180.");
      return;
    }

    setError(null);
    updateMarker(lat, lng);
    mapInstanceRef.current?.setView([lat, lng], 15);
    onChange({ lat, lng });
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-green-600" />
        {label}
      </Label>
      
      <div className="space-y-2">
        <Input
          placeholder="e.g. 6.4431, 3.4679"
          value={inputValue}
          onChange={handleInputChange}
          className={error ? "border-red-500" : ""}
        />
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="relative">
        <div
          ref={mapContainerRef}
          className="h-[300px] w-full rounded-xl border border-gray-200 overflow-hidden z-0"
          style={{ background: "#f8f9fa" }}
        />
        
        {/* Map Type Toggle */}
        <button
          type="button"
          onClick={() => setIsSatellite(!isSatellite)}
          className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-xs font-medium border border-gray-200"
        >
          <Layers className="h-3.5 w-3.5 text-blue-600" />
          {isSatellite ? "Switch to Streets" : "Switch to Satellite"}
        </button>
      </div>
      
      <p className="text-xs text-gray-500">
        Paste coordinates or click on the map to set the exact location.
      </p>
    </div>
  );
};

export default CoordinatePicker;
