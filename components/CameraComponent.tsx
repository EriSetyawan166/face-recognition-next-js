import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoDims, setVideoDims] = useState({ width: 640, height: 480 });

  useEffect(() => {
    // Load face-api.js models and start face detection
    const loadModelsAndDetect = async () => {
      // Load the face-api.js models
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

      // Start face detection
      startFaceDetection();
    };

    loadModelsAndDetect();
  }, []);

  const startFaceDetection = async () => {
    if (navigator.mediaDevices.getUserMedia) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      video.srcObject = stream;

      video.addEventListener('play', () => {
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        // Update the video dimensions to match the actual video resolution
        setVideoDims({ width: video.videoWidth, height: video.videoHeight });

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          );

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
        }, 100);
      });
    }
  };

  return (
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
  );
};

export default CameraComponent;
