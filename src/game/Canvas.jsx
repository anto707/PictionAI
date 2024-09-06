import React, { useRef, useEffect, useState } from "react";
import * as hands from "@mediapipe/hands";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import fuzzysort from "fuzzysort";
import SpeechRecognition from "react-speech-recognition";
import { useSpeechRecognition } from "react-speech-recognition";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Tooltip } from "react-tooltip";
import categories from "../categories/categories.json";
import StickyNote from "../components/StickyNote";
import PredictionsPopup from "../components/PredictionsPopUp";
import "../dist/fireworks.css";

const TRANSITION_SCREEN_DURATION = 4000; // 4 seconds for transition screen

const Canvas = ({
  modality,
  numPlayers,
  numRounds,
  playerNames,
  isPopupVisible,
}) => {
  const canvasRef = useRef(null); // For drawing lines
  const dotCanvasRef = useRef(null); // For showing the red dot
  const videoRef = useRef(null);
  const isDrawingRef = useRef(false);
  const transitionTimeoutRef = useRef(null); // Store the timeout reference

  const [handVisible, setHandVisible] = useState(false);
  const [chinVisible, setChinVisible] = useState(false);
  const [noseVisible, setNoseVisible] = useState(false);

  const [isReady, setIsReady] = useState(false);
  const [isPredictionsPopupVisible, setIsPredictionsPopupVisible] =
    useState(false);
  const drawingModeRef = useRef(true);
  const [isDrawingMode, setIsDrawingMode] = useState(true);

  // State variables for rounds and players
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(true); // Set to true initially
  const [currentCategory, setCurrentCategory] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [scores, setScores] = useState(Array(numPlayers).fill(0));
  const [currentRoundScore, setCurrentRoundScore] = useState(0); // Points won in the current round
  const [winMessage, setWinMessage] = useState("");
  const [showPyro, setShowPyro] = useState(false);

  const navigate = useNavigate();
  const isGameOver =
    currentPlayerIndex === numPlayers - 1 &&
    currentRound === numRounds &&
    winMessage !== "";

  const [highlightClear, setHighlightClear] = useState(false);
  const [highlightSend, setHighlightSend] = useState(false);
  const [highlightSkip, setHighlightSkip] = useState(false);

  const commandList = ["clear", "send", "skip", "draw", "erase"];

  const commands = [
    {
      command: "clear",
      callback: () => {
        clearCanvas();
        setHighlightClear(true);
        setTimeout(() => setHighlightClear(false), 500);
      },
    },
    {
      command: "send",
      callback: () => {
        handleSendDrawing();
        setHighlightSend(true);
        setTimeout(() => setHighlightSend(false), 500);
      },
    },
    {
      command: "skip",
      callback: () => {
        handleClosePredictionsPopup();
        setHighlightSkip(true);
        setTimeout(() => setHighlightSkip(false), 500);
      },
    },
    {
      command: "draw",
      callback: () => {
        handleDrawClick();
      },
    },
    {
      command: "erase",
      callback: () => {
        handleEraseClick();
      },
    },
  ];

  const fuzzyMatchCommand = (spokenCommand) => {
    const result = fuzzysort.go(spokenCommand, commandList, {
      threshold: -100,
    });
    return result[0] ? result[0].target : null;
  };

  const executeCommand = (spokenCommand) => {
    const matchedCommand = fuzzyMatchCommand(spokenCommand);
    if (matchedCommand) {
      const commandObject = commands.find(
        (cmd) => cmd.command === matchedCommand
      );
      if (commandObject) {
        commandObject.callback();
      }
    }
  };

  // Speech recognition initialization
  useSpeechRecognition({
    commands: [
      {
        command: "*",
        callback: (spokenCommand) => {
          executeCommand(spokenCommand);
        },
      },
    ],
  });

  useEffect(() => {
    if (modality !== "mouse") {
      if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        console.warn("Speech recognition not supported in this browser.");
        return;
      }

      SpeechRecognition.startListening({ continuous: true, language: "en-US" });

      return () => {
        SpeechRecognition.stopListening();
      };
    }
  }, []);

  useEffect(() => {
    if (!isGameOver) {
      setCategoryForRound();
      startTransition();
    }
  }, []);

  useEffect(() => {
    let hand;
    let faceMesh;
    let cam;

    if (modality !== "mouse") {
      let isMounted = true;
      hand = new hands.Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hand.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hand.onResults(onResultsHands);

      if (modality === "chin" || modality === "nose") {
        faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(onResultsFace);
      }

      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });

          videoRef.current.srcObject = stream;

          // Wait for the video to load metadata to get its dimensions
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });

          // Update the canvas size to match the video size
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;

          if (canvasRef.current) {
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
          }
          if (dotCanvasRef.current) {
            dotCanvasRef.current.width = videoWidth;
            dotCanvasRef.current.height = videoHeight;
          }

          cam = new Camera(videoRef.current, {
            onFrame: async () => {
              if (isMounted) {
                await hand.send({ image: videoRef.current });
                if (modality === "chin" || modality === "nose") {
                  await faceMesh.send({ image: videoRef.current });
                }
                setIsReady(true);
              }
            },
            width: videoWidth,
            height: videoHeight,
          });

          cam.start();
        } catch (error) {
          console.error("Error accessing camera:", error);
        }
      }

      startCamera();

      const smoothPoints = [];
      const smoothingFactor = 5; // Number of points to average

      function smoothPoint(x, y) {
        smoothPoints.push({ x, y });
        if (smoothPoints.length > smoothingFactor) {
          smoothPoints.shift(); // Remove the oldest point
        }

        const avgX =
          smoothPoints.reduce((sum, point) => sum + point.x, 0) /
          smoothPoints.length;
        const avgY =
          smoothPoints.reduce((sum, point) => sum + point.y, 0) /
          smoothPoints.length;

        return { x: avgX, y: avgY };
      }

      function onResultsHands(results) {
        if (modality === "hand") {
          const dotCanvas = dotCanvasRef.current;
          const dotCtx = dotCanvas.getContext("2d");

          // Clear only the dot canvas before drawing the dot
          dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);

          if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0 &&
            !isPopupVisible &&
            !isPredictionsPopupVisible &&
            !showTransition
          ) {
            setHandVisible(true);

            const landmarks = results.multiHandLandmarks[0];
            const handedness = results.multiHandedness[0].label;
            const indexFingerTip = landmarks[8];
            const indexFingerMiddle = landmarks[7];
            const thumbTip = landmarks[4];
            const thumbIP = landmarks[3];

            const isIndexFingerExtended =
              indexFingerTip.y < indexFingerMiddle.y;
            let isThumbExtended = false;
            if (handedness === "Right") {
              isThumbExtended = thumbTip.x < thumbIP.x;
            } else if (handedness === "Left") {
              isThumbExtended = thumbTip.x > thumbIP.x;
            }

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const a = (1 - indexFingerTip.x) * canvasWidth;
            const b = indexFingerTip.y * canvasHeight;

            const { x, y } = smoothPoint(a, b);

            // Draw the red dot at the index finger tip position on the dot canvas
            dotCtx.beginPath();
            dotCtx.arc(x, y, 2, 0, 2 * Math.PI);
            dotCtx.fillStyle = "red";
            dotCtx.fill();

            if (isIndexFingerExtended && isThumbExtended) {
              if (drawingModeRef.current) {
                // Drawing mode
                ctx.globalCompositeOperation = "source-over";
                ctx.lineWidth = 2;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.strokeStyle = "black";
                ctx.filter = "blur(0.5px)";

                if (!isDrawingRef.current) {
                  isDrawingRef.current = true;
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                  ctx.stroke();
                }
              } else {
                // Erase mode
                ctx.globalCompositeOperation = "destination-out";
                ctx.lineWidth = 15;
                ctx.beginPath();
                ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2, false);
                ctx.fill();
              }
            } else {
              isDrawingRef.current = false;
              ctx.closePath();
            }
          } else {
            setHandVisible(false);
            // Clear dot canvas when the hand is not visible
            dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
          }
        } else if (modality === "chin" || modality === "nose") {
          if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0 &&
            !isPopupVisible
          ) {
            setHandVisible(true);
            isDrawingRef.current = false;
          } else {
            setHandVisible(false);
          }
        }
      }
      function onResultsFace(results) {
        const dotCanvas = dotCanvasRef.current;
        const dotCtx = dotCanvas.getContext("2d");

        dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);

        if (
          results.multiFaceLandmarks &&
          results.multiFaceLandmarks.length > 0 &&
          !isPopupVisible &&
          !isPredictionsPopupVisible &&
          !showTransition
        ) {
          let x, y;
          if (modality === "chin") {
            setChinVisible(true);
            ({ x, y } = results.multiFaceLandmarks[0][152]);
          } else if (modality === "nose") {
            setNoseVisible(true);
            ({ x, y } = results.multiFaceLandmarks[0][1]);
          }

          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          x = (1 - x) * canvasWidth;
          y = y * canvasHeight;

          const { x: smoothX, y: smoothY } = smoothPoint(x, y);

          dotCtx.beginPath();
          dotCtx.arc(smoothX, smoothY, 2, 0, 2 * Math.PI);
          dotCtx.fillStyle = "red";
          dotCtx.fill();

          if (drawingModeRef.current) {
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = 2;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.strokeStyle = "black";
            ctx.filter = "blur(0.5px)";

            if (!isDrawingRef.current) {
              isDrawingRef.current = true;
              ctx.beginPath();
              ctx.moveTo(smoothX, smoothY);
            } else {
              ctx.lineTo(smoothX, smoothY);
              ctx.stroke();
            }
          } else {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.arc(smoothX, smoothY, ctx.lineWidth / 2, 0, Math.PI * 2, false);
            ctx.fill();
          }
        } else {
          if (modality === "chin") {
            setChinVisible(false);
          } else if (modality === "nose") {
            setNoseVisible(false);
          }
          dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
        }
      }

      return () => {
        isMounted = false;
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        }
        hand.close();
        if (modality === "chin" || modality === "nose") {
          faceMesh.close();
        }
        if (cam) {
          cam.stop();
        }
      };
    }
  }, [isPopupVisible, isPredictionsPopupVisible, showTransition]);

  useEffect(() => {
    if (modality === "mouse") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const updateCanvasSize = () => {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      // Initial update of canvas size
      updateCanvasSize();

      // Adjust canvas size on window resize
      window.addEventListener("resize", updateCanvasSize);

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setIsReady(true);

      // Canvas offset relative to viewport
      const getCanvasOffset = () => {
        const rect = canvas.getBoundingClientRect();
        return {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
        };
      };

      const startDrawing = (event) => {
        isDrawingRef.current = true;

        const { left, top } = getCanvasOffset();
        const x = event.clientX - left;
        const y = event.clientY - top;

        // Canvas scaling
        const scaleX = canvas.width / canvas.clientWidth;
        const scaleY = canvas.height / canvas.clientHeight;

        ctx.beginPath();
        ctx.moveTo(x * scaleX, y * scaleY);
      };

      const draw = (event) => {
        if (!isDrawingRef.current) return;

        const { left, top } = getCanvasOffset();
        const x = event.clientX - left;
        const y = event.clientY - top;

        // Canvas scaling
        const scaleX = canvas.width / canvas.clientWidth;
        const scaleY = canvas.height / canvas.clientHeight;

        if (drawingModeRef.current) {
          ctx.strokeStyle = "black";
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.filter = "blur(0.5px)";
          ctx.lineWidth = 2;
          ctx.lineTo(x * scaleX, y * scaleY);
          ctx.stroke();
        } else {
          ctx.strokeStyle = "white";
          ctx.lineWidth = 15;
          ctx.beginPath();
          ctx.arc(
            x * scaleX,
            y * scaleY,
            ctx.lineWidth / 2,
            0,
            Math.PI * 2,
            false
          );
          ctx.fill();
        }
      };

      const stopDrawing = () => {
        isDrawingRef.current = false;
        ctx.closePath();
      };

      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
      canvas.addEventListener("mouseout", stopDrawing);

      return () => {
        canvas.removeEventListener("mousedown", startDrawing);
        canvas.removeEventListener("mousemove", draw);
        canvas.removeEventListener("mouseup", stopDrawing);
        canvas.removeEventListener("mouseout", stopDrawing);
        window.removeEventListener("resize", updateCanvasSize);
      };
    }
  }, []);

  const startTransition = () => {
    setShowTransition(true);
    clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setShowTransition(false);
    }, TRANSITION_SCREEN_DURATION);
  };

  const clearCanvas = () => {
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (modality === "mouse") {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const dotCanvas = dotCanvasRef.current;
      const dotCtx = dotCanvas.getContext("2d");
      dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
    }
  };

  const handleSendDrawing = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      const isCanvasEmpty = !data.some((value) => value !== 0);
      const isCanvasWhite = !data.some((value, index) => {
        if (index % 4 === 0) return false; // Skip red channel
        return value !== 255; // If any RGB channel value is not 255, it's not white
      });

      if (isCanvasEmpty || isCanvasWhite) {
        // If canvas is empty, skip to the next round
        handleClosePredictionsPopup();
        return;
      }

      const imageData = canvas.toDataURL("image/png").split(",")[1];

      fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      })
        .then((response) => response.json())
        .then((data) => {
          const sortedPredictions = data.predictions.sort(
            (a, b) => b.probability - a.probability
          );
          const topPredictions = sortedPredictions.slice(0, 4);
          setPredictions(topPredictions);
          setIsPredictionsPopupVisible(true); // Show the popup with predictions

          // Award points based on the predictions
          let points = 0;
          const currentCategoryPrediction = topPredictions.find(
            (prediction) => prediction.label === currentCategory
          );

          if (currentCategoryPrediction) {
            const predictionIndex = topPredictions.indexOf(
              currentCategoryPrediction
            );
            const probability = currentCategoryPrediction.probability;

            if (predictionIndex === 0) {
              points = 4 * probability; // 1st prediction
            } else if (predictionIndex === 1) {
              points = 3 * probability; // 2nd prediction
            } else if (predictionIndex === 2) {
              points = 2 * probability; // 3rd prediction
            } else if (predictionIndex === 3) {
              points = 1 * probability; // 4th prediction
            }
          }

          setCurrentRoundScore(points.toFixed(2)); // Set points for this round, fixed to 2 decimal places for readability

          // Update the score for the current player
          setScores((prevScores) => {
            const newScores = [...prevScores];
            newScores[currentPlayerIndex] += points;
            return newScores;
          });

          clearCanvas();
          handleDrawClick();
        })
        .catch((error) =>
          console.error("Error sending drawing to backend:", error)
        );
    }
  };

  const handleClosePredictionsPopup = () => {
    setIsPredictionsPopupVisible(false);
    clearCanvas();

    if (currentPlayerIndex === numPlayers - 1) {
      if (currentRound === numRounds) {
        const maxScore = Math.max(...scores);
        const allScoresZero = scores.every((score) => score === 0);
        const singlePlayerWithZeroScore = numPlayers === 1 && scores[0] === 0;

        if (singlePlayerWithZeroScore) {
          setWinMessage("No points scored. Better luck next time!");
          setShowPyro(false);
        } else if (allScoresZero) {
          setWinMessage("No one scored any points. It's a tie!");
          setShowPyro(false);
        } else {
          const winners = scores
            .map((score, index) => ({
              name: playerNames[index],
              score,
            }))
            .filter((player) => player.score === maxScore);

          if (winners.length === 1) {
            // Single winner
            setWinMessage(
              `${winners[0].name} wins the game with ${winners[0].score.toFixed(
                2
              )} points!`
            );
            setShowPyro(true);
          } else {
            // Multiple winners
            setWinMessage(
              `It's a tie! ${winners
                .map((winner) => `${winner.name} (${winner.score.toFixed(2)})`)
                .join(", ")} have the highest score.`
            );
            setShowPyro(false);
          }
        }

        return;
      }

      setCurrentRound((prevRound) => prevRound + 1);
      setCurrentPlayerIndex(0);
    } else {
      setCurrentPlayerIndex((prevIndex) => prevIndex + 1);
    }
    setCategoryForRound();
    startTransition();
  };

  const setCategoryForRound = () => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    setCurrentCategory(category);
  };

  const handleDrawClick = () => {
    drawingModeRef.current = true;
    setIsDrawingMode(true);
  };

  const handleEraseClick = () => {
    drawingModeRef.current = false;
    setIsDrawingMode(false);
  };

  return (
    <div className="mt-5 pt-5">
      {showTransition && (
        <div className="transition-screen">
          <div className="pencil-container">
            <div className="tip"></div>
            <div className="wood"></div>
            <div className="yellow"></div>
            <div className="metal"></div>
            <div className="eraser"></div>
          </div>
          <div className="transition-text">
            {currentPlayerIndex === 0
              ? `Round ${currentRound} starting!`
              : `Round ${currentRound}`}{" "}
            <br />
            {currentPlayerIndex < numPlayers && numPlayers !== 1
              ? `${playerNames[currentPlayerIndex]}'s turn`
              : ""}
            <div className="category-display">Draw: {currentCategory}</div>
          </div>
        </div>
      )}

      <div className="canvas-video-container">
        {modality !== "mouse" && (
          <video
            className="object-fit-cover"
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
        )}{" "}
        <canvas
          className={`drawingCanvas ${
            modality !== "mouse" ? "object-fit-cover" : ""
          }`}
          ref={canvasRef}
        />
        {modality !== "mouse" && (
          <canvas
            className="dotCanvas object-fit-cover"
            ref={dotCanvasRef}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
          />
        )}
        {!handVisible && modality === "hand" && (
          <div className={`visibility-message opacity-${isReady ? 1 : 0}`}>
            Hand not visible! Please move your hand into the frame.
          </div>
        )}
        {!chinVisible && modality === "chin" && (
          <div className={`visibility-message opacity-${isReady ? 1 : 0}`}>
            Chin not visible! Please move your face into the frame.
          </div>
        )}
        {!noseVisible && modality === "nose" && (
          <div className={`visibility-message opacity-${isReady ? 1 : 0}`}>
            Nose not visible! Please move your face into the frame.
          </div>
        )}
      </div>

      {/* Sticky Note for Round Info */}
      <div
        className={`sticky-container round-info py-2 opacity-${
          isReady ? 1 : 0
        }`}
      >
        <StickyNote>
          {playerNames[currentPlayerIndex]}'s turn <br />
          Round {currentRound} of {numRounds} <br />
          Current Points: {scores[currentPlayerIndex].toFixed(2)}
        </StickyNote>
      </div>

      {/* Sticky Note for Category to Draw */}
      <div
        className={`sticky-container category-draw py-2 opacity-${
          isReady ? 1 : 0
        }`}
      >
        <StickyNote>
          Category to draw: <br />
          {currentCategory}
          <div className="mt-2">
            <button
              data-tooltip-id="draw-btn"
              data-tooltip-content="Draw mode"
              data-tooltip-place="top"
              className={`mx-1 btn btn-md ${
                isDrawingMode ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={handleDrawClick}
            >
              <Icon icon="material-symbols-light:draw-outline" />
            </button>
            <button
              data-tooltip-id="erase-btn"
              data-tooltip-content="Erase mode"
              data-tooltip-place="top"
              className={`mx-1 btn btn-md ${
                !isDrawingMode ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={handleEraseClick}
            >
              <Icon icon="ph:eraser-light" />
            </button>
            <Tooltip id="draw-btn" />
            <Tooltip id="erase-btn" />
          </div>
        </StickyNote>
      </div>

      <div className={`buttons opacity-${isReady ? 1 : 0}`}>
        <button
          className={`btn btn-outline-success btn-light btn-md mx-2 ${
            highlightSend ? "active" : ""
          }`}
          onClick={handleSendDrawing}
        >
          Send Drawing
        </button>
        <button
          className={`btn btn-outline-dark btn-light btn-md mx-2 ${
            highlightClear ? "active" : ""
          }`}
          onClick={clearCanvas}
        >
          Clear Drawing
        </button>
        <br />
        <button
          className={`btn btn-outline-danger btn-light btn-md mx-2 mt-2 ${
            highlightSkip ? "active" : ""
          }`}
          onClick={handleClosePredictionsPopup}
        >
          Skip Round
        </button>
      </div>
      {isPredictionsPopupVisible && (
        <>
          <div className="overlay"></div>
          <PredictionsPopup
            onClose={handleClosePredictionsPopup}
            predictions={predictions}
            currentRoundScore={currentRoundScore}
            category={currentCategory}
          />
        </>
      )}
      {isGameOver && (
        <div className="overlay-dark">
          {showPyro && (
            <div className="pyro">
              <div className="before"></div>
              <div className="after"></div>
            </div>
          )}
          <div className="display-1">{winMessage}</div>
          {numPlayers > 1 && (
            <div className="mt-2 h4 mb-4">
              {/* Displaying the scores of all players */}
              <div>Scores:</div>
              {scores
                .map((score, index) => ({
                  name: playerNames[index],
                  score,
                }))
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div key={index}>
                    {player.name}: {player.score.toFixed(2)} points
                  </div>
                ))}
            </div>
          )}
          <button
            className="btn btn-outline-dark btn-light btn-lg mt-2"
            onClick={() => navigate("/")}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Canvas;
