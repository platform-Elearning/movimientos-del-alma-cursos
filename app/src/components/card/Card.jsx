import React from 'react';
import './Card.css';
import Button from '../button/Button';

const Card = ({ nombre, duracion, lecciones, videos,btnText, onClick }) => {
    return (
      <div className="card">
        <section className="card-header">
          <h2 className="card-title">{nombre}</h2>
        </section>
        <section className="card-info">
          <p className="card-duration">{duracion}Meses</p>
          <p className="card-lessons">
            <span> | </span>
            {lecciones}Clases<span> |</span>
          </p>
          <p className="card-videos">{videos}Videos</p>
        </section>
        <Button text={btnText} onClick={onClick}/>
      </div>
    );
};

export default Card;