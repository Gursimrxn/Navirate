import { config } from "../config.ts";
import { navigationEvents } from "./eventService";

const BASE_URL = config.apiBaseUrl;

export interface PathNode {
  id: string;
  name: string;
  coordinates: {
    x: number;
    y: number;
    floor: string;
  };
}

// Enhance the Destination interface
export interface Destination {
  id: string;
  name: string;
  category: string;
  description?: string; // Optional description
  floor?: string; // Optional floor info
}

interface NavigationService {
  getPath: (startId: string, endId: string) => Promise<any>;
  calculateRoute: (startId: string, endId: string) => Promise<any>;
}

class NavigationServiceImpl implements NavigationService {
  public isNavigating = false;

  // Define a constant for the building entry point
  private readonly BUILDING_ENTRY_ID = "5";

  async getPath(startId: string, endId: string): Promise<any> {
    try {
      const result = await this.calculateRoute(startId, endId);
      return result;
    } catch (error) {
      console.error("Navigation error:", error);
      throw error;
    }
  }

  // Update route calculation to normalize floor values
  async calculateRoute(startId: string | undefined, endId: string) {
    this.isNavigating = true;
    try {
      // Always use the building entry (5) as fallback for startId
      const actualStartId = startId || this.BUILDING_ENTRY_ID;
      
      const response = await fetch(`${BASE_URL}/path?start=${actualStartId}&end=${endId}`, { mode: 'cors' });
      if (!response.ok) {
        throw new Error("Failed to calculate route");
      }
      
      // Get the raw result data
      const result = await response.json();
      
      // Ensure path exists and has the right format
      if (!result.path || !Array.isArray(result.path) || result.path.length < 2) {
        // Create dummy path if the API doesn't return valid data
        const startNode = await this.getNodeDetails(startId || '5');
        const endNode = await this.getNodeDetails(endId);
        
        if (startNode && endNode) {
          // Create a simple path from start to end
          result.path = [
            {
              id: `node-${startId}`,
              coordinates: {
                x: startNode.coordinates.x,
                y: startNode.coordinates.y,
                floor: startNode.coordinates.floor // Ensure consistent floor value
              }
            },
            // Add a midpoint if coordinates are very different
            ...(Math.abs(startNode.coordinates.x - endNode.coordinates.x) > 0.001 ||
               Math.abs(startNode.coordinates.y - endNode.coordinates.y) > 0.001 ? [
              {
                id: 'midpoint',
                coordinates: {
                  x: (startNode.coordinates.x + endNode.coordinates.x) / 2,
                  y: (startNode.coordinates.y + endNode.coordinates.y) / 2,
                  floor: startNode.coordinates.floor
                }
              }
            ] : []),
            {
              id: `node-${endId}`,
              coordinates: {
                x: endNode.coordinates.x,
                y: endNode.coordinates.y,
                floor: endNode.coordinates.floor // Ensure consistent floor value
              }
            }
          ];
        } else {
          throw new Error("Could not create dummy path - missing node details");
        }
      }
      
      // Get route info to display in the navbar
      try {
        const routeInfo = await this.estimateRouteInfo(actualStartId, endId);
        const distance = Math.round(routeInfo.steps * 0.75).toString(); // Rough conversion of steps to meters
        navigationEvents.activateNavigation({
          distance: distance,
          time: routeInfo.time,
          steps: routeInfo.steps
        });
      } catch (error) {
        console.error("Could not estimate route info:", error);
      }
      
      return result;
    } catch (error) {
      navigationEvents.fail(error instanceof Error ? error.message : "Route calculation failed");
      this.isNavigating = false;
      throw error;
    }
  }

