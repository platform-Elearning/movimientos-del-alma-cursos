import danceLogo from "../../assets/dancelogo.jpg";
import { useNavigate } from "react-router-dom";
import "./index.css";
import Navbar from "../../components/navbar/Navbar";

const Index = () => {
  const navigate = useNavigate();

  const navigateToRegister = () => {
    navigate("/register");
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div>
    <Navbar></Navbar>
      <div className="containerIndex">
        <a target="_blank">
          <img src={danceLogo} className="logo" alt="React logo" />
        </a>
        <h1>Movimientos del Alma</h1>
        <p>
          En nuestra Academia de Danza, creemos que cada paso cuenta, cada
          movimiento tiene un propósito y que el baile es mucho más que una
          disciplina: es una forma de vida. Nos dirigimos a todas las personas,
          sin importar su edad o experiencia, que busquen expresar su
          creatividad, mejorar su bienestar físico y emocional, o simplemente
          disfrutar del poder transformador del arte del movimiento. Nuestra
          misión es ofrecer un espacio donde el arte de la danza se convierta en
          una experiencia accesible, enriquecedora y transformadora. Aquí, cada
          estudiante es único, y nos esforzamos por crear un ambiente acogedor y
          motivador en el que puedan desarrollarse a su propio ritmo, sin
          presiones, pero con el desafío de superarse constantemente. Contamos
          con una variedad de estilos de danza, desde el ballet clásico y la
          danza contemporánea, hasta el hip hop, el jazz y la salsa, para que
          cada persona pueda encontrar la disciplina que más resuene con su
          personalidad y objetivos. Nuestros profesores son profesionales
          apasionados por la enseñanza y el arte de la danza, comprometidos a
          brindar una formación técnica sólida, pero también a fomentar la
          creatividad, la confianza y el disfrute del proceso artístico. En la
          Academia de Danza, también entendemos que la danza es un vehículo para
          el bienestar integral. No solo es una excelente forma de ejercicio
          físico, sino que también ayuda a liberar tensiones, mejora la postura,
          fortalece la coordinación y promueve la conexión con uno mismo y con
          los demás. Cada clase es una oportunidad para explorar tu propio
          cuerpo, desatar tu energía y conectar con una comunidad de personas
          que comparten tu amor por la danza. Te invitamos a unirte a nuestra
          familia de danza y descubrir lo que significa moverse con libertad,
          expresar lo que sientes y disfrutar del viaje. Aquí, todos tienen un
          lugar, porque creemos que la danza es un lenguaje universal que
          conecta a las personas más allá de las palabras.
        </p>
        <div className="card">
          <button onClick={navigateToLogin}>Iniciar Sesion</button>
          <button onClick={navigateToRegister}>Registrarse</button>
        </div>
      </div>
      </div>
  );
};

export default Index;
