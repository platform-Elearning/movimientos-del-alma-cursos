import { useState,useEffect } from "react";
import Button from "../button/Button";

function Form ({handleChange,handleSubmit,formData,buttonText}) {
  const [info,setInfo] = useState([]);
  useEffect(() => {
     const data = async () => { 
        try {
          const response = await fetch("https://restcountries.com/v3.1/all");
          if(!response.ok){
            throw new Error("network response was not ok")
          }
          const data = await response.json();
          setInfo(data);
        } catch (error) {
          console.log("Error",error)
        }
      };
      data();
  },[]);

return(

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
        <input
          type="text"
          name="lastname"
          placeholder="Apellido"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
        <select
          placeholder= "Nacionalidad"
          id="nationality"
          type="text"
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          required
        >
          <option value="nationality" >Pais de Origen</option>
          {info.map((country,index) => {
           return <option key={index} value={country.name.common}>{country.name.common}</option>
            
          })}
        </select>
        <input
          type="email"
          name="email"
          placeholder="Correo Electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Button text={buttonText} />
      </form>
)}

export  default Form;