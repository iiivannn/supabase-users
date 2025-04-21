import { useState, useEffect } from "react";
import "./Carousel.css";

export default function Carousel({ images, interval = 5000 }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

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
