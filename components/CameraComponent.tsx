import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const CameraComponent = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoDims, setVideoDims] = useState({ width: 640, height: 480 });
  const [isDetecting, setIsDetecting] = useState(false);
  const isDetectingRef = useRef(false);
  const detectionInterval = useRef<number | null>(null);
  const noFaceDetectedTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    };

    const startVideo = async () => {
      if (navigator.mediaDevices.getUserMedia) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        
        if(video && canvas){
          video.srcObject = stream;

          video.addEventListener('play', () => {
            const displaySize = { width: video.width, height: video.height };
            faceapi.matchDimensions(canvas, displaySize);
            setVideoDims({ width: video.videoWidth, height: video.videoHeight });
          });
        }
      }
    };

    loadModels();
    startVideo();
  }, []);

  const startFaceDetection = async () => {
    if (!isDetecting) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if(video && canvas){
        const displaySize = { width: video.width, height: video.height };
  
        detectionInterval.current = window.setInterval(async () => {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          );
  
          if (detections.length > 1) {
            alert("Detected more than one face!");
          }
  
          if (detections.length === 0) {
            if (!noFaceDetectedTimeout.current) {
              noFaceDetectedTimeout.current = setTimeout(() => {
                alert("No face detected for 5 seconds!");
                noFaceDetectedTimeout.current = null;
              }, 5000);
            }
          } else {
            if(noFaceDetectedTimeout.current){
              clearTimeout(noFaceDetectedTimeout.current);
              noFaceDetectedTimeout.current = null;
            }
          }
  
          if (isDetectingRef.current) {
            const resizedDetections = faceapi.resizeResults(
              detections,
              displaySize
            );
    
            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
          }
        }, 100);
  
        isDetectingRef.current = true;
        setIsDetecting(true);
      }
    }
  };

  const stopFaceDetection = () => {
    if (isDetecting) {
      if(detectionInterval.current){
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
      if(noFaceDetectedTimeout.current){
        clearTimeout(noFaceDetectedTimeout.current);
        noFaceDetectedTimeout.current = null;
      }
      const canvas = canvasRef.current;
      if(canvas){
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      }
      isDetectingRef.current = false;
      setIsDetecting(false);
    }
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          width={videoDims.width}
          height={videoDims.height}
          autoPlay
          playsInline
          muted
        ></video>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: videoDims.width,
            height: videoDims.height,
          }}
        ></canvas>
      </div>
      <div>
          <button onClick={startFaceDetection} disabled={isDetecting} className="btn btn-primary">Start Detection</button>
          <button onClick={stopFaceDetection} disabled={!isDetecting} className="btn btn-secondary">Stop Detection</button>
      </div>
    </div>
  );
};

export default CameraComponent;
