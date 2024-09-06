import SketchEffect from "../animations/SketchEffect";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <>
      <div className="landing-wrapper">
        <div className="pencil-container">
          <div className="tip"></div>
          <div className="wood"></div>
          <div className="yellow"></div>
          <div className="metal"></div>
          <div className="eraser"></div>
        </div>
        <SketchEffect>
          <div className="landing-container justify-content-center align-items-center mt-4">
            <img
              id="logo"
              className="pb-md-2"
              src="src/assets/logo.png"
              width="70%"
              alt="logo"
            ></img>
            <div className="h1 pt-2">Pictionary like you've never seen! </div>

            <div className="doodles">
              <img
                id="apple"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/apple.png"
              ></img>
              <img
                id="bee"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/bee.png"
              ></img>
              <img
                id="bike"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/bike.png"
              ></img>
              <img
                id="butterfly"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/butterfly.png"
              ></img>
              <img
                id="cake"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/cake.png"
              ></img>
              <img
                id="glasses"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/glasses.png"
              ></img>
              <img
                id="icecream"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/icecream.png"
              ></img>
              <img
                id="mug"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/mug.png"
              ></img>
              <img
                id="plant"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/plant.png"
              ></img>
              <img
                id="teddybear"
                className="img-fluid mx-auto d-block"
                src="src/assets/doodles/teddybear.png"
              ></img>
            </div>
            <div id="play-btn-container" className="pt-3">
              <Link to="/game">
                <button
                  id="playButton"
                  type="button"
                  className="btn btn-outline-dark btn-light btn-lg"
                >
                  Start
                </button>
              </Link>
            </div>
          </div>
        </SketchEffect>
      </div>
    </>
  );
};

export default Landing;
