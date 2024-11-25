import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Home from "../../components/Home/Home"; // Importa el nuevo componente Home
import Login from "../login/login";
import VideoSection from "../../sections/videoSection/videoSection";
import danceVideo from "../../assets/dancevideo.mp4";
import ImgVideoSection from "../../assets/ImgVideoSection.png";
import "./index.css";

const Index = () => {
  const navigate = useNavigate();

  const navigateToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="page-container">
      {/* Contenedor principal */}
      <Navbar />
      <div className="containerIndex">
        {/* Reemplaza el contenido aquí por el nuevo componente Home */}
        <Home />
        <Login />

        {/* Sección del video */}
        <div className="video-section-container">
          <VideoSection
            title="Alma en movimiento"
            imageSrc={ImgVideoSection}
            videoSrc={danceVideo}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
