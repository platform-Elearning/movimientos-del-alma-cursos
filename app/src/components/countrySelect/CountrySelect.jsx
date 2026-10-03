import React from "react";
import "./CountrySelect.css";

import { COUNTRIES } from "../../utils/paises";

// id es opcional para no tocar a quienes ya lo usan, pero sin el la etiqueta
// del formulario queda sin nada a que apuntar.
const CountrySelect = ({ value, onChange, name = "nationality", required = false, id }) => {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="country-select"
    >
      <option value="">Seleccioná un país</option>
      {COUNTRIES.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
};

export default CountrySelect;
