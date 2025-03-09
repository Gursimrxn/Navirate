import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EmergencyPath, navigationEvents } from '../services/eventService';
import { navigationService } from '../services/navigationService';
import { PathPoint, BuildingData } from "../types/navigationTypes";
import { getBearing } from '../utils/navigationUtils';
import { DockRouteConfirmation } from './DockRouteConfirmation';

const ANIMATION_DURATION = 3000;
const CAMERA_MOVE_DURATION = 1500;
const DRAW_DELAY = 500;

const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

// const MAP_STYLE = "mapbox://styles/ceiia/cl8a9clfo00n314pmwmsvha8i";
const MAP_STYLE = "mapbox://styles/mapbox/standard";
const INITIAL_CENTER: [number, number] = [76.66070, 30.51738];

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function IndoorNavigation({ 
  currentFloor, 
  setCurrentFloor,
  setDockContent,
  setDockOpen,
  preloadedData = null,
  isOnline = true
}: { 
  currentFloor: string;
  setCurrentFloor: (floor: string) => void;
  setDockContent: (content: React.ReactNode | null) => void;
  setDockOpen: (isOpen: boolean) => void;
  preloadedData?: any;
  isOnline?: boolean;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [startId, setStartId] = useState("5");
  // endId is managed via confirmationDestination.id instead
  const animationRef = useRef<number | null>(null);
  const latestPath = useRef<PathPoint[]>([]);
  const buildingData = useRef<BuildingData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [confirmationDestination, setConfirmationDestination] = useState<{
    id: string, 
    name: string,
    description?: string,
    category?: string,
    coordinates: any
  } | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const [routeInfo, setRouteInfo] = useState<{steps: number, time: string}>({
    steps: 15, 
    time: "2"
  });

  const [shouldShowConfirmation, setShouldShowConfirmation] = useState(false);

  const getDestinationDescription = (destination: any) => {
    const descriptions: Record<string, string> = {
      'facilities': 'Public facilities available for all visitors.',
      'common': 'Common area for general use and information.',
      'exit': 'Main exit point of the building.',
      'medical': 'Medical services and first aid available here.',
      'classroom': 'Teaching space for students and faculty.',
      'office': 'Administrative or faculty office space.'
    };
    
    return descriptions[destination.category?.toLowerCase()] || 
      `Location inside the building. Navigate here using the map.`;
  };

  const initRouteLayer = useCallback((mapInstance: mapboxgl.Map) => {
    try {
      if (mapInstance.getSource('route')) {
        console.log("Route source already exists");
        return;
      }
      
      console.log("Adding route source and layer");
      
      mapInstance.addSource('route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 6,
          'line-opacity': ['get', 'opacity']
        },
        minzoom: 0,
        maxzoom: 22
      });
      
      console.log("Route layer created successfully");
    } catch (err) {
      console.error("Failed to initialize route layer:", err);
    }
  }, []);

  const generateRouteFeatures = useCallback((path: PathPoint[], floor: string, emergency: boolean) => {
    return path.slice(0, -1).map((p1, i) => {
      const p2 = path[i + 1];
      const pathFloor = (p1.coordinates.floor || "").toLowerCase();
      const currentMapFloor = (floor || "").toLowerCase();
      const isCurrent = pathFloor === currentMapFloor;
      
      return {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: [[p1.coordinates.x, p1.coordinates.y], [p2.coordinates.x, p2.coordinates.y]]
        },
        properties: {
          color: emergency ? '#FF0000' : (isCurrent ? '#30A953' : 'gray'),
          opacity: isCurrent ? 1 : 0.3,
          floor: p1.coordinates.floor
        }
      };
    });
  }, []);

  const updateRouteColors = useCallback(() => {
    if (!latestPath.current.length || !map.current) return;
    
    try {
      if (!map.current.getSource('route')) {
        console.log("Route source missing, initializing route layer");
        initRouteLayer(map.current);
        return;
      }
      
      const features = generateRouteFeatures(latestPath.current, currentFloor, isEmergency);
      
      if (map.current.getSource('route')) {
        (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features
        });
        console.log(`Route updated with ${features.length} features for floor ${currentFloor}`);
      }
    } catch (error) {
      console.error("Error updating route colors:", error);
    }
  }, [currentFloor, isEmergency, generateRouteFeatures, initRouteLayer]);

  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  const updateFloorFilter = useCallback(() => {
    if (!map.current) return;

    try {
      if (
        !map.current.isStyleLoaded() ||
        !map.current.getLayer('wallsFill') ||
        !map.current.getLayer('wallsOutline')
      ) {
        setTimeout(updateFloorFilter, 100);
        return;
      }

      const floorValue = currentFloor.toLowerCase();
      console.log(`Setting wall filters to floor: ${floorValue} (from ${currentFloor})`);
      
      try {
        map.current.setFilter('wallsFill', ['==', ['get', 'floor'], currentFloor]);
        map.current.setFilter('wallsOutline', ['==', ['get', 'floor'], currentFloor]);
      } catch (err) {
        console.error("Error updating wall filters:", err);
      }
      
      updateRouteColors();
      
    } catch (error) {
      console.error("Error in updateFloorFilter:", error);
    }
  }, [currentFloor, updateRouteColors]);

  const animateRoute = useCallback((path: PathPoint[]) => {
    if (!map.current || path.length < 2) {
      console.error("Cannot animate: map or path not ready");
      return;
    }

    console.log("Animating route with path length:", path.length);
    cleanupAnimation();

    try {
      const startPoint = path[0].coordinates;
      const nextPoint = path[1].coordinates;
      
      map.current.easeTo({
        padding: { top: 200, bottom: 200},
        center: [startPoint.x, startPoint.y - 0.00025],
        bearing: getBearing(startPoint.y, startPoint.x, nextPoint.y, nextPoint.x),
        pitch: 0,
        zoom: 19,
        duration: CAMERA_MOVE_DURATION,
        easing: easeOutQuart
      });

      let rafId: number;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const rawProgress = Math.min((elapsed - DRAW_DELAY) / ANIMATION_DURATION, 1);
        
        const progress = rawProgress < 0 ? 0 : easeOutQuart(rawProgress);
        const totalLength = path.length - 1;
        const exactSegment = progress * totalLength;
        const currentSegment = Math.floor(exactSegment);
        const segmentProgress = exactSegment - currentSegment;

        const animatedFeatures = generateAnimatedFeatures(path, currentSegment, segmentProgress);

        try {
          (map.current?.getSource('route') as mapboxgl.GeoJSONSource)?.setData({
            type: 'FeatureCollection',
            features: animatedFeatures
          });
        } catch (err) {
          console.error("Error updating route source:", err);
        }

        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        } else {
          console.log("Animation complete");
          setIsAnimating(false);
          updateRouteColors();
          if (!isEmergency) {
            navigationService.completeNavigation();
          }
        }
      };

      setIsAnimating(true);
      rafId = requestAnimationFrame(animate);
      
      animationRef.current = rafId;
    } catch (err) {
      console.error("Error in route animation:", err);
    }
  }, [currentFloor, isEmergency, updateRouteColors, cleanupAnimation]);

  const generateAnimatedFeatures = useCallback((
    path: PathPoint[],
    currentSegment: number,
    segmentProgress: number
  ): GeoJSON.Feature[] => {
    const animatedFeatures: GeoJSON.Feature[] = [];

    for (let i = 0; i < currentSegment; i++) {
      const p = path[i];
      const next = path[i + 1];
      
      const pathFloor = (p.coordinates.floor || "").toLowerCase();
      const mapFloor = (currentFloor || "").toLowerCase();
      const isCurrentFloor = pathFloor === mapFloor;
      
      animatedFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[p.coordinates.x, p.coordinates.y], [next.coordinates.x, next.coordinates.y]]
        },
        properties: {
          color: isEmergency ? '#FF0000' : (isCurrentFloor ? '#30A953' : 'gray'),
          opacity: isCurrentFloor ? 1 : 0.3,
          floor: p.coordinates.floor
        }
      });
    }

    if (currentSegment < path.length - 1) {
      const p = path[currentSegment];
      const next = path[currentSegment + 1];
      
      const pathFloor = (p.coordinates.floor || "").toLowerCase();
      const mapFloor = (currentFloor || "").toLowerCase();
      const isCurrentFloor = pathFloor === mapFloor;
      
      const interpolatedPoint = {
        x: p.coordinates.x + (next.coordinates.x - p.coordinates.x) * segmentProgress,
        y: p.coordinates.y + (next.coordinates.y - p.coordinates.y) * segmentProgress
      };

      animatedFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[p.coordinates.x, p.coordinates.y], [interpolatedPoint.x, interpolatedPoint.y]]
        },
        properties: {
          color: isEmergency ? '#FF0000' : (isCurrentFloor ? '#30A953' : 'gray'),
          opacity: isCurrentFloor ? 1 : 0.3,
          floor: p.coordinates.floor
        }
      });
    }

    return animatedFeatures;
  }, [currentFloor, isEmergency]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: INITIAL_CENTER,
      zoom: 15.5,
      bearing: 182,
      antialias: true,
    });

    map.current = mapInstance;

    const handleLoad = async () => {
      try {
        let data;
        if (preloadedData) {
          console.log("Using preloaded building data");
          data = preloadedData;
        } else {
          console.log("Fetching building data");
          const response = await fetch('/test3.geojson');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          data = await response.json();
        }
        
        buildingData.current = data;
        
        if (!mapInstance.isStyleLoaded()) return;
        
        mapInstance.addSource('walls', { 
          type: 'geojson', 
          data,
          generateId: true
        });

        initRouteLayer(mapInstance);
        addWallLayers();
        fitMapToBounds();
      } catch (err) {
        console.error('Error loading/rendering building:', err);
      }
    };

    mapInstance.on('load', handleLoad);

    return () => {
      cleanupAnimation();
      mapInstance.remove();
    };
  }, [cleanupAnimation, initRouteLayer, preloadedData]);

  const handleEmergencyNavigation = useCallback(async () => {
    cleanupAnimation();
    setIsEmergency(true);
    try {
      const result = await navigationService.calculateEmergencyRoute(startId);
      if (!result?.path?.length) throw new Error('No valid emergency path found');

      latestPath.current = result.path;
      setCurrentFloor(result.path[0].coordinates.floor);
      animateRoute(result.path);
    } catch (err) {
      console.error('Emergency route calculation failed:', err);
      setIsEmergency(false);
    }
  }, [startId, cleanupAnimation, setCurrentFloor, animateRoute]);

  

  const addWallLayers = () => {
    if (!map.current?.getLayer('wallsFill')) {
      map.current?.addLayer({
        id: 'wallsFill',
        type: 'fill',
        source: 'walls',
        paint: { 'fill-color': '#CCE7D4', 'fill-opacity': 1 },
        filter: ['==', ['get', 'floor'], currentFloor],
      });
    }

    if (!map.current?.getLayer('wallsOutline')) {
      map.current?.addLayer({
        id: 'wallsOutline',
        type: 'line',
        source: 'walls',
        paint: { 'line-color': '#000', 'line-width': 0.5 },
        filter: ['==', ['get', 'floor'], currentFloor],
      });
    }
  };

  const fitMapToBounds = () => {
    const bounds = new mapboxgl.LngLatBounds();
    buildingData.current?.features.forEach((feature) => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord as [number, number]));
      }
    });
    map.current?.fitBounds(bounds, {
      padding: { top: 200, bottom: 200 },
      bearing: 182,
      pitch: 0,
      duration: 2000
    });
    if (latestPath.current.length >= 2) {
      const first = latestPath.current[0].coordinates;
      const second = latestPath.current[1].coordinates;
      const newBearing = getBearing(first.y, first.x, second.y, second.x);
      map.current?.rotateTo(newBearing, { duration: 1000 });
    }
  };

  const addDestinationMarker = useCallback((coordinates: {x: number, y: number, floor: string}) => {
    if (!map.current) return;
    
    if (destinationMarker.current) {
      destinationMarker.current.remove();
    }
    
    const markerElement = document.createElement('div');
    markerElement.className = 'destination-marker';
    markerElement.innerHTML = `
      <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
        <div class="w-5 h-5 bg-green-300 rounded-full"></div>
      </div>
    `;
    
    console.log("Adding marker at coordinates:", coordinates);
    
    destinationMarker.current = new mapboxgl.Marker(markerElement)
      .setLngLat([coordinates.x, coordinates.y])
      .addTo(map.current);
      
    setCurrentFloor(coordinates.floor);
  }, [setCurrentFloor]);

  const removeDestinationMarker = useCallback(() => {
    if (destinationMarker.current) {
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }
  }, []);
  
  const selectDestination = useCallback(async (startId: string, endId: string) => {
    try {
      console.log("Selecting destination:", startId, endId);
      
      setStartId(startId);
      // No longer need to set endId separately as it's part of confirmationDestination
      
      const destinations = await navigationService.getDestinations();
      const destination = destinations.find(d => d.id === endId);
      
      if (!destination) {
        throw new Error('Destination not found');
      }
      
      const nodeDetails = await navigationService.getNodeDetails(endId);
      
      if (!nodeDetails?.coordinates) {
        throw new Error('Could not find destination coordinates');
      }

      const estimatedRoute = await navigationService.estimateRouteInfo(startId, endId);
      
      const steps = Math.max(20, estimatedRoute.steps || 50);
      console.log("Estimated steps:", estimatedRoute.steps, "=>", steps);
      const time = estimatedRoute.time || "2";
      
      setRouteInfo({
        steps: steps,
        time: time
      });
      
      console.log("Route info set:", {steps, time});
      
      console.log("Selected destination:", destination.name, nodeDetails.coordinates);
      
      if (nodeDetails.coordinates.floor !== currentFloor) {
        setCurrentFloor(nodeDetails.coordinates.floor);
      }
      
      setTimeout(() => {
        addDestinationMarker(nodeDetails.coordinates);
        
        map.current?.flyTo({
          padding: { top: 200, bottom: 200, left: 200, right: 200 },
          center: [nodeDetails.coordinates.x, nodeDetails.coordinates.y],
          zoom: 19,
          pitch: 50,
          // bearing: 0,
          duration: 2000
        });
        
        setConfirmationDestination({
          id: endId,
          name: destination.name,
          category: destination.category,
          description: getDestinationDescription(destination),
          coordinates: nodeDetails.coordinates
        });
        
        setShouldShowConfirmation(true);
      }, 300);

      if (!isOnline) {
        const offlineNote = ' (Offline mode - some features limited)';
        setConfirmationDestination(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            description: (prevState.description || '') + offlineNote
          };
        });
      }
    } catch (err) {
      console.error('Error showing destination:', err);
    }
  }, [
    currentFloor,
    setCurrentFloor,
    addDestinationMarker,
    setRouteInfo,
    setConfirmationDestination,
    isOnline
  ]);


  const renderFullPath = useCallback((path: PathPoint[]) => {
    console.log("Rendering full path directly");
    if (!map.current || !path.length || !map.current.getSource('route')) return;
    
    try {
      const features = path.slice(0, -1).map((p1, i) => {
        const p2 = path[i + 1];
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: [[p1.coordinates.x, p1.coordinates.y], [p2.coordinates.x, p2.coordinates.y]]
          },
          properties: {
            color: isEmergency ? '#FF0000' : '#30A953',
            opacity: 1
          }
        };
      });
      
      console.log(`Rendering ${features.length} path segments`);
      
      (map.current.getSource('route') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features
      });
      
      if (map.current.getLayer('route')) {
        map.current.setLayoutProperty('route', 'visibility', 'visible');
      }
    } catch (err) {
      console.error("Failed to render full path:", err);
    }
  }, [isEmergency]);
  
  const handleStartRoute = useCallback(() => {
    if (!confirmationDestination) return;

    setDockOpen(false);
    setDockContent(null);

    let calculationStarted = false;
    
    setTimeout(() => {
      if (calculationStarted) return;
      calculationStarted = true;
      
      const currentStartId = startId || "5"; 
      const currentEndId = confirmationDestination.id;
      
      console.log("Starting route calculation:", currentStartId, currentEndId);
      
      if (!currentStartId || !currentEndId) {
        console.error('Missing IDs for route calculation');
        return;
      }
      
      navigationService.calculateRoute(currentStartId, currentEndId)
        .then(result => {
          if (!result?.path?.length) {
            throw new Error('No valid path found');
          }
          
          latestPath.current = result.path;
          setCurrentFloor(result.path[0].coordinates.floor);
          
          try {
            animateRoute(result.path);
          } catch (error) {
            renderFullPath(result.path);
          }
        })
        .catch(err => {
          console.error('Route calculation failed:', err);
        });
    }, 100);
  }, [
    confirmationDestination, 
    startId, 
    setDockOpen, 
    setDockContent, 
    setCurrentFloor, 
    animateRoute, 
    renderFullPath
  ]);
  
  const handleCancelNavigation = useCallback(() => {
    setDockOpen(false);
    setDockContent(null);
    removeDestinationMarker();
  }, [removeDestinationMarker, setDockContent, setDockOpen]);

  useEffect(() => {
    if (shouldShowConfirmation && confirmationDestination) {
      const showConfirmation = () => {
        const content = (
          <DockRouteConfirmation
            destination={{
              name: confirmationDestination.name,
              description: confirmationDestination.description,
              category: confirmationDestination.category
            }}
            steps={routeInfo.steps}
            time={routeInfo.time}
            onStartRoute={handleStartRoute}
            onCancel={handleCancelNavigation}
          />
        );
        
        setDockContent(content);
        setDockOpen(true);
        setShouldShowConfirmation(false);
      };
      
      setTimeout(showConfirmation, 1000);
    }
  }, [
    shouldShowConfirmation,
    confirmationDestination,
    routeInfo,
    handleStartRoute,
    handleCancelNavigation,
    setDockContent,
    setDockOpen
  ]);

  useEffect(() => {
    const unsubscribe = navigationEvents.subscribe((start, endIdOrPath: string | EmergencyPath) => {
      console.log("Navigation event received:", start || "5", endIdOrPath);
      
      if (typeof endIdOrPath === 'string') {
        const actualStartId = start || "5";
        console.log(`Setting start=${actualStartId}, end=${endIdOrPath}`);
        setStartId(actualStartId);
        // No longer using setEndId directly
        setIsEmergency(false);
        
        cleanupAnimation();
        removeDestinationMarker();
        
        selectDestination(actualStartId, endIdOrPath);
      } else if (endIdOrPath.type === "emergency") {
        setStartId(start || "5");
        handleEmergencyNavigation();
      }
    });

    return () => {
      unsubscribe();
      cleanupAnimation();
      removeDestinationMarker();
      setDockOpen(false);
      setDockContent(null);
    };
  }, [
    selectDestination, 
    handleEmergencyNavigation, 
    cleanupAnimation, 
    removeDestinationMarker,
    setDockOpen,
    setDockContent
  ]);

  useEffect(() => {
    if (!map.current) return;
    
    const styleDataHandler = () => {
      console.log("Map style data changed, checking layers");
      
      if (!map.current?.getSource('route')) {
        console.log("Re-initializing route layer after style change");
        initRouteLayer(map.current!);
      }
      
      setTimeout(() => {
        updateRouteColors();
      }, 100);
    };
    
    map.current.on('styledata', styleDataHandler);
    
    return () => {
      map.current?.off('styledata', styleDataHandler);
    };
  }, [initRouteLayer, updateRouteColors]);

  useEffect(() => {
    if (!map.current) return;
    
    console.log(`Floor changed to: ${currentFloor} - Updating map layers`);
    
    const updateVisuals = () => {
      if (!map.current?.isStyleLoaded()) {
        setTimeout(updateVisuals, 100);
        return;
      }
      
      cleanupAnimation(); 
      
      try {
        if (map.current.getLayer('wallsFill')) {
          map.current.setFilter('wallsFill', ['==', ['get', 'floor'], currentFloor]);
        }
        
        if (map.current.getLayer('wallsOutline')) {
          map.current.setFilter('wallsOutline', ['==', ['get', 'floor'], currentFloor]);
        }
        
        updateRouteColors();
        
        console.log(`Applied floor filter: '${currentFloor}'`);
      } catch (error) {
        console.error("Error updating floor filters:", error);
      }
    };
    
    updateVisuals();
  }, [currentFloor, cleanupAnimation, updateRouteColors]);

  return (
    <div className="relative top-0 w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      {isAnimating && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full">
        Navigating...
      </div>}
    </div>
  );
};
