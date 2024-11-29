import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Login from "../login/login";
import "./index.css";

const Index = () => {

  return (
    <div className="page-container">
      <Navbar />
      <div className="containerIndex">
      <Login />
      </div>
    </div>
  );
};

export default Index;
