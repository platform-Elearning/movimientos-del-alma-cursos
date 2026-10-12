import React from 'react';
import './Card.css';
import Button from '../button/Button';
import BarraDeProgreso from '../progreso/BarraDeProgreso';

// progreso: { completadas, total } opcional, para las formaciones de la alumna.
const Card = ({ nombre, description, btnText, onClick, progreso }) => {
  return (
    <div className="card">
      <section className="card-header">
        <h2 className="card-title">{nombre}</h2>
      </section>
      <section className="card-info">
        <p className="card-description">{description}</p>
      </section>
      {progreso && progreso.total > 0 && (
        <section className="card-progreso">
          <BarraDeProgreso completadas={progreso.completadas} total={progreso.total} compacta />
        </section>
      )}
      {btnText && <Button text={btnText} onClick={onClick} />}
    </div>
  );
};

export default Card;