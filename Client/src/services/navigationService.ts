import { navigationEvents } from "./eventService";

const BASE_URL = "http://localhost:5000/api"; // Ensure this URL matches your backend

export interface PathNode {
  id: string;
  name: string;
  coordinates: {
    x: number;
    y: number;
    floor: string;
  };
}

interface NavigationService {
  getPath: (startId: string, endId: string) => Promise<any>;
  calculateRoute: (startId: string, endId: string) => Promise<any>;
}

class NavigationServiceImpl implements NavigationService {
  async getPath(startId: string, endId: string): Promise<any> {
    try {
      const result = await this.calculateRoute(startId, endId);
      navigationEvents.emit("5", endId);
      return result;
    } catch (error) {
      console.error("Navigation error:", error);
      throw error;
    }
  }

  async calculateRoute(startId: string | undefined, endId: string) {
    try {
        const response = await fetch(`${BASE_URL}/path?start=5&end=${endId}`);
        console.log(startId);
      if (!response.ok) {
        throw new Error("Failed to calculate route");
      }
      return await response.json();
    } catch (error) {
      console.error("Navigation error:", error);
      throw error;
    }
  }
}

export const navigationService = new NavigationServiceImpl();
