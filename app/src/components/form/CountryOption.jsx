import { useEffect, useState } from "react";

function CountryOption({handleChange, formData})
 {
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
    <select onChange={handleChange} value={formData.nationality}>
      <option value=""></option>
      {info.map((country, index) => (
        <option key={index} value={country.name.common}>
          {country.name.common}
        </option>
      ))}
    </select>
  );
}

export default CountryOption;