import { useState, useEffect } from "react";
import "./Carousel.css";

export default function Carousel({ images, interval = 5000 }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Set up the interval for image rotation
    const imageInterval = setInterval(() => {
      // Use functional update to ensure we're working with latest state
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    // Clean up the interval on component unmount
    return () => clearInterval(imageInterval);
  }, [images.length, interval]);

  return (
    <div className="carousel-container">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Carousel image ${index + 1}`}
          className={`carousel-image ${
            index === currentImageIndex ? "active" : ""
          }`}
        />
      ))}
    </div>
  );
}
