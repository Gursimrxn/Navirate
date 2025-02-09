import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FloorSwitcher } from './FloorSwitcher';
import { navigationEvents } from '../services/eventService';
import { navigationService } from '../services/navigationService';

mapboxgl.accessToken = "pk.eyJ1IjoiY2VpaWEiLCJhIjoiY2lsMTE0aG9lMmRzenVnbTN0MWNsNW05MyJ9.XjKQqu9fpea2zovIcy5uZg";

interface PathPoint {
  coordinates: {
    x: number;
    y: number;
    floor: string;
  };
  name?: string;
}

interface BuildingFeature extends GeoJSON.Feature<GeoJSON.Geometry> {
  properties: {
    floor: string;
    [key: string]: any;
  };
}

interface BuildingData extends GeoJSON.FeatureCollection<GeoJSON.Geometry> {
  features: BuildingFeature[];
}

export default function IndoorNavigation() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [currentFloor, setCurrentFloor] = useState<string>("G");
  const [startId, setStartId] = useState("5");
  const [endId, setEndId] = useState("32");
  const [instructions, setInstructions] = useState<string[]>([]);
  const animationRef = useRef<number | null>(null);
  const latestPath = useRef<PathPoint[]>([]);
  const buildingData = useRef<BuildingData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper functions
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const getBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    startLat = toRad(startLat);
    startLng = toRad(startLng);
    destLat = toRad(destLat);
    destLng = toRad(destLng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let bearing = Math.atan2(y, x);
    bearing = toDeg(bearing);
    return (bearing + 360) % 360;
  };

  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    console.log(lng2);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const computeTurnByTurnInstructions = (path: PathPoint[]) => {
    const instructions: string[] = [];
    if (path.length < 2) return instructions;

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
  };

  const mergeStraightInstructions = (instructions: string[]) => {
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
  };

  // Map initialization
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [76.66067, 30.51638], // Updated coordinates
      zoom: 11, // Increased zoom level
      pitch: 20,
      bearing: 145,
      antialias: true,
    });

    map.current.on('load', async () => {
      try {
        const response = await fetch(`${window.location.origin}/test3.geojson`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: BuildingData = await response.json();
        console.log('Loaded GeoJSON data:', data);
        buildingData.current = data;

        if (!map.current) return;
        
        map.current.addSource('walls', { 
          type: 'geojson', 
          data,
          generateId: true
        });
        
        addWallLayers();
        fitMapToBounds();
      } catch (err) {
        console.error('Error loading/rendering building:', err);
      }
    });

    return () => {
      map.current?.remove();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Update floor layers when floor changes
  useEffect(() => {
    updateFloorFilter();
  }, [currentFloor]);

  useEffect(() => {
    const unsubscribe = navigationEvents.subscribe((start, end) => {
      setStartId(start);
      setEndId(end);
      calculateRoute();
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
    map.current?.fitBounds(bounds);
  };

  const updateFloorFilter = () => {
    if (!map.current) return;

    // Ensure the style is loaded and layers exist before setting filters
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

  const updateRouteColors = () => {
    if (!latestPath.current.length) return;

    const features = latestPath.current.slice(0, -1).map((p1, i) => {
      const p2 = latestPath.current[i + 1];
      const isCurrent = p1.coordinates.floor === currentFloor;
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [p1.coordinates.x, p1.coordinates.y],
            [p2.coordinates.x, p2.coordinates.y],
          ],
        },
        properties: {
          color: isCurrent ? '#30A953' : 'gray',
          opacity: isCurrent ? 1 : 0.3,
        },
      } as GeoJSON.Feature<GeoJSON.LineString>;
    });

    (map.current?.getSource('route') as mapboxgl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features,
    });
  };

  const calculateRoute = async () => {
    if (!endId) {
      console.error('Start or end ID missing');
      return;
    }

    // Stop any ongoing animation
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

      // Center map on the path
      if (map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        result.path.forEach((point: PathPoint) => {
          bounds.extend([point.coordinates.x, point.coordinates.y]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }

      // Setup route source if it doesn't exist
      if (!map.current?.getSource('route')) {
        map.current?.addSource('route', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
      }

      // Setup route layer if it doesn't exist
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
            'line-width': 3,
            'line-opacity': ['get', 'opacity']
          }
        });
      }

      // Start animation
      animateRoute(result.path);

    } catch (err) {
      console.error('Route calculation failed:', err);
    }
  };

  const animateRoute = (path: PathPoint[]) => {
    let progress = 0;
    const duration = 1000; // Animation duration in milliseconds
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      progress = Math.min((timestamp - startTime) / duration, 1);

      const totalSegments = path.length - 1;
      const currentSegment = Math.min(Math.floor(progress * totalSegments), totalSegments);
      const segmentProgress = (progress * totalSegments) % 1;

      const animatedFeatures = path.slice(0, currentSegment + 1).map((point, index) => {
        if (index === currentSegment && segmentProgress < 1) {
          // Interpolate the last segment
          const nextPoint = path[index + 1];
          const interpolatedPoint = {
            x: point.coordinates.x + (nextPoint.coordinates.x - point.coordinates.x) * segmentProgress,
            y: point.coordinates.y + (nextPoint.coordinates.y - point.coordinates.y) * segmentProgress
          };

          return {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [point.coordinates.x, point.coordinates.y],
                [interpolatedPoint.x, interpolatedPoint.y]
              ]
            },
            properties: {
              color: point.coordinates.floor === currentFloor ? '#30A953' : 'gray',
              opacity: point.coordinates.floor === currentFloor ? 1 : 0.3
            }
          } as GeoJSON.Feature;
        } else if (index < currentSegment) {
          // Add completed segments
          return {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [point.coordinates.x, point.coordinates.y],
                [path[index + 1].coordinates.x, path[index + 1].coordinates.y]
              ]
            },
            properties: {
              color: point.coordinates.floor === currentFloor ? '#30A953' : 'gray',
              opacity: point.coordinates.floor === currentFloor ? 1 : 0.3
            }
          } as GeoJSON.Feature;
        }
      }).filter((feature): feature is GeoJSON.Feature => feature !== undefined);

      // Update the route source
      (map.current?.getSource('route') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: animatedFeatures
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        // Ensure final state is rendered
        updateRouteColors();
      }
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative top-0 w-full h-screen">

      {/* Display instructions if available */}
      {instructions.length > 0 && (
        <div className="absolute z-10 top-4 right-4 bg-white p-4 rounded-lg shadow-md max-w-md">
          <h3 className="font-bold mb-2">Navigation Instructions:</h3>
          <ol className="list-decimal pl-4">
            {instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      )}
      
      <FloorSwitcher currentFloor={currentFloor} setCurrentFloor={setCurrentFloor} />
      
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}