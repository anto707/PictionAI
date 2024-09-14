import ScrollAnimation from "../animations/ScrollAnimation.jsx";
import { useEffect, useRef, useState } from "react";
import "../dist/cards.css";
import { Link } from "react-router-dom";

const Features = () => {
  const stack1Ref = useRef(null);
  const histogramRef = useRef(null);
  const paperImageRef = useRef(null);
  const [barWidths, setBarWidths] = useState([0, 0, 0, 0]);
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);

  // Fake predictions
  const predictions = [
    { label: "Fox", width: 40.14 },
    { label: "Cat", width: 24.99 },
    { label: "Mouse", width: 24.88 },
    { label: "Dog", width: 9.99 },
  ];
  const category = "Cat";

  useEffect(() => {
    if (stack1Ref.current) {
      stack1Ref.current.classList.remove("start");
    }
  }, []);

  const handleMouseEnter = (event) => {
    if (stack1Ref.current && window.innerWidth >= 400) {
      stack1Ref.current.classList.add("hover");
    }
    event.stopPropagation();
  };

  const handleMouseLeave = () => {
    if (stack1Ref.current && window.innerWidth >= 400) {
      stack1Ref.current.classList.remove("hover");
    }
    const card = document.querySelector(".note");
    if (card) {
      card.classList.add("note");
    }
  };

  // IntersectionObserver to detect when the histogram is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setBarWidths(predictions.map((prediction) => prediction.width));
            setShowProbabilities(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (histogramRef.current) {
      observer.observe(histogramRef.current);
    }

    return () => {
      if (histogramRef.current) {
        observer.unobserve(histogramRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // IntersectionObserver for the image
  useEffect(() => {
    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageVisible(true);
            imgObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (paperImageRef.current) {
      imgObserver.observe(paperImageRef.current);
    }

    return () => {
      if (paperImageRef.current) {
        imgObserver.unobserve(paperImageRef.current);
      }
    };
  }, []);

  return (
    <div id="features" className="pt-5 mt-5 text-center">
      <div className="pt-4 mt-4">
        <ScrollAnimation>
          <div className="p-4 text-white vh-100 d-flex justify-content-center align-items-center">
            <h1 className="display-1">Play Pictionary in a multimodal way.</h1>
          </div>
        </ScrollAnimation>

        <ScrollAnimation>
          <div
            id="stack1"
            className="note-container start vh-100 pt-5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={stack1Ref}
          >
            <section id="note1" className="note note1">
              <h1>Draw using gestures and facial features!</h1>
            </section>
            <section id="note2" className="note note2">
              <h1>Mouse Modality</h1>
              <img src={"src/assets/draw_mouse.gif"} alt="Mouse Mode" />
            </section>
            <section id="note3" className="note note3">
              <h1>Hand Modality</h1>
              <img src={"src/assets/gesturedraw.gif"} alt="Hand Mode" />
            </section>
            <section id="note4" className="note note4">
              <h1>Nose Modality</h1>
              <img src="src/assets/nosedraw.gif" alt="Nose Mode" />
            </section>
            <section id="note5" className="note note5">
              <img src={"src/assets/chindraw.gif"} alt="Chin Mode" />
              <h1>Chin Modality</h1>
            </section>
          </div>
        </ScrollAnimation>

        <ScrollAnimation>
          <div className="text-white vh-100">
            <h1 className="display-1">AI guesses what you draw.</h1>
          </div>
        </ScrollAnimation>

        <ScrollAnimation>
          {/* Histogram Section */}
          <div className="row vh-100">
            <div className="col-8 p-4 text-white">
              <p>Sketch Classifier</p>
              <div className="histogram" ref={histogramRef}>
                {predictions.map((prediction, index) => {
                  const isHighlighted = category === prediction.label;
                  return (
                    <div
                      className={`histogram-bar ${
                        isHighlighted ? "highlighted" : ""
                      }`}
                      key={index}
                    >
                      <div className="label">{prediction.label}</div>
                      <div className="bar-container">
                        <div
                          className="bar"
                          style={{
                            width:
                              barWidths[index] > 0
                                ? `${barWidths[index]}%`
                                : "0%",
                            transition:
                              barWidths[index] > 0
                                ? "width 3s ease-in-out"
                                : "none",
                          }}
                        >
                          <span
                            className="probability"
                            style={{
                              opacity: showProbabilities ? 1 : 0,
                              transition: "opacity 1s ease-in-out",
                            }}
                          >
                            {barWidths[index] > 0 &&
                              `${barWidths[index].toFixed(2)}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-4 paper ruled text-center">
              <div>
                <img
                  ref={paperImageRef}
                  src="src/assets/doodles/cat.png"
                  alt="Cat"
                  width="70%"
                  className={imageVisible ? "animate-sketch" : ""}
                />
              </div>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation>
          <div className="position-relative vh-100">
            <div className="pyro position-absolute w-100 translate-middle-y">
              <div className="before"></div>
              <div className="after"></div>
            </div>
            <div className="text-white h-100 d-flex flex-column justify-content-center align-items-center">
              <h1 className="display-4 text-center">
                The players who make the AI Sketch Classifier guess their
                drawings with higher confidence win!
              </h1>
              <Link to="/game">
                <button
                  type="button"
                  className="btn btn-outline-light btn-lg mt-2"
                >
                  Play
                </button>
              </Link>
              <br></br>
              <button
                type="button"
                className="btn btn-outline-light btn-md mt-3"
                onClick={scrollToTop}
              >
                Go to Top
              </button>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default Features;
