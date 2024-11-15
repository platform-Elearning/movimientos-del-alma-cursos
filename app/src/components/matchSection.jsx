import "./matchSection.css";

const MatchSection = () => {
  return (
    <div className="match-container">
      <div className="sectionNames">
        <div>
          <h3>Alejandro Galan</h3>
          <h3>Federico Chingotto</h3>
        </div>
        <p className="vs">VS</p>
        <div>
          <h3>Agustín Tapia</h3>
          <h3>Arturo Coello</h3>
        </div>
      </div>

      <div className="sectionInputs">
        <div className="input1">
          <input type="number" />
          <input type="number" />
          <input type="number" />
        </div>
        <div className="input2">
          <input type="number" />
          <input type="number" />
          <input type="number" />
        </div>
      </div>
    </div>
  );
};

export default MatchSection;
