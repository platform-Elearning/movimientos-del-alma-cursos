import React from "react";
import { useParams } from "react-router-dom";
import "./clase.css";

const Clase = () => {
  const { classId } = useParams(); // Obtener el ID de la clase desde la URL

  // Datos simulados para la clase
  const classData = {
    id: classId,
    name: `Clase Bailes con saltos: Nombre de la Clase`,
  };

  // URL del video de YouTube
  const videoUrl = "https://www.youtube.com/embed/s0LkHASG2GY";

  return (
    <div className="class-details-container">
      <h2 className="class-title">{classData.name}</h2>
      <div className="video-container">
        <iframe
          width="100%"
          height="480"
          src={videoUrl}
          title={classData.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Clase;
