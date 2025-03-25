import { BrowserRouter } from 'react-router-dom';
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

  // Track online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("App is online");
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log("App is offline - using cached data");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const selectedTheme = localStorage.getItem('theme') || 'system';
    document.documentElement.classList.add(selectedTheme);
  }, []);

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
        <div className="App min-h-screen w-full transition-colors duration-300 bg-white dark:bg-black text-black dark:text-white">
          {/* Debug indicator for dark mode */}
          <div className="fixed top-0 right-0 bg-white dark:bg-black text-black dark:text-white text-xs p-1 z-[9999]">
            {process.env.NODE_ENV === 'development' && (
              <span>Theme: {localStorage.getItem('theme') || 'system'} | 
                     Class: {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}</span>
            )}
          </div>
          
          <Navbar />
          {!isOnline && (
            <div className="fixed top-16 inset-x-0 bg-amber-100 dark:bg-red-900/60 text-amber-800 dark:text-white py-2 px-4 text-center z-50">
              You are offline. Using cached data.
            </div>
          )}
          <IndoorNavigation
            currentFloor={currentFloor}
            setCurrentFloor={setCurrentFloor}
            setDockContent={setDockContent}
            setDockOpen={setIsDockOpen}
            preloadedData={preloadService.getResource('buildingData')}
            isOnline={isOnline}
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
            className="fixed rounded-full left-4 bottom-40"
          />
        </div>
      </BrowserRouter>
  );
}