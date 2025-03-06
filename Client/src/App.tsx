import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dock } from './Components/Dock';
import IndoorNavigation from "./Components/MapContainer";
import { Navbar } from "./Components/Navbar";
import { FloorSwitcher } from "./Components/FloorSwitcher";
import { useState } from 'react';

export default function App() {
  const [currentFloor, setCurrentFloor] = useState<string>("G");
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [dockContent, setDockContent] = useState<React.ReactNode | null>(null);
  
  const handleCloseDock = () => {
    setIsDockOpen(false);
    setDockContent(null);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <IndoorNavigation
          currentFloor={currentFloor}
          setCurrentFloor={setCurrentFloor}
          setDockContent={setDockContent}
          setDockOpen={setIsDockOpen}
        />
        
        {/* Add the FloorSwitcher directly to the App component */}
        
        <Dock 
          isOpen={isDockOpen}
          onClose={handleCloseDock}
          currentFloor={currentFloor}
          setCurrentFloor={setCurrentFloor}
        >
          {dockContent}
        </Dock>
        <FloorSwitcher 
          currentFloor={currentFloor}
          setCurrentFloor={setCurrentFloor}
          className="fixed left-4 bottom-32 z-50" // Fixed position with high z-index
        />
      </div>
      
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </BrowserRouter>
  );
}
