import React from "react";
import "./Home.css"; // Archivo CSS para estilos
import Button from "../button/Button"; // Asegúrate de que esta ruta sea correcta

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-background">
        <h1 className="home-title">Dancemos con el alma</h1>
        <Button text="Mas informacion" /> {/* El botón ahora dirá PLATAFORMA */}
      </div>
    </div>
  );
};

export default Home;
