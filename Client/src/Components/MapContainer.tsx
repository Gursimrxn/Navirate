import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FloorSwitcher } from './FloorSwitcher';

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
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [instructions, setInstructions] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const latestPath = useRef<PathPoint[]>([]);
  const buildingData = useRef<BuildingData | null>(null);

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
      center: [76.660575, 30.516264],
      zoom: 10,
      pitch: 0,
      bearing: 45,
      antialias: true,
    });

    map.current.on('load', async () => {
      try {
        const response = await fetch('/test3.geojson');
        const data: BuildingData = await response.json();
        buildingData.current = data;

        map.current?.addSource('walls', { type: 'geojson', data });
        addWallLayers();
        fitMapToBounds();
      } catch (err) {
        console.error('Error loading walls data:', err);
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
    if (isAnimating) {
      cancelAnimationFrame(animationRef.current!);
      setIsAnimating(false);
      map.current?.removeLayer('route');
      map.current?.removeSource('route');
    }

    if (!startId || !endId) {
      alert('Please enter both start and end IDs');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/path?start=${startId}&end=${endId}`
      );
      const result = await response.json();
      const path: PathPoint[] = result.path;

      if (!path?.length) {
        alert('No valid path found.');
        return;
      }

      latestPath.current = path;
      setInstructions(computeTurnByTurnInstructions(path));
      setCurrentFloor(path[0].coordinates.floor);

      if (!map.current?.getSource('route')) {
        map.current?.addSource('route', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }

      if (!map.current?.getLayer('route')) {
        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['interpolate', ['linear'], ['zoom'], 15, 0.5, 18, 6],
            'line-opacity': ['get', 'opacity'],
          },
        });
      }

      animateRoute(path);
    } catch (err) {
      console.error('API error:', err);
      alert('Error fetching route');
    }
  };

  const animateRoute = (path: PathPoint[]) => {
    let progress = 0;
    const duration = 500;
    let startTime: number | null = null;

    const animateFrame = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      progress = (timestamp - startTime) / duration;
      
      if (progress > 1) progress = 1;
      const totalSegments = path.length - 1;
      const animatedIndex = Math.floor(progress * totalSegments);
      const fraction = progress * totalSegments - animatedIndex;

      const animatedPath = path.slice(0, animatedIndex + 1);
      if (fraction > 0 && animatedIndex < totalSegments) {
        const currentPt = path[animatedIndex];
        const nextPt = path[animatedIndex + 1];
        animatedPath.push({
          coordinates: {
            x: currentPt.coordinates.x + (nextPt.coordinates.x - currentPt.coordinates.x) * fraction,
            y: currentPt.coordinates.y + (nextPt.coordinates.y - currentPt.coordinates.y) * fraction,
            floor: currentPt.coordinates.floor,
          },
        });
      }

      const features = animatedPath.slice(0, -1).map((p1, i) => ({
        type: "Feature",
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [p1.coordinates.x, p1.coordinates.y],
            [animatedPath[i + 1].coordinates.x, animatedPath[i + 1].coordinates.y],
          ],
        },
        properties: {
          color: p1.coordinates.floor === currentFloor ? '#30A953' : 'gray',
          opacity: p1.coordinates.floor === currentFloor ? 1 : 0.5,
        },
      }) as GeoJSON.Feature<GeoJSON.LineString, { color: string; opacity: number }>);

      (map.current?.getSource('route') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features,
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        setIsAnimating(false);
      }
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animateFrame);
  };

  return (
    <div className="relative top-0 w-full h-screen">
      
      <FloorSwitcher currentFloor={currentFloor} setCurrentFloor={setCurrentFloor} />
      
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}