import danceLogo from "../../assets/dancelogo.jpg";
import { useNavigate } from "react-router-dom";
import "./index.css";
import Navbar from "../../components/navbar/Navbar";
import Button from "../../components/button/Button";

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
      <Navbar />
      <div className="containerIndex">
<h2 className="Titulo-Home">Dancemos con el alma</h2>
        <div className="card">
          {/* Botones usando el componente Button */}
          <Button text="Mas informacion" onClick={navigateToRegister} />
        </div>
      </div>
    </div>
  );
};

export default Index;
