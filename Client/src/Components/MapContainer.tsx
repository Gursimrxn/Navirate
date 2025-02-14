import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EmergencyPath, navigationEvents } from '../services/eventService';
import { navigationService } from '../services/navigationService';
import { PathPoint, BuildingData } from "../types/navigationTypes";
import { getBearing, haversineDistance } from '../utils/navigationUtils';

const ANIMATION_DURATION = 2000;
const CAMERA_MOVE_DURATION = 1500;
const DRAW_DELAY = 500;

// Smooth easing function
const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

const MAP_STYLE = "mapbox://styles/ceiia/cl8a9clfo00n314pmwmsvha8i";
const INITIAL_CENTER: [number, number] = [76.66067, 30.51638];

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function IndoorNavigation({ currentFloor, setCurrentFloor }: { 
  currentFloor: string;
  setCurrentFloor: (floor: string) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [startId, setStartId] = useState("5");
  const [endId, setEndId] = useState("32");
  const [instructions, setInstructions] = useState<string[]>([]);
  const animationRef = useRef<number | null>(null);
  const latestPath = useRef<PathPoint[]>([]);
  const buildingData = useRef<BuildingData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const computeTurnByTurnInstructions = useCallback((path: PathPoint[]) => {
    if (path.length < 2) return [];
    const instructions: string[] = [];
    const first = path[0].coordinates;
    const second = path[1].coordinates;
    let prevBearing = getBearing(first.y, first.x, second.y, second.x);
    const firstDist = Math.round(haversineDistance(first.y, first.x, second.y, second.x));

    if (path[0].name) {
      instructions.push(`Start at ${path[0].name}. Walk straight for ${firstDist} meters.`);
    } else {
      instructions.push(`Start: Walk straight for ${firstDist} meters.`);
    }

    for (let i = 1; i < path.length - 1; i++) {
      const curr = path[i].coordinates;
      const next = path[i + 1].coordinates;
      const currentBearing = getBearing(curr.y, curr.x, next.y, next.x);
      const segmentDistance = Math.round(haversineDistance(curr.y, curr.x, next.y, next.x));

      let turnAngle = currentBearing - prevBearing;
      while (turnAngle < -180) turnAngle += 360;
      while (turnAngle > 180) turnAngle -= 360;

      if (Math.abs(turnAngle) >= 30) {
        const turnDirection = turnAngle > 0 ? "right" : "left";
        instructions.push(
          segmentDistance === 0 
            ? `Turn ${turnDirection}.`
            : `Turn ${turnDirection} and walk for ${segmentDistance} meters.`
        );
        prevBearing = currentBearing;
      } else if (segmentDistance > 0) {
        instructions.push(`Continue straight for ${segmentDistance} meters.`);
      }

      if (path[i + 1].name?.toLowerCase().includes("lift")) {
        instructions.push("Enter the lift.");
      }
    }

    instructions.push("You have arrived at your destination.");
    return mergeStraightInstructions(instructions);
  }, []);

  const mergeStraightInstructions = useCallback((instructions: string[]) => {
    const merged: string[] = [];
    for (const instruction of instructions) {
      const last = merged[merged.length - 1];
      if (last?.startsWith("Continue straight") && instruction.startsWith("Continue straight")) {
        const prevDist = parseInt(last.match(/\d+/)![0]);
        const currDist = parseInt(instruction.match(/\d+/)![0]);
        merged[merged.length - 1] = `Continue straight for ${prevDist + currDist} meters.`;
      } else {
        merged.push(instruction);
      }
    }
    return merged;
  }, []);

  const initRouteLayer = useCallback((mapInstance: mapboxgl.Map) => {
    if (mapInstance.getSource('route')) return;
    
    mapInstance.addSource('route', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    mapInstance.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 5,
        'line-opacity': ['get', 'opacity']
      }
    });
  }, []);

  const generateRouteFeatures = useCallback((path: PathPoint[], floor: string, emergency: boolean) => {
    return path.slice(0, -1).map((p1, i) => {
      const p2 = path[i + 1];
      const isCurrent = p1.coordinates.floor === floor;
      return {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: [[p1.coordinates.x, p1.coordinates.y], [p2.coordinates.x, p2.coordinates.y]]
        },
        properties: {
          color: emergency ? '#FF0000' : (isCurrent ? '#30A953' : 'gray'),
          opacity: isCurrent ? 1 : 0.3,
        }
      };
    });
  }, []);

  const updateRouteColors = useCallback(() => {
    if (!latestPath.current.length || !map.current?.getSource('route')) return;

    const features = generateRouteFeatures(latestPath.current, currentFloor, isEmergency);
    
    (map.current?.getSource('route') as mapboxgl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features
    });
  }, [currentFloor, isEmergency, generateRouteFeatures]);

  // Add animation cleanup helper
  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  // Update floor change effect to handle animation
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;
    cleanupAnimation(); // Clean up any ongoing animation
    updateFloorFilter();
    updateRouteColors(); // Immediately show full path on new floor
  }, [currentFloor, cleanupAnimation, updateRouteColors]);

  const animateRoute = useCallback((path: PathPoint[]) => {
    if (!map.current || path.length < 2) return;

    cleanupAnimation(); // Ensure clean state before starting

    // Move camera to starting position with easing
    const startPoint = path[0].coordinates;
    const nextPoint = path[1].coordinates;
    map.current.easeTo({
      center: [startPoint.x, startPoint.y - 0.00025],
      bearing: getBearing(startPoint.y, startPoint.x, nextPoint.y, nextPoint.x),
      pitch: 60,
      zoom: 19.5,
      duration: CAMERA_MOVE_DURATION,
      easing: easeOutQuart
    });

    let rafId: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min((elapsed - DRAW_DELAY) / ANIMATION_DURATION, 1);
      
      // Enhanced easing for ultra-smooth animation
      const progress = rawProgress < 0 ? 0 : easeOutQuart(rawProgress);
      const totalLength = path.length - 1;
      const exactSegment = progress * totalLength;
      const currentSegment = Math.floor(exactSegment);
      const segmentProgress = exactSegment - currentSegment;

      const animatedFeatures: GeoJSON.Feature[] = [];

      // Draw completed segments
      for (let i = 0; i < currentSegment; i++) {
        const p = path[i];
        const next = path[i + 1];
        animatedFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[p.coordinates.x, p.coordinates.y], [next.coordinates.x, next.coordinates.y]]
          },
          properties: {
            color: isEmergency ? '#FF0000' : (p.coordinates.floor === currentFloor ? '#30A953' : 'gray'),
            opacity: p.coordinates.floor === currentFloor ? 1 : 0.3
          }
        });
      }

      // Add current animating segment with smooth interpolation
      if (currentSegment < totalLength) {
        const p = path[currentSegment];
        const next = path[currentSegment + 1];
        
        // Smooth interpolation between points
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
            color: isEmergency ? '#FF0000' : (p.coordinates.floor === currentFloor ? '#30A953' : 'gray'),
            opacity: p.coordinates.floor === currentFloor ? 1 : 0.3
          }
        });
      }

      (map.current?.getSource('route') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: animatedFeatures
      });

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        updateRouteColors();
      }
    };

    setIsAnimating(true);
    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [currentFloor, isEmergency, updateRouteColors, cleanupAnimation]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: INITIAL_CENTER,
      zoom: 13,
      antialias: true,
    });

    map.current = mapInstance;

    const handleLoad = async () => {
      try {
        const response = await fetch('/test3.geojson');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data: BuildingData = await response.json();
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
      mapInstance.remove();
      cleanupAnimation();
    };
  }, [cleanupAnimation]);

  useEffect(() => {
    const unsubscribe = navigationEvents.subscribe((start, endIdOrPath: string | EmergencyPath) => {
      if (start === startId && (
      (typeof endIdOrPath === 'string' && endIdOrPath === endId) ||
      (typeof endIdOrPath === 'object' && isEmergency)
      )) {
      return;
      }

      setStartId(start);
      
      if (typeof endIdOrPath === 'string') {
      setEndId(endIdOrPath);
      setIsEmergency(false);
      calculateRoute();
      } else if (endIdOrPath.type === "emergency") {
      setIsEmergency(true);
      }
    });

    return () => {
      unsubscribe();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
      pitch: 45,
      duration: 1000
    });
    if (latestPath.current.length >= 2) {
      const first = latestPath.current[0].coordinates;
      const second = latestPath.current[1].coordinates;
      const newBearing = getBearing(first.y, first.x, second.y, second.x);
      map.current?.rotateTo(newBearing, { duration: 1000 });
    }
  };

  const updateFloorFilter = () => {
    if (!map.current) return;

    if (
      !map.current.isStyleLoaded() ||
      !map.current.getLayer('wallsFill') ||
      !map.current.getLayer('wallsOutline')
    ) {
      map.current.once('render', updateFloorFilter);
      return;
    }

    map.current.setFilter('wallsFill', ['==', ['get', 'floor'], currentFloor]);
    map.current.setFilter('wallsOutline', ['==', ['get', 'floor'], currentFloor]);
    updateRouteColors();
  };

  const calculateRoute = async () => {
    cleanupAnimation(); // Clean up before calculating new route

    if (!startId || !endId) {
      console.error('Start or end ID missing');
      return;
    }

    if (isAnimating && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    }

    try {
      const result = await navigationService.calculateRoute(startId, endId);
      if (!result?.path?.length) {
        throw new Error('No valid path found');
      }

      latestPath.current = result.path;
      setInstructions(computeTurnByTurnInstructions(result.path));
      setCurrentFloor(result.path[0].coordinates.floor);

      if (map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        result.path.forEach((point: PathPoint) => {
          bounds.extend([point.coordinates.x, point.coordinates.y]);
        });
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 200, right: 200 },
          duration: 1000
        });
      }

      if (!map.current?.getSource('route')) {
        map.current?.addSource('route', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
      }

      if (!map.current?.getLayer('route')) {
        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 5,
            'line-opacity': ['get', 'opacity']
          }
        });
      }

      animateRoute(result.path);

    } catch (err) {
      console.error('Route calculation failed:', err);
    }
  };

  const handleEmergencyNavigation = useCallback(async () => {
    cleanupAnimation(); // Clean up before emergency navigation
    
    setIsEmergency(true);
    try {
      const result = await navigationService.calculateEmergencyRoute(startId);
      if (!result?.path?.length) {
        throw new Error('No valid emergency path found');
      }

      latestPath.current = result.path;
      setCurrentFloor(result.path[0].coordinates.floor);

      if (map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        result.path.forEach((point: PathPoint) => {
          bounds.extend([point.coordinates.x, point.coordinates.y]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }

      animateRoute(result.path);

    } catch (err) {
      console.error('Emergency route calculation failed:', err);
      setIsEmergency(false);
    }
  }, [startId, fitMapToBounds, cleanupAnimation]);

  return (
    <div className="relative top-0 w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}