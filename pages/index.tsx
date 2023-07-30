import React from 'react';
import CameraComponent from '../components/CameraComponent'; // Import the CameraComponent
import 'bootstrap/dist/css/bootstrap.css';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <CameraComponent />
    </main>
  );
}
