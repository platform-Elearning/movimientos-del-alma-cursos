import React, {useState,useEffect} from "react";
import "./cardInsigniaEmpty.css"
import logo from "../../assets/logo2.png";


const CardInsignia = ({
    enrollment
    
})=>{
    return(
       <div className="insignia-card-emp">
  <div >
      <img src={logo} alt="Logo" className="insignia-icon"/>

  </div>
  <div className="insignia-content">
    <h3 className="p_card">- - - -</h3>

    <div>
        <p className="p_card" >- - -</p>
    </div>

    <div>
        <p className="p_card_no">- -</p>

    </div>
  </div>
</div>
    )



}
export default CardInsignia