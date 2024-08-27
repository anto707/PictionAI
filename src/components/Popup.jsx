import React from 'react';

const Popup = ({ onClose, type }) => {
  const popupClass = type === "rules" ? "popup popup-large" : "popup";

  return (
    <div className={popupClass}>
      <div className="popup-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        {type === "fillAllNames" && (
          <h2>Please fill in all player names.</h2>
        )}
        {type === "rules" && (
          <div className="scrollable-content pb-5 px-5">
            <h1 className="mt-5">Game Rules</h1>
            <h4 className="mt-5">Objective</h4> 
            Each player draws the random category assigned to them in each round. <br/>
            The player who has the most drawings correctly identified by our AI sketch classifier wins the game!
            <h4 className="mt-3">Gesture Mode</h4>
            Draw using either index finger. Ensure your entire hand is visible in the frame with all fingers extended. <br/>
            To perform different strokes, close your thumb while drawing.
            <div className="mt-3">
              <figure className="px-2">
                <img src="src/assets/gesturedraw.gif" width="40%" alt="Drawing with index finger"/>
                <figcaption>Drawing with index finger, all fingers are extended.</figcaption>
              </figure>
              <figure className="px-2">
                <img src="src/assets/gesture4fingers.gif" width="40%" alt="Hand with all fingers extended"/>
                <figcaption>Using a closed thumb and extended fingers will stop the drawing.</figcaption>
              </figure>
            </div>
            Use the Clear button to erase your drawing and the Send button to go to the next round.
            <h4 className="mt-4">Environment</h4>
            Play in a well-lit area where your hand can be clearly seen. If possible, place your hand on a clear background.<br/>
            Position your device slightly away from your body for better recognition.
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
