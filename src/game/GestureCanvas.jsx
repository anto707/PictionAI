import React, { useRef, useEffect, useState } from 'react';
import * as hands from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const GestureCanvas = ({ numPlayers, numRounds, playerNames }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [handVisible, setHandVisible] = useState(false); // New state to track hand visibility

  useEffect(() => {
    let isMounted = true; // Track if the component is still mounted
    const hand = new hands.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hand.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hand.onResults(onResults);

    // Function to start the camera
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        // Initialize MediaPipe Camera
        const cam = new Camera(videoRef.current, {
          onFrame: async () => {
            if (isMounted) {
              await hand.send({ image: videoRef.current });
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

    // Function to handle hand landmarks and drawing
    function onResults(results) {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setHandVisible(true); // Hand is detected

        const landmarks = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness[0].label; // "Right" or "Left"
        const indexFingerTip = landmarks[8];
        const indexFingerMiddle = landmarks[7];
        const thumbTip = landmarks[4];
        const thumbIP = landmarks[3]; // Thumb Interphalangeal joint

        const isIndexFingerExtended = indexFingerTip.y < indexFingerMiddle.y;

        // Check if the thumb is extended based on the handedness
        let isThumbExtended = false;
        if (handedness === 'Right') {
          isThumbExtended = thumbTip.x < thumbIP.x; // Thumb is extended when tip is to the left of the joint
        } else if (handedness === 'Left') {
          isThumbExtended = thumbTip.x > thumbIP.x; // Thumb is extended when tip is to the right of the joint
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const x = (1 - indexFingerTip.x) * canvasWidth;
        const y = indexFingerTip.y * canvasHeight;

        // Draw only if the index finger is extended and the thumb is extended
        if (isIndexFingerExtended && isThumbExtended) {
          if (!isDrawing) {
            setIsDrawing(true);
            ctx.beginPath();
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        } else {
          setIsDrawing(false);
          ctx.closePath();
        }
      } else {
        setHandVisible(false); // No hand detected
      }
    }

    // Cleanup function to stop the camera and close MediaPipe hand tracking
    return () => {
      isMounted = false; // Mark as unmounted
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      hand.close();
    };
  }, [isDrawing]); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // Function to clear the drawing on the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center justify-center relative mt-5 pt-5">
      <div style={{ width: '1000px', height: '700px', position: 'relative' }}>
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            clipPath: 'inset(0 0 150px 0)', // Clip the bottom portion
            opacity: 0.3,
            zIndex: 1,
            transform: 'scaleX(-1)',
          }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={1000}
          height={700}
          style={{
            zIndex: 2,
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'transparent',
          }}
        />
        {/* Message when hand is out of frame */}
        {!handVisible && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: 3,
          }}>
            Hand not visible! Please move your hand into the frame.
          </div>
        )}
      </div>

      {/* Sticky Note with Text */}
      <div style={{
        position: 'absolute',
        top: 0, // Adjust position as needed
        right: '10%', // Adjust position as needed
        zIndex: 4,
        width: '13%', // Adjust as needed
        textAlign: 'center',
      }}>
        <img
          style={{
            width: '100%', // Make the image fit the container width
            display: 'block',
          }}
          src="src/assets/stickynote.png"
          alt="Sticky Note"
        />
        <div
          style={{
            position: 'absolute',
            top: '50%', // Center text vertically
            left: '50%',
            transform: 'translate(-50%, -50%)', // Center text horizontally
            color: 'black', // Ensure text is visible on the image
            width: '90%', // Adjust to fit within the sticky note
          }}
        >
          <p>{playerNames[0]}'s turn</p>
          <p>Round 1 of {numRounds}</p>
        </div>
      </div>

      {/* Buttons overlaid on top of the canvas */}
      <div className="mt-4" style={{ position: 'absolute', top: '86%', left: '50%', transform: 'translateX(-50%)', zIndex: 4 }}>
        <button
          className="btn btn-outline-dark btn-light btn-md mx-2"
          onClick={() => {
            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const saveData = canvas.toDataURL(); // Example of saving canvas as an image
              console.log(saveData);
            }
          }}
        >
          Send Drawing
        </button>
        <button
          className="btn btn-outline-dark btn-light btn-md"
          onClick={clearCanvas}
        >
          Clear Drawing
        </button>
      </div>
    </div>
  );
};

export default GestureCanvas;
