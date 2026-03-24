import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyImageModalProps {
  activeImageIndex: number;
  imageRef: React.RefObject<HTMLImageElement | null>;
  images: string[];
  isFullscreen: boolean;
  isOpen: boolean;
  modalRef: React.RefObject<HTMLDivElement | null>;
  rotation: number;
  zoomLevel: number;
  onClose: () => void;
  onDownload: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onRotate: () => void;
  onSelectImage: (index: number) => void;
  onToggleFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}

const PropertyImageModal: React.FC<PropertyImageModalProps> = ({
  activeImageIndex,
  imageRef,
  images,
  isFullscreen,
  isOpen,
  modalRef,
  rotation,
  zoomLevel,
  onClose,
  onDownload,
  onNext,
  onPrevious,
  onReset,
  onRotate,
  onSelectImage,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  setZoomLevel,
}) => {
  if (!isOpen || images.length === 0) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div className="flex items-center justify-between p-4 bg-black/90 text-white">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </Button>
          <span className="text-sm font-medium">
            {activeImageIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="text-white hover:bg-white/20"
            title="Download image (Ctrl+S)">
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="text-white hover:bg-white/20"
            title="Toggle fullscreen (F)">
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          className="absolute left-4 text-white hover:bg-white/20 z-10"
          title="Previous image">
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="absolute right-4 text-white hover:bg-white/20 z-10"
          title="Next image">
          <ChevronRight className="h-8 w-8" />
        </Button>

        <div className="relative w-full h-full flex items-center justify-center">
          <img
            ref={imageRef}
            src={images[activeImageIndex]}
            alt={`Property image ${activeImageIndex + 1}`}
            className="max-w-full max-h-full transition-transform duration-200 cursor-zoom-out"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((prev) => (prev === 1 ? 2 : 1));
            }}
            onWheel={(e) => {
              e.preventDefault();
              if (e.deltaY < 0) {
                onZoomIn();
              } else {
                onZoomOut();
              }
            }}
          />

          {zoomLevel !== 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-black/90 text-white">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            className="text-white bg-primary border-white/30 hover:bg-white/20"
            disabled={zoomLevel <= 0.5}>
            <ZoomOut className="h-4 w-4 mr-2" />
            Zoom Out
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-white bg-primary border-white/30 hover:bg-white/20"
            disabled={zoomLevel === 1 && rotation === 0}>
            <RotateCw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRotate}
            className="text-white bg-primary border-white/30 hover:bg-white/20">
            <RotateCw className="h-4 w-4 mr-2" />
            Rotate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            className="text-white bg-primary border-white/30 hover:bg-white/20"
            disabled={zoomLevel >= 5}>
            <ZoomIn className="h-4 w-4 mr-2" />
            Zoom In
          </Button>
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex items-center justify-center space-x-2 overflow-x-auto py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onSelectImage(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  idx === activeImageIndex
                    ? "border-green-500"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 text-center text-xs text-white/60">
          <span className="hidden md:inline">
            Use left/right arrows to navigate, plus/minus to zoom, F for
            fullscreen, ESC to close
          </span>
          <span className="md:hidden">Pinch to zoom, swipe to navigate</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyImageModal;
