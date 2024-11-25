import React, { useState } from "react";
import "./videoSection.css"; // Importa estilos

const VideoSection = ({ title, imageSrc, videoSrc }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsVideoPlaying(true); // Mostrar el video cuando se hace clic
  };

  return (
    <div className="video-section">
      <h1 className="video-section-title">{title}</h1>
      <div className="video-section-content">
        {/* Imagen */}
        <img src={imageSrc} alt="Dance" className="video-section-image" />
        {/* Placeholder del video */}
        <div className="video-placeholder">
          {!isVideoPlaying ? (
            <button
              className="video-play-button"
              onClick={handlePlayClick} // Reproducir video al hacer clic
            >
              ▶
            </button>
          ) : (
            <video
              className="video-player"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()} // Evitar que se detenga al hacer clic
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
