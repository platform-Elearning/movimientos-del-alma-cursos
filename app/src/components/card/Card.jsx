import React from 'react';
import './Card.css';
import Button from '../button/Button';

const Card = ({ nombre, description, btnText, onClick }) => {
  return (
    <div className="card">
      <section className="card-header">
        <h2 className="card-title">{nombre}</h2>
      </section>
      <section className="card-info">
        <p className="card-description">{description}</p>
      </section>
      <Button text={btnText} onClick={onClick} />
    </div>
  );
};

export default Card;