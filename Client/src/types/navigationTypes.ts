export interface PathPoint {
  coordinates: {
    x: number;
    y: number;
    floor: string;
  };
  name?: string;
}

export interface BuildingFeature extends GeoJSON.Feature<GeoJSON.Geometry> {
  properties: {
    floor: string;
    [key: string]: any;
  };
}

export interface BuildingData extends GeoJSON.FeatureCollection<GeoJSON.Geometry> {
  features: BuildingFeature[];
}
