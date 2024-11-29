import React, { useState } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./formContacto.css";

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;
    const phoneNumber = "+543543313903"; // Número de teléfono de WhatsApp al que enviarás el mensaje
    const text = `Hola, soy ${name}. Mi correo es ${email}. Mensaje: ${message}`;

    // Crear la URL de WhatsApp con el mensaje
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      text
    )}`;

    // Redirigir a la URL de WhatsApp
    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="contacto-section">
      <div className="contacto-header">
        <h1>Contact With Me</h1>
        <p>
          If you have any questions or concerns, please don't hesitate to
          contact me. I am open to any work opportunities that align with my
          skills and interests.
        </p>
      </div>
      <div className="contacto-container">
        <div className="form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Your Message</label>
              <textarea
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">
              Send Message via WhatsApp
            </button>
          </form>
        </div>
        <div className="info-container">
          <div className="contact-info">
            <FaEnvelope size={20} className="contact-icon" />
            <span>julimax951@gmail.com</span>
          </div>
          <div className="contact-info">
            <FaPhone size={20} className="contact-icon" />
            <span>+54 9 3543 31-3903</span>
          </div>
          <div className="contact-info">
            <FaMapMarkerAlt size={20} className="contact-icon" />
            <span>Cordoba,Argentina</span>
          </div>
          <div className="social-icons">
            <a
              href="https://github.com/julimax"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub size={24} />
            </a>
            <a
              href="https://www.linkedin.com/in/juli-gonzalez/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin size={24} />
            </a>
            <a
              href="https://wa.me/543543313903"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;