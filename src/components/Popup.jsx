const Popup = ({ onClose, type }) => {
  return (
      <div className="popup">
          <div className="popup-content">
              <span className="close" onClick={onClose}>
                  &times;
              </span>
              {type === "fillAllNames" && (
                  <h2>Please fill in all player names.</h2>
              )}
              {type === "rules" && (
                  <div>
                      <h2>Game Rules</h2>
                      <ul>
                          <li>Rule 1: Each player must perform a gesture when it's their turn.</li>
                          <li>Rule 2: Players must guess the gesture shown by other players.</li>
                          <li>Rule 3: Each correct guess earns a point.</li>
                          <li>Rule 4: The game continues until all rounds are completed.</li>
                      </ul>
                  </div>
              )}
          </div>
      </div>
  );
};

export default Popup;
