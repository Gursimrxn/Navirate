import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dock } from './Components/Dock';
import IndoorNavigation from "./Components/MapContainer";
import { Navbar } from "./Components/Navbar";
import { useState } from 'react';

// A layout to render common elements (e.g., Dock) across pages.
interface LayoutProps {
  currentFloor: string;
  setCurrentFloor: (floor: string) => void;
}

function Layout({ currentFloor, setCurrentFloor }: LayoutProps) {
  return (
    <div>
      <Navbar />
      <IndoorNavigation currentFloor={currentFloor} setCurrentFloor={setCurrentFloor} />
      <Dock 
        currentFloor={currentFloor}
        setCurrentFloor={setCurrentFloor}
        // ...other props 
      />
    </div>
  );
}

export default function App() {
  const [currentFloor, setCurrentFloor] = useState<string>("G");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout currentFloor={currentFloor} setCurrentFloor={setCurrentFloor} />}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
