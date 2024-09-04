import React from 'react';
import { Icon } from "@iconify/react";

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

            <p>Please enable the camera (and microphone) in your browser settings to be able to play.</p>

            <h4 className="mt-3">Objective</h4>
            <p>
              In each round, players are given a random category to draw. Points are awarded based on how well the sketch is recognized by the Sketch Classifier. The classifier checks the top 4 predictions, and points are given according to the rank and probability score of correct matches. The player with the most points at the end of the game wins!
            </p>

            <h4 className="mt-3">Gesture Mode</h4>
            <p>
              Draw using your index finger while keeping all fingers extended and visible in the frame. To make different strokes, close your thumb while drawing.
            </p>
            
            <div className="mt-3">
              <figure className="px-2">
                <img src="src/assets/gesturedraw.gif" width="40%" alt="Drawing with index finger" />
                <figcaption>Drawing with index finger, all fingers extended.</figcaption>
              </figure>
              <figure className="px-2">
                <img src="src/assets/gesture4fingers.gif" width="40%" alt="Hand with all fingers extended" />
                <figcaption>Closing your thumb stops the drawing.</figcaption>
              </figure>
            </div>

            <p>
              Click the <strong>Clear Drawing</strong> button or pronounce "Clear" to erase your drawing completely, click the <strong>Send Drawing</strong> button or pronounce "Send" to submit your drawing to the classifier and move to the next round, click the "Skip Round" button or pronunce "Skip" to move on with the game without having to draw.
            </p>

            <p>
              Click on the <Icon icon="material-symbols-light:draw-outline" /> button or pronounce "Draw" to enter drawing mode. Click on the <Icon icon="ph:eraser-light" /> button or pronounce "Erase" to enter erase mode.
            </p>

            <h4 className="mt-4">Environment</h4>
            <p>
              For the best experience, play in a well-lit area where your hand is clearly visible. If possible, place your hand against a plain background. Position your device slightly away from your body to improve recognition.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
