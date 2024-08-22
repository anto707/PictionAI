import React, { useRef, useEffect, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import * as hands from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

function GestureCanvas() {
  const canvasRef = useRef();
  const videoRef = useRef();
  const cameraImageRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [camera, setCamera] = useState(null);

  useEffect(() => {
    // Initialize MediaPipe Hands
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

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Initialize MediaPipe Camera
        const cam = new Camera(videoRef.current, {
          onFrame: async () => {
            await hand.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });

        cam.start();
        setCamera(cam);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }

    startCamera();

    function onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
      
          const indexFingerTip = landmarks[8];
          const indexFingerMiddle = landmarks[7];
          const thumbTip = landmarks[4];
      
          const isIndexFingerExtended = indexFingerTip.y < indexFingerMiddle.y;
          const isThumbClose = Math.abs(indexFingerTip.x - thumbTip.x) < 0.05 && Math.abs(indexFingerTip.y - thumbTip.y) < 0.05;
      
          const canvas = canvasRef.current.canvas.drawing;
          const ctx = canvasRef.current.ctx.drawing;
          const x = indexFingerTip.x * canvas.width;
          const y = indexFingerTip.y * canvas.height;
      
          if (isIndexFingerExtended && !isThumbClose) {
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
        }
      }

    return () => {
      // Cleanup camera and handlers
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (camera) {
        camera.stop();
      }
      hand.close();
    };
  }, [isDrawing, camera]);

  return (
    <div className="flex flex-col items-center justify-center">
      <video ref={videoRef} preload="metadata" style={{ display: 'none' }} />
      <img ref={cameraImageRef} src="" style={{ opacity: 0.3, width: '100%', height: 'auto' }} />
      <CanvasDraw
        ref={canvasRef}
        brushColor="#000"
        brushRadius={2.5}
        canvasWidth={750}
        canvasHeight={500}
        hideGrid
      />
      <button
        className="block accent text-3xl"
        onClick={() => {
          if (canvasRef.current) {
            const saveData = canvasRef.current.getSaveData();
            console.log(saveData);
          }
        }}
      >
        Save Drawing
      </button>
    </div>
  );
}

export default GestureCanvas;
