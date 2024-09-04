import React, { useRef, useEffect, useState } from 'react';
import * as hands from '@mediapipe/hands';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { useNavigate } from 'react-router-dom';
import categories from '../categories/categories.json';

const GestureCanvas = ({ numPlayers, numRounds, playerNames, isPopupVisible }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [handVisible, setHandVisible] = useState(false);
  const [chinVisible, setChinVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // State variables for rounds and players
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(true); // Set to true initially
  const [currentCategory, setCurrentCategory] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const hand = new hands.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });


    hand.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });
  
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5, 
      });
  

    hand.onResults(onResults);

    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0 && !isPopupVisible) {
        setChinVisible(true);
        let { x, y, z } = results.multiFaceLandmarks[0][152];
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        x = (1 - x) * canvasWidth;
        y = y * canvasHeight;

        if(x){ // se mento non si vede
          if (!isDrawingRef.current) { 
            isDrawingRef.current = true;
            ctx.beginPath();
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        } else{
          isDrawingRef.current = false;
          ctx.closePath();
        }
          
      } else {
        setChinVisible(false);
      }
      });

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        const cam = new Camera(videoRef.current, {
          onFrame: async () => {
            if (isMounted) {
              await hand.send({ image: videoRef.current });
              await faceMesh.send({ image: videoRef.current });
              setIsReady(true);
            }
          },
          width: 1000,
          height: 700,
        });

        cam.start();
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }

    startCamera();

    function onResults(results) {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0 && !isPopupVisible) {
        setHandVisible(true);

        const landmarks = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness[0].label;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        if (!handVisible) {
          isDrawingRef.current = false;
          ctx.closePath();
        } 

      } else {
        setHandVisible(false);
      }
    }

    setCategoryForRound();

    // Initial show transition for the first player of the first round
    setTimeout(() => {
      setShowTransition(false); // Hide after showing for a few seconds
    }, 3000);

    return () => {
      isMounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      hand.close();
    };
  }, [isPopupVisible]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSendDrawing = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const saveData = canvas.toDataURL();
      console.log(saveData);
    }

    if (currentPlayerIndex === numPlayers - 1) {
      if (currentRound === numRounds) {
        alert("Game Over! All rounds completed.");
        navigate("/");
        return;
      }

      setCurrentRound((prevRound) => prevRound + 1);
      setCurrentPlayerIndex(0);
    } else {
      setCurrentPlayerIndex((prevIndex) => prevIndex + 1);
    }
    setCategoryForRound();
    setShowTransition(true);
    setTimeout(() => {
      setShowTransition(false);
    }, 3000);
  };

  const setCategoryForRound = () => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    setCurrentCategory(category);
  };

  return (
    <div className="mt-5 pt-5">
      {showTransition && (
        <div className="transition-screen">
          <div className='pencil-container'>
            <div className='tip'></div>
            <div className='wood'></div>
            <div className='yellow'></div>
            <div className='metal'></div>
            <div className='eraser'></div>
          </div>
          <div className="transition-text">
            {currentPlayerIndex === 0 ? `Round ${currentRound} starting!` : `Round ${currentRound}`} <br />
            {currentPlayerIndex < numPlayers && numPlayers !== 1 ? `${playerNames[currentPlayerIndex]}'s turn` : ''}
            <div className="category-display">Draw: {currentCategory}</div>
          </div>
        </div>
      )}

      <div className="canvas-video-container">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} width={1000} height={700} />
        {!chinVisible && (
          <div className={`chin-visibility-message opacity-${isReady ? 1 : 0}`}>
            Chin not visible! Please move your face into the frame.
          </div>
        )}
      </div>

      {/* Sticky Note for Round Info */}
      <div className={`sticky-container round-info py-2 opacity-${isReady ? 1 : 0}`}>
        <div className="sticky-outer">
          <div className="sticky">
            <svg width="0" height="0">
              <defs>
                <clipPath id="stickyClip" clipPathUnits="objectBoundingBox">
                  <path
                    d="M 0 0 Q 0 0.69, 0.03 0.96 0.03 0.96, 1 0.96 Q 0.96 0.69, 0.96 0 0.96 0, 0 0"
                    strokeLinejoin="round"
                    strokeLinecap="square"
                  />
                </clipPath>
              </defs>
            </svg>
            <div className="sticky-content">
              {playerNames[currentPlayerIndex]}'s turn <br />
              Round {currentRound} of {numRounds}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Note for Category to Draw */}
      <div className={`sticky-container category-draw py-2 opacity-${isReady ? 1 : 0}`}>
        <div className="sticky-outer">
          <div className="sticky">
            <svg width="0" height="0">
              <defs>
                <clipPath id="stickyClip" clipPathUnits="objectBoundingBox">
                  <path
                    d="M 0 0 Q 0 0.69, 0.03 0.96 0.03 0.96, 1 0.96 Q 0.96 0.69, 0.96 0 0.96 0, 0 0"
                    strokeLinejoin="round"
                    strokeLinecap="square"
                  />
                </clipPath>
              </defs>
            </svg>
            <div className="sticky-content">
              Category to draw: <br />
              {currentCategory}
            </div>
          </div>
        </div>
      </div>

      <div className={`buttons mt-4 opacity-${isReady ? 1 : 0}`}>
        <button
          className="btn btn-outline-dark btn-light btn-md mx-2"
          onClick={handleSendDrawing}
        >
          Send Drawing
        </button>
        <button className="btn btn-outline-dark btn-light btn-md" onClick={clearCanvas}>
          Clear Drawing
        </button>
      </div>
    </div>
  );
};

export default GestureCanvas;