  async calculateEmergencyRoute(startId: string | undefined) {
    this.isNavigating = true;
    try {
      // Always use the building entry (5) as fallback for startId
      const actualStartId = startId || this.BUILDING_ENTRY_ID;
      
      const response = await fetch(`${BASE_URL}/path?start=${actualStartId}&emergency=true`, { mode: 'cors' });
      if (!response.ok) {
        throw new Error("Failed to calculate emergency route");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      navigationEvents.fail(error instanceof Error ? error.message : "Emergency route calculation failed");
      this.isNavigating = false;
      throw error;
    }
  }

  // Simplify getDestinations by removing caching
  async getDestinations(): Promise<Destination[]> {
    try {
      // Return static data directly without caching
      return [
        {
          id: "31",
          name: "Class 104",
          category: "common",
          description: "Classroom with seating for 30 students.",
          floor: "G"
        },
        {
          id: "26",
          name: "Reception",
          category: "common",
          description: "Main reception area with information desk and waiting area.",
          floor: "G"
        },
        {
          id: "32",
          name: "Lab 201",
          category: "common",
          description: "Computer Lab on Turing Block",
          floor: "1"
        },
        {
          id: "29",
          name: "Nurse Office",
          category: "medical",
          description: "First aid and medical assistance available. Open 9AM-5PM.",
          floor: "G"
        }
      ];
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
      return [];
    }
  }

  // Use exact node coordinates from graph.ts without caching
  async getNodeDetails(nodeId: string) {
    try {
      // Direct lookup from the static data without caching
      const nodes = {
        "5":  { name: "Main Door", coordinates: { x: 76.66057423511904, y: 30.516562768022, floor: "G" }},
        "6":  { name: "Main Entrance", coordinates: { x: 76.66057391235302, y: 30.51655136768173, floor: "G" }},
        "26": { name: "Wing Commander", coordinates: { x: 76.66052641626811, y: 30.516554638312158, floor: "G" }},
        "29": { name: "Classroom 4", coordinates: { x: 76.66052612466649, y: 30.51652851155896, floor: "G" }},
        "31": { name: "Classroom 4", coordinates: { x: 76.66053138417857, y: 30.516389098030473, floor: "G" }},
        "32": { name: "Makers Lab 005", coordinates: { x: 76.66063022327751, y: 30.516318146347587, floor: "1" }},
      };
      
      return nodes[nodeId as keyof typeof nodes] || null;
    } catch (error) {
      console.error("Failed to get node details:", error);
      return null;
    }
  }

  // Method to estimate route information (steps and time)
  async estimateRouteInfo(startId: string, endId: string): Promise<{steps: number, time: string}> {
    try {
      // Get the node details for both start and end points
      const startNode = await this.getNodeDetails(startId || this.BUILDING_ENTRY_ID);
      const endNode = await this.getNodeDetails(endId);
      
      if (startNode && endNode) {
        // Calculate distance between nodes 
        const dx = startNode.coordinates.x - endNode.coordinates.x;
        const dy = startNode.coordinates.y - endNode.coordinates.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Convert the distance to meters (approximate conversion)
        const distanceInMeters = distance * 111000;
        
        // Calculate steps based on average step length (approximately 0.75 meters per step)
        const averageStepLength = 0.75; // meters
        const calculatedSteps = Math.round(distanceInMeters / averageStepLength);
        
        // Ensure steps is always reasonable (between 20 and 200)
        const steps = Math.max(20, Math.min(200, calculatedSteps));
        
        // Calculate time based on average walking speed (approximately 1.4 meters per second)
        const walkingSpeed = 1.4; // meters per second
        const timeInSeconds = distanceInMeters / walkingSpeed;
        const timeInMinutes = Math.max(1, Math.ceil(timeInSeconds / 60));
        
        return {
          steps: steps,
          time: timeInMinutes.toString()
        };
      }
      
      // Default values with more realistic step count
      return {
        steps: 35,
        time: "2"
      };
    } catch (error) {
      // Keep just one error log as it's essential for troubleshooting
      console.error("Failed to estimate route info");
      // Fallback values
      return {
        steps: 35,
        time: "2"
      };
    }
  }

  // Call this when navigation is complete
  completeNavigation() {
    this.isNavigating = false;
    navigationEvents.complete();
  }

  // Call this to cancel navigation
  cancelNavigation() {
    this.isNavigating = false;
    navigationEvents.cancel();
  }

  // Call this when navigation is in progress with route info
  startNavigation(routeInfo: {steps: number, time: string}) {
    // Convert steps to approximate distance (using average step length)
    const distance = Math.round(routeInfo.steps * 0.75).toString(); // meters
    
    navigationEvents.activateNavigation({
      distance: distance,
      time: routeInfo.time,
      steps: routeInfo.steps
    });
  }
}

export const navigationService = new NavigationServiceImpl();
