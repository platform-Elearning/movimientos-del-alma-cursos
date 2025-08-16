import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowLeft } from 'react-icons/fa';
import './BackLink.css'
const BackLink = ({ title, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <a 
      className='link'
      href="#"
      onClick={handleClick}
      title={title}
      style={{ display: "flex", alignItems: "center" }}
    >
      <div className='icon'>
        <FaArrowLeft style={{ marginRight: "8px" }} />
      </div>
      <div className='text'>
        {title}
      </div>
    </a>
  );
};

BackLink.propTypes = {
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default BackLink;