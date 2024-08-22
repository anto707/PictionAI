import React, { useEffect } from "react";
import "../dist/sketcheffect.css"; 

const SketchEffect = ({ children }) => {
  useEffect(() => {
    const element = document.querySelector('.sketch-container');
    element.style.animationPlayState = 'running';
  }, []);

  return (
    <div className="sketch-container">
      {children}
    </div>
  );
};

export default SketchEffect;
