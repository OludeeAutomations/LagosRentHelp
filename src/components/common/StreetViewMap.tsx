/* eslint-disable @typescript-eslint/no-explicit-any */
// components/StreetViewModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, Compass, Maximize, Minimize } from "lucide-react";

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

const StreetViewModal: React.FC<StreetViewModalProps> = ({
  isOpen,
  onClose,
  address,
}) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [error, setError] = useState("");
  const [panorama, setPanorama] =
    useState<google.maps.StreetViewPanorama | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (window.google && window.google.maps) {
      initializeStreetView();
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", initializeStreetView);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = initializeStreetView;
    script.onerror = () => {
      setStatus("error");
      setError("Failed to load Google Maps");
    };

    document.head.appendChild(script);

    function initializeStreetView() {
      if (!streetViewRef.current) return;

      try {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const location = results[0].geometry.location;

            const streetViewService = new google.maps.StreetViewService();

            streetViewService.getPanorama(
              {
                location: location,
                radius: 100,
                source: google.maps.StreetViewSource.OUTDOOR,
              },
              (data, streetViewStatus) => {
                if (streetViewStatus === "OK" && data) {
                  // Create Street View panorama with minimal controls
                  const panoramaInstance = new google.maps.StreetViewPanorama(
                    streetViewRef.current!,
                    {
                      position: location,
                      pov: {
                        heading: 34,
                        pitch: 10,
                      },
                      zoom: 1,
                      visible: true,
                      addressControl: false, // Hide default address control
                      linksControl: false, // Hide default links
                      panControl: false, // Hide default pan control
                      zoomControl: false, // Hide default zoom control
                      enableCloseButton: false, // Hide close button
                      fullscreenControl: false, // Hide fullscreen control
                      motionTrackingControl: false,
                    }
                  );

                  setPanorama(panoramaInstance);
                  setStatus("loaded");
                } else {
                  setStatus("error");
                  setError(
                    "Street View is not available for this location. Try exploring nearby streets."
                  );
                }
              }
            );
          } else {
            setStatus("error");
            setError("Address not found");
          }
        });
      } catch (err) {
        setStatus("error");
        setError("Error initializing Street View");
        console.error("Street View error:", err);
      }
    }

    return () => {
      const script = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (script) {
        script.removeEventListener("load", initializeStreetView);
      }
    };
  }, [isOpen, address]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    if (panorama) {
      const currentZoom = panorama.getZoom() || 0;
      panorama.setZoom(Math.min(currentZoom + 0.5, 5));
    }
  };

  const handleZoomOut = () => {
    if (panorama) {
      const currentZoom = panorama.getZoom() || 0;
      panorama.setZoom(Math.max(currentZoom - 0.5, 0));
    }
  };

  const resetView = () => {
    if (panorama) {
      panorama.setPov({
        heading: 34,
        pitch: 10,
      });
      panorama.setZoom(1);
    }
  };

  const toggleFullscreen = () => {
    if (!streetViewRef.current) return;

    if (!isFullscreen) {
      if (streetViewRef.current.requestFullscreen) {
        streetViewRef.current.requestFullscreen();
      } else if ((streetViewRef.current as any).webkitRequestFullscreen) {
        (streetViewRef.current as any).webkitRequestFullscreen();
      } else if ((streetViewRef.current as any).msRequestFullscreen) {
        (streetViewRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-all duration-200">
          <X className="h-5 w-5" />
          <span>Close</span>
        </button>

        {/* Address Display */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-medium whitespace-nowrap">{address}</p>
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-all duration-200">
          {isFullscreen ? (
            <Minimize className="h-5 w-5" />
          ) : (
            <Maximize className="h-5 w-5" />
          )}
          <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </button>

        {/* Street View Container */}
        <div className="relative w-full h-full">
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">Loading Street View...</p>
                <p className="text-sm text-gray-300 mt-2">
                  Exploring the neighborhood for you
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="text-center text-white max-w-md">
                <Compass className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Street View Unavailable
                </h3>
                <p className="text-gray-300 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Back to Map
                </button>
              </div>
            </div>
          )}

          <div ref={streetViewRef} className="w-full h-full" />
        </div>

        {/* Custom Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-3 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-all duration-200"
            title="Zoom In">
            <ZoomIn className="h-5 w-5" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-3 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-all duration-200"
            title="Zoom Out">
            <ZoomOut className="h-5 w-5" />
          </button>

          <button
            onClick={resetView}
            className="p-3 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-all duration-200"
            title="Reset View">
            <Compass className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreetViewModal;
