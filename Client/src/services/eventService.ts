import { PathPoint } from '../types/navigationTypes';
import { debugService } from '../utils/debugService';

export type EmergencyPath = {
  type: 'emergency';
  path?: PathPoint[];
};

type NavigationStatus = "started" | "completed" | "cancelled" | "failed";

type NavigationCallback = (startId: string, endId: string | EmergencyPath) => void;

class NavigationEventService {
    private listeners: NavigationCallback[] = [];
    private statusListeners: ((status: NavigationStatus, message?: string) => void)[] = [];

    subscribe(callback: NavigationCallback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    subscribeToStatus(callback: (status: NavigationStatus, message?: string) => void) {
        this.statusListeners.push(callback);
        return () => {
            this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
        };
    }

    emit(startId: string, endIdOrPath: string | EmergencyPath) {
        debugService.info(`Navigation event emitted: ${startId} → ${typeof endIdOrPath === 'string' ? endIdOrPath : 'emergency'}`);
        this.listeners.forEach(callback => callback(startId, endIdOrPath));
        this.statusListeners.forEach(callback => callback("started"));
    }

    complete() {
        debugService.info('Navigation complete');
        this.statusListeners.forEach(callback => callback("completed"));
    }

    cancel() {
        debugService.info('Navigation cancelled');
        this.statusListeners.forEach(callback => callback("cancelled"));
    }

    fail(message: string) {
        debugService.error(`Navigation failed: ${message}`);
        this.statusListeners.forEach(callback => callback("failed", message));
    }
}

export const navigationEvents = new NavigationEventService();
