import { PathPoint } from '../types/navigation';

export type EmergencyPath = {
  type: 'emergency';
  path?: PathPoint[];
};

type NavigationCallback = (startId: string, endId: string | EmergencyPath) => void;

class NavigationEventService {
    private listeners: NavigationCallback[] = [];

    subscribe(callback: NavigationCallback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    emit(startId: string, endIdOrPath: string | EmergencyPath) {
        this.listeners.forEach(callback => callback(startId, endIdOrPath));
    }
}

export const navigationEvents = new NavigationEventService();
