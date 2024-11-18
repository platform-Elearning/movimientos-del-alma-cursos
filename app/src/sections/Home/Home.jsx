import React from "react";
import Button from "../../components/button/Button"; // Asegúrate de que el componente Button esté bien importado
import "./Home.css"; // Importa el CSS de estilo

const Home = () => {
  const handleExplore = () => {
    console.log("Explorar cursos");
  };

  const handleRegister = () => {
    console.log("Registrarse");
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="titulo-Home">Dancemos con el alma</h1> {/* El título se ve bien ahora */}
        
        <div className="home-buttons">
          <Button text="Mas informacion" onClick={handleExplore} />
        </div>
      </div>
    </div>
  );
};

export default Home;
