import { useEffect, useRef, useState } from "react";

interface UsePropertyImageGalleryParams {
  imageCount: number;
}

export const usePropertyImageGallery = ({
  imageCount,
}: UsePropertyImageGalleryParams) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const resetImage = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const openImageModal = (index: number) => {
    setActiveImageIndex(index);
    setShowImageModal(true);
    setZoomLevel(1);
    setRotation(0);
    setIsFullscreen(false);
    document.body.style.overflow = "hidden";
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    document.body.style.overflow = "auto";
  };

  const showNextImage = () => {
    if (!imageCount) return;
    setActiveImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
    resetImage();
  };

  const showPreviousImage = () => {
    if (!imageCount) return;
    setActiveImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
    resetImage();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!modalRef.current) return;

    if (!isFullscreen) {
      if (modalRef.current.requestFullscreen) {
        modalRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal) return;

      switch (e.key) {
        case "Escape":
          closeImageModal();
          break;
        case "ArrowLeft":
          showPreviousImage();
          break;
        case "ArrowRight":
          showNextImage();
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetImage();
          }
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal, imageCount, isFullscreen]);

  return {
    activeImageIndex,
    imageRef,
    isFullscreen,
    modalRef,
    rotation,
    setActiveImageIndex,
    setZoomLevel,
    showImageModal,
    zoomLevel,
    closeImageModal,
    handleZoomIn,
    handleZoomOut,
    openImageModal,
    resetImage,
    rotateImage,
    showNextImage,
    showPreviousImage,
    toggleFullscreen,
  };
};
