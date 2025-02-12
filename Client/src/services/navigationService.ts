import { navigationEvents } from "./eventService.ts";
import { config } from "../config.ts";

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
      const response = await fetch(`${BASE_URL}/path?start=${startId || '5'}&end=${endId}`, { mode: 'cors' });
      if (!response.ok) {
        throw new Error("Failed to calculate route");
      }
      return await response.json();
    } catch (error) {
      console.error("Navigation error:", error);
      throw error;
    }
  }

  async calculateEmergencyRoute(startId: string | undefined) {
    try {
      const response = await fetch(`${BASE_URL}/path?start=${startId}&emergency=true`, { mode: 'cors' });
      if (!response.ok) {
        throw new Error("Failed to calculate emergency route");
      }
      return await response.json();
    } catch (error) {
      console.error("Navigation error:", error);
      throw error;
    }
  }
}

export const navigationService = new NavigationServiceImpl();
