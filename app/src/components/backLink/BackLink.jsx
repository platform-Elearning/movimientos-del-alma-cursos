import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowLeft } from 'react-icons/fa';
import './BackLink.css'
const BackLink = ({ title, onClick }) => {

   return (
      <a 
        className='link'
        href="#"
        onClick={onClick}
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
};

export default BackLink;