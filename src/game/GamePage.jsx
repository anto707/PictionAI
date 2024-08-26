import React, { useState } from 'react';
import Header from "../components/Header"
import GestureCanvas from "../game/GestureCanvas"
import Popup from "../components/Popup"

const GamePage = () => {

  const [currentStep, setCurrentStep] = useState(1);
  const [numPlayers, setNumPlayers] = useState(1);
  const [playerNames, setPlayerNames] = useState([]);
  const [numRounds, setNumRounds] = useState(3);
  const [gameMode, setGameMode] = useState("handgesture");
  const [gameStarted, setGameStarted] = useState(false);
  const [transitionClass, setTransitionClass] = useState('slide-in-right');
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [popupType, setPopupType] = useState("");

  const handleClosePopup = () => {
    setPopupVisibility(false);
    setPopupType("");
  };

  const handleNextStep = () => {
   
    if (currentStep === 2) {
      if (playerNames.length !== numPlayers || playerNames.some(name => !name)) {
        setPopupVisibility(true);
        setPopupType("fillAllNames");
        return;
      }
    }
    setTransitionClass('slide-out-left');
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      setTransitionClass('slide-in-right');
    }, 500);

  };

  const handlePreviousStep = () => {
    setTransitionClass('slide-out-right');
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setTransitionClass('slide-in-left');
    }, 500);
  };


  const handlePlayerNameChange = (index, name) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <>
      <Header showRules={gameStarted} onRulesClick={() => {setPopupType("rules"); setPopupVisibility(true);
        }}  />
      <div className="text-center d-flex vh-100 w-100 justify-content-center align-items-center" id="gameSetup">
        {gameStarted ? (
          <>
            <GestureCanvas numPlayers={numPlayers} numRounds={numRounds} playerNames={playerNames} />
          </>
        ) : (
          <div className={transitionClass}>
            {currentStep === 1 && (
              <div>
                <h1>How many players?</h1>
                <input
                  type="number"
                  value={numPlayers}
                  onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                  min="1"
                  max="10"
                  style={{ fontSize: '24px', textAlign: 'center', padding: '10px', width: '100px' }}
                />
                <br />
                <button
                  onClick={handleNextStep}
                  className="btn btn-outline-dark btn-light btn-lg mt-3"
                >
                  Next
                </button>
              </div>
            )}
  
            {currentStep === 2 && (
              <div>
                <h1>Enter player names</h1>
                {Array.from({ length: numPlayers }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    className="h1 mx-2"
                    placeholder={`Player ${index + 1} name`}
                    value={playerNames[index] || ''}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    style={{ fontSize: '24px', textAlign: 'center', padding: '10px', width: '200px', marginTop: '10px' }}
                  />
                ))}
                <br />
                <button
                  onClick={handleNextStep}
                  className="btn btn-outline-dark btn-light btn-lg mt-3"
                >
                  Next
                </button>
                <br />
                <button
                  onClick={handlePreviousStep}
                  className="btn btn-outline-dark btn-light btn-sm mt-3"
                >
                  Back
                </button>
              </div>
            )}
  
            {currentStep === 3 && (
              <div>
                <h1>How many rounds?</h1>
                <input
                  type="number"
                  value={numRounds}
                  onChange={(e) => setNumRounds(parseInt(e.target.value))}
                  min="3"
                  max="20"
                  style={{ fontSize: '24px', textAlign: 'center', padding: '10px', width: '100px' }}
                />
                <br />
                <button
                  onClick={handleNextStep}
                  className="btn btn-outline-dark btn-light btn-lg mt-3"
                >
                  Next
                </button>
                <br />
                <button
                  onClick={handlePreviousStep}
                  className="btn btn-outline-dark btn-light btn-sm mt-3"
                >
                  Back
                </button>
              </div>
            )}
  
            {currentStep === 4 && (
              <div>
                <h1>Choose game mode</h1>
                <select
                  value={gameMode}
                  onChange={setGameMode}
                  style={{ textAlign: 'center', fontSize: '24px', padding: '10px', width: '200px' }}
                >
                  <option value="handgesture">Hand Gesture</option>
                </select>
                <br />
                <button
                  onClick={startGame}
                  className="btn btn-outline-dark btn-light btn-lg mt-3"
                >
                  Start Game
                </button>
                <br />
                <button
                  onClick={handlePreviousStep}
                  className="btn btn-outline-dark btn-light btn-sm mt-3"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {isPopupVisible && <Popup onClose={handleClosePopup} type={popupType} />}
    </>

  );
  
};
export default GamePage;