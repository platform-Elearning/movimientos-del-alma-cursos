import { useEffect, useState } from "react";
import Button from "../button/Button";

function Form({
  handleChange,
  handleSubmit,
  formData,
  buttonText,
  error
}) {
  const [info, setInfo] = useState([]);

  useEffect(() => {
    const data = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const sortedData = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setInfo(sortedData);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    data();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <input
        type="text"
        name="identification_number"
        placeholder="Número de Identificación"
        value={formData.identification_number}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="name"
        placeholder="Nombre"
        value={formData.name}
        onChange={handleChange}
        required
      />
      {error.name && <p className="error-message">{error.name}</p>}
      <input
        type="text"
        name="lastname"
        placeholder="Apellido"
        value={formData.lastname}
        onChange={handleChange}
        required
      />
      {error.lastname && <p className="error-message">{error.lastname}</p>}
      <select
        type="text"
        name="nationality"
        placeholder="Nacionalidad"
        value={formData.nationality}
        onChange={handleChange}
        required
      >
        <option value="nacionality">Pais de Origen</option>
        {info.map((country, index) => (
          <option key={index} value={country.name.common}>
            {country.name.common}
          </option>
        ))}
      </select>

      <input
        type="email"
        name="email"
        placeholder="Correo Electrónico"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Button text={buttonText} type={"submit"} />
    </form>
  );
}

export default Form;