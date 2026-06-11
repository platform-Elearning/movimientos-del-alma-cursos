import React, {useState,useEffect} from "react";
import "./CardInsignia.css"
import logo from "../../assets/logo2.png";


const CardInsignia = ({
    enrollment
    
})=>{
    return(
       <div className="insignia-card">
  <div >
      <img src={logo} alt="Logo" className="insignia-icon"/>

  </div>
  <div className="insignia-content">
    <h3 className="p_card">{enrollment.course_name}</h3>


    {enrollment.approved === true ? 
    (
    <div>
        <p className="p_card" >Aprobado</p>
        { enrollment.url_certificate !== null ?(
            <a href={enrollment.url_certificate} target='_blank' className="a_card"  >Link al cetificado</a>
        ):(
         <p className="p_card_no_p" >certificado en proceso</p>
         
        )}
    </div>
    ):
    (
    <div>
        <p className="p_card_no">En curso</p>

    </div>

    ) }




  </div>
</div>
    )



}
export default CardInsignia