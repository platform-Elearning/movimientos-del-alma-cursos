import React from "react";
import "./Button.css";

const Button = ({ text, onClick }) => {
  return (

    <button className="button" type='submit' onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
