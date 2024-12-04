import React from "react";
import "./pageAuxiliar.css";
import workImage from "../../assets/work.png"; // Asegúrate de que la ruta sea correcta.

const PageAuxiliar = () => {
  return (
    <div className="page-auxiliar-container">
      <img src={workImage} alt="Estamos trabajando" className="work-image" />
      <h1>Estamos trabajando en esto</h1>
      <p>Por favor, vuelve pronto para ver las actualizaciones.</p>
    </div>
  );
};

export default PageAuxiliar;
