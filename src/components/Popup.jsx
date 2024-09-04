import React from "react";
import { Icon } from "@iconify/react";

const Popup = ({ onClose, type, gameMode }) => {
  const popupClass = type === "rules" ? "popup popup-large" : "popup";

  const renderGameModeContent = () => {
    switch (gameMode) {
      case "hand":
        return (
          <>
            <h4 className="mt-3">Gesture Mode</h4>
            <p>
              Draw using your index finger while keeping all fingers extended
              and visible in the frame. To make different strokes, close your
              thumb while drawing.
            </p>

            <div className="mt-3">
              <figure className="px-2">
                <img
                  src={"src/assets/gesturedraw.gif"}
                  width="40%"
                  alt="Drawing with index finger"
                />
                <figcaption>
                  Drawing with index finger, all fingers extended.
                </figcaption>
              </figure>
              <figure className="px-2">
                <img
                  src={"src/assets/gesture4fingers.gif"}
                  width="40%"
                  alt="Hand with all fingers extended"
                />
                <figcaption>Closing your thumb stops the drawing.</figcaption>
              </figure>
            </div>
          </>
        );
      case "mouse":
        return (
          <>
            <h4 className="mt-3">Mouse Mode</h4>
            <p>
              Use your mouse / touchpad to draw on the screen. Click and drag to
              create strokes.
            </p>
            <figure className="px-2">
              <img src={"src/assets/draw_mouse.gif"} width="40%" />
              <figcaption>
                Drawing by clicking and moving with the mouse or touchpad
              </figcaption>
            </figure>
          </>
        );
      case "nose":
        return (
          <>
            <h4 className="mt-3">Nose Mode</h4>
          </>
        );
      case "chin":
        return (
          <>
            <h4 className="mt-3">Chin Mode</h4>
            <p>
              Draw using your chin finger by moving it and keeping it visible in
              the frame. To make different strokes, bring your hand in the
              frame.
            </p>

            <div className="mt-3">
              <figure className="px-2">
                <img
                  src={"src/assets/chindraw.gif"}
                  width="50%"
                  alt="Drawing with chin"
                />
                <figcaption>
                  Drawing with your chin: the stroke pauses when both your face
                  and hand are in the frame.
                </figcaption>
              </figure>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={popupClass}
      role="dialog"
      aria-labelledby="popup-title"
      aria-modal="true"
    >
      <div className="popup-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        {type === "fillAllNames" && (
          <h2 id="popup-title">Please fill in all player names.</h2>
        )}
        {type === "rules" && (
          <div className="scrollable-content pb-5 px-5">
            <h1 className="mt-5" id="popup-title">
              Game Rules
            </h1>

            {gameMode !== "mouse" && (
              <p>
                Please enable the camera (and microphone) in your browser
                settings to be able to play.
              </p>
            )}

            <h4 className="mt-3">Objective</h4>
            <p>
              In each round, players are given a random category to draw. Points
              are awarded based on how well the sketch is recognized by the
              Sketch Classifier. The classifier checks the top 4 predictions,
              and points are given according to the rank and probability score
              of correct matches. The player with the most points at the end of
              the game wins!
            </p>

            {renderGameModeContent()}

            <p>
              Click the <strong>Clear Drawing</strong> button{" "}
              {gameMode !== "mouse" && <>or pronounce "Clear" </>} to erase your
              drawing completely, click the <strong>Send Drawing</strong> button{" "}
              {gameMode !== "mouse" && <>or pronounce "Send" </>} to submit your
              drawing to the classifier and move to the next round, click the
              "Skip Round" button{" "}
              {gameMode !== "mouse" && <>or pronounce "Skip" </>} to move on
              with the game without having to draw.
            </p>

            <p>
              Click on the <Icon icon="material-symbols-light:draw-outline" />{" "}
              button {gameMode !== "mouse" && <>or pronounce "Draw" </>}" to
              enter drawing mode. Click on the <Icon icon="ph:eraser-light" />{" "}
              button {gameMode !== "mouse" && <>or pronounce "Erase" </>}
              to enter erase mode.
            </p>

            {gameMode != "mouse" && (
              <>
                <h4 className="mt-4">Environment</h4>
                <p>
                  For the best experience, play in a well-lit area where your
                  features are clearly visible. If possible, play against a
                  plain background. Position your device slightly away from your
                  body to improve recognition.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
