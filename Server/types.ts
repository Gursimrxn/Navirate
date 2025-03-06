export interface Coordinates {
  x: number;
  y: number;
  floor: string;
  building: string;
}

export interface PathPoint {
  id: string;
  name: string;
  coordinates: Coordinates;
}

export interface POI {
  id: string; // e.g., "building1-31"
  name: string;
  icon: string;
  status: string;
  color: string;
  nodeId: string; // e.g., "building1-31"
}

export interface Building {
  id: string;
  name: string;
  floors: string[];
  pois: POI[];
  exits: string[];
}

export interface BuildingData {
  id: string;
  name: string;
  floors: string[];
  nodes: Record<string, Coordinates>;
  connections: [string, string][];
  pois: { id: string; name: string; icon: string; status: string; color: string }[];
  exits: string[];
}
