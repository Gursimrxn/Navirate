import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dock } from './Components/Dock';
import IndoorNavigation from "./Components/MapContainer";
import { Navbar } from "./Components/Navbar";
import { FloorSwitcher } from "./Components/FloorSwitcher";
import { useState, useEffect } from 'react';
import SplashScreen from "./Components/Splashscreen";
import { preloadService } from './services/preloadService';

export default function App() {
  const [currentFloor, setCurrentFloor] = useState<string>("G");
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [dockContent, setDockContent] = useState<React.ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const handleCloseDock = () => {
    setIsDockOpen(false);
    setDockContent(null);
  };

  // Use the preload service to load all necessary data
  useEffect(() => {
    // Register progress callback
    preloadService.onProgress((progress) => {
      setLoadingProgress(progress);
      // When complete, set loading to false
      if (progress >= 100) {
        setIsLoading(false);
      }
    });
    
    // Start preloading
    preloadService.preloadAll();
  }, []);

  // Show splashscreen while loading
  if (isLoading || loadingProgress < 100) {
    return (
      <SplashScreen 
        isLoading={isLoading} 
        progress={loadingProgress} 
        onLoadComplete={() => setIsLoading(false)} 
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <IndoorNavigation
          currentFloor={currentFloor}
          setCurrentFloor={setCurrentFloor}
          setDockContent={setDockContent}
          setDockOpen={setIsDockOpen}
          // Pass preloaded data
          preloadedData={preloadService.getResource('buildingData')}
        />
        
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
          className="fixed left-4 bottom-32 z-50"
        />
      </div>
      
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </BrowserRouter>
  );
}
