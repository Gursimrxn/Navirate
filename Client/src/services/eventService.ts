type NavigationCallback = (startId: string, endId: string | { path: any[], type: string }) => void;

class NavigationEventService {
    private listeners: NavigationCallback[] = [];

    subscribe(callback: NavigationCallback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    emit(startId: string, endIdOrPath: string | { path: any[], type: string }) {
        this.listeners.forEach(callback => callback(startId, endIdOrPath));
    }
}

export const navigationEvents = new NavigationEventService();
