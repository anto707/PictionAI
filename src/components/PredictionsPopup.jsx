import React, { useState, useEffect } from 'react';

const PredictionsPopup = ({ onClose, predictions, currentRoundScore, category }) => {
  const [barWidths, setBarWidths] = useState(predictions.map(() => 0));
  const [opacityClass, setOpacityClass] = useState('opacity-0');
  const [pointsExplanation, setPointsExplanation] = useState('');
  const [showProbabilities, setShowProbabilities] = useState(false);

  useEffect(() => {
    // Timer to update bar widths
    const timer = setTimeout(() => {
      setBarWidths(predictions.map(prediction => prediction.probability > 0 ? prediction.probability * 100 : 0));
      setOpacityClass('opacity-1');
    }, 500);

    // Timer to show probabilities after bars have finished expanding
    const probabilitiesTimer = setTimeout(() => {
      setShowProbabilities(true);
    }, 3500); // Adjust the timing to match the transition duration (3s) + some buffer

    return () => {
      clearTimeout(timer);
      clearTimeout(probabilitiesTimer);
    };
  }, [predictions]);

  useEffect(() => {
    const categoryIndex = predictions.findIndex(prediction => prediction.label === category);
    if (categoryIndex !== -1) {
      const multiplier = 4 - categoryIndex; 
      setPointsExplanation(`${category.charAt(0).toUpperCase() + category.slice(1)} has been predicted as the ${categoryIndex === 0 ? 'first' : categoryIndex === 1 ? 'second' : categoryIndex === 2 ? 'third' : categoryIndex === 3 ? 'fourth' : `${categoryIndex + 1}th`} most probable class. You earn ${(predictions[categoryIndex].probability.toFixed(3))} * ${multiplier} points.`);
    }
  }, [category, predictions]);

  return (
    <div className="popup popup-large">
      <div className={`popup-content ${opacityClass}`}>
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Top Predictions from Sketch Classifier</h2>
        <div className="histogram">
          {predictions.map((prediction, index) => {
            const isHighlighted = category === prediction.label;
            return (
              <div
                className={`histogram-bar ${isHighlighted ? 'highlighted' : ''}`}
                key={index}
              >
                <div className="label">{prediction.label}</div>
                <div className="bar-container">
                  <div
                    className="bar"
                    style={{
                      width: barWidths[index] > 0 ? `${barWidths[index]}%` : '0%',
                      transition: barWidths[index] > 0 ? 'width 3s ease-in-out' : 'none',
                    }}
                  >
                    <span
                      className="probability"
                      style={{
                        opacity: showProbabilities ? 1 : 0,
                        transition: 'opacity 1s ease-in-out',
                      }}
                    >
                      {barWidths[index] > 0 && `${barWidths[index].toFixed(2)}%`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <h2 className="mt-5">Points won this round: {currentRoundScore.replace(/\.(00)$/, '')}</h2>
        <p>{pointsExplanation}</p>
        <button className="btn btn-outline-dark btn-light btn-md mt-3" onClick={onClose}>
          Go to next round
        </button>
      </div>
    </div>
  );
};

export default PredictionsPopup;
