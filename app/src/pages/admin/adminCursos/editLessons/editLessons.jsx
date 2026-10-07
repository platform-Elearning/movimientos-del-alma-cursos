import React, { useState } from "react";
import CreateLesson from "../createLesson/createLesson";
import TablaLessons from "../tablaLessons/tablaLessons";


const EditLessons = () => {
  // Sube cuando se crea una clase, para que la tabla se recargue sola.
  const [version, setVersion] = useState(0);

  return (
    <div>
        <CreateLesson onCreated={() => setVersion((v) => v + 1)} />
        <TablaLessons version={version} />
    </div>
  );
};

export default EditLessons;
